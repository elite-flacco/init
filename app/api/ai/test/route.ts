import { NextRequest, NextResponse } from 'next/server'
import { getAIConfig } from '../config'

export async function GET() {
  try {
    const config = getAIConfig()
    
    return NextResponse.json({
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      // Don't expose the actual API key for security
      apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Not set'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get AI config' }, { status: 500 })
  }
}