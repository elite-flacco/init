import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { TravelerType, Destination } from '../../../src/types/travel'
import { AITripPlanningResponse } from '../../../src/services/aiTripPlanningService'
import { SharedPlanData, sharedPlans } from './storage'

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
    const body: CreateSharedPlanRequest = await request.json()

    if (!body.destination || !body.travelerType || !body.aiResponse) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const shareId = generateShareId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const sharedPlan: SharedPlanData = {
      id: shareId,
      destination: body.destination,
      travelerType: body.travelerType,
      aiResponse: body.aiResponse,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    }

    console.log('Storing shared plan with ID:', shareId)
    sharedPlans.set(shareId, sharedPlan)
    console.log('Storage size after insert:', sharedPlans.size)
    console.log('Storage keys after insert:', Array.from(sharedPlans.keys()))

    return NextResponse.json({
      shareId,
      shareUrl: `${request.nextUrl.origin}/share/${shareId}`,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Error creating shared plan:', error)
    return NextResponse.json(
      { error: 'Failed to create shared plan' },
      { status: 500 }
    )
  }
}