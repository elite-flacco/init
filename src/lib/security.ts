import { NextRequest, NextResponse } from 'next/server'
import { TravelerType, Destination } from '../types/travel'
import { AITripPlanningResponse } from '../services/aiTripPlanningService'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface SecurityConfig {
  rateLimit: {
    maxRequests: number
    windowMs: number
  }
  allowedOrigins: string[]
  requireValidPlan: boolean
}

// Get allowed origins from environment variable or use development defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.SECURITY_ALLOWED_ORIGINS
  
  if (envOrigins) {
    // Parse comma-separated origins from environment variable
    return envOrigins.split(',').map(origin => origin.trim())
  }
  
  // Development defaults
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ]
}

const defaultConfig: SecurityConfig = {
  rateLimit: {
    maxRequests: 100, // 100 requests per 15 minutes (production setting)
    windowMs: 15 * 60 * 1000 // 15 minutes
  },
  allowedOrigins: getAllowedOrigins(),
  requireValidPlan: true
}

export class SecurityError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'SecurityError'
  }
}

export class SecurityMiddleware {
  /**
   * Get client IP address from request
   */
  static getClientIP(request: NextRequest): string {
    // Try various headers that might contain the real IP
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    if (realIP) {
      return realIP
    }
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    // Fallback to connection remote address
    return request.ip || 'unknown'
  }

  /**
   * Check rate limiting for IP address
   */
  static checkRateLimit(ip: string, config = defaultConfig): boolean {
    const now = Date.now()
    const key = `rate_limit:${ip}`
    const limit = rateLimitStore.get(key)

    if (!limit || now > limit.resetTime) {
      // First request or window expired, reset counter
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.rateLimit.windowMs
      })
      return true
    }

    if (limit.count >= config.rateLimit.maxRequests) {
      return false // Rate limit exceeded
    }

    // Increment counter
    limit.count++
    rateLimitStore.set(key, limit)
    return true
  }

  /**
   * Validate request origin to prevent basic CSRF
   */
  static validateOrigin(request: NextRequest, config = defaultConfig): boolean {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      // Allow requests without origin/referer
      if (!origin && !referer) {
        return true
      }
      
      // Allow any localhost origin in development
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return true
      }
      
      if (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) {
        return true
      }
    }

    // Check origin header
    if (origin && config.allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith(allowed)
    )) {
      return true
    }

    // Check referer as fallback
    if (referer && config.allowedOrigins.some(allowed => 
      referer.startsWith(allowed)
    )) {
      return true
    }

    return false
  }

  /**
   * Validate travel plan data structure and content
   */
  static validateTravelPlan(data: any): data is {
    destination: Destination
    travelerType: TravelerType
    aiResponse: AITripPlanningResponse
  } {
    if (!data || typeof data !== 'object') {
      return false
    }

    // Validate destination
    if (!data.destination || typeof data.destination !== 'object') {
      return false
    }
    
    const dest = data.destination
    if (!dest.id || !dest.name || typeof dest.id !== 'string' || typeof dest.name !== 'string') {
      return false
    }

    // Check for suspicious content in destination name
    if (this.containsSuspiciousContent(dest.name) || this.containsSuspiciousContent(dest.description || '')) {
      return false
    }

    // Validate traveler type
    if (!data.travelerType || typeof data.travelerType !== 'object') {
      return false
    }

    const traveler = data.travelerType
    if (!traveler.id || !traveler.name || typeof traveler.id !== 'string' || typeof traveler.name !== 'string') {
      return false
    }

    // Validate AI response structure
    if (!data.aiResponse || typeof data.aiResponse !== 'object') {
      return false
    }

    // Check for reasonable data sizes (prevent huge payloads)
    const jsonString = JSON.stringify(data)
    if (jsonString.length > 100000) { // 100KB limit
      return false
    }

    return true
  }

  /**
   * Check for suspicious content (spam, malicious links, etc.)
   */
  static containsSuspiciousContent(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false
    }

    const suspiciousPatterns = [
      /crypto/i,
      /bitcoin/i,
      /click here/i,
      /💸/,
      /🚨/,
      /free money/i,
      /hack/i,
      /spam/i,
      /virus/i,
      /malware/i,
      /phishing/i,
      /http:\/\/bit\.ly/i,
      /http:\/\/tinyurl/i,
      /<script/i,
      /javascript:/i,
      /eval\(/i,
      /document\.cookie/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Main security validation function
   */
  static async validateRequest(
    request: NextRequest,
    options: Partial<SecurityConfig> = {}
  ): Promise<void> {
    const config = { ...defaultConfig, ...options }
    
    // Get client IP
    const ip = this.getClientIP(request)

    // Check rate limiting
    if (!this.checkRateLimit(ip, config)) {
      throw new SecurityError('Rate limit exceeded. Please try again later.', 429)
    }

    // Validate origin (for POST requests)
    if (request.method === 'POST' && !this.validateOrigin(request, config)) {
      throw new SecurityError('Invalid request origin', 403)
    }

    // For POST requests, validate the request body if required
    if (request.method === 'POST' && config.requireValidPlan) {
      try {
        const body = await request.json()
        
        if (!this.validateTravelPlan(body)) {
          throw new SecurityError('Invalid travel plan data', 400)
        }

        // Store the parsed body for later use (avoid re-parsing)
        ;(request as any)._validatedBody = body
      } catch (error) {
        if (error instanceof SecurityError) {
          throw error
        }
        throw new SecurityError('Invalid JSON data', 400)
      }
    }
  }

  /**
   * Create a security-wrapped response with additional headers
   */
  static createSecureResponse(data: any, status = 200): NextResponse {
    const response = NextResponse.json(data, { status })
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  }

  /**
   * Handle security errors and return appropriate response
   */
  static handleSecurityError(error: Error): NextResponse {
    if (error instanceof SecurityError) {
      return this.createSecureResponse(
        { error: error.message },
        error.statusCode
      )
    }

    return this.createSecureResponse(
      { error: 'Internal server error' },
      500
    )
  }

  /**
   * Clean up old rate limit entries (call periodically)
   */
  static cleanupRateLimitStore(): void {
    const now = Date.now()
    for (const [key, limit] of rateLimitStore.entries()) {
      if (now > limit.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Cleanup rate limit store every 30 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    SecurityMiddleware.cleanupRateLimitStore()
  }, 30 * 60 * 1000)
}