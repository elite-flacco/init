import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { TravelerType, Destination } from '../../../src/types/travel'
import { AITripPlanningResponse } from '../../../src/services/aiTripPlanningService'
import { SharedPlanService } from '../../../src/services/sharedPlanService'
import { SecurityMiddleware } from '../../../src/lib/security'

export interface CreateSharedPlanRequest {
  destination: Destination
  travelerType: TravelerType
  aiResponse: AITripPlanningResponse
}

function generateShareId(): string {
  return randomBytes(6).toString('hex')
}

// POST /api/shared-plans - Create a new shared plan
export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    await SecurityMiddleware.validateRequest(request, {
      rateLimit: {
        maxRequests: 5, // Allow 5 plan creations per 15 minutes
        windowMs: 15 * 60 * 1000
      },
      requireValidPlan: true
    })

    // Get the validated body from security middleware
    const body: CreateSharedPlanRequest = (request as any)._validatedBody || await request.json()

    // Additional validation for required fields
    if (!body.destination || !body.travelerType || !body.aiResponse) {
      return SecurityMiddleware.createSecureResponse(
        { error: 'Missing required fields' },
        400
      )
    }

    const shareId = generateShareId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    const sharedPlan = await SharedPlanService.createSharedPlan({
      id: shareId,
      destination: body.destination,
      travelerType: body.travelerType,
      aiResponse: body.aiResponse,
      expiresAt: expiresAt.toISOString()
    })

    return SecurityMiddleware.createSecureResponse({
      shareId,
      shareUrl: `${request.nextUrl.origin}/share/${shareId}`,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Error creating shared plan:', error)
    return SecurityMiddleware.handleSecurityError(error as Error)
  }
}