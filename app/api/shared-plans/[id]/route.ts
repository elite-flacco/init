import { NextRequest, NextResponse } from 'next/server'
import { SharedPlanData, sharedPlans } from '../storage'

// GET /api/shared-plans/[id] - Retrieve a shared plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shareId = params.id
    console.log('Looking for share ID:', shareId)
    console.log('Current storage keys:', Array.from(sharedPlans.keys()))
    console.log('Storage size:', sharedPlans.size)

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    const sharedPlan = sharedPlans.get(shareId)
    console.log('Found shared plan:', !!sharedPlan)

    if (!sharedPlan) {
      return NextResponse.json(
        { error: 'Shared plan not found' },
        { status: 404 }
      )
    }

    // Check if the plan has expired
    const now = new Date()
    const expiresAt = new Date(sharedPlan.expiresAt)

    if (now > expiresAt) {
      // Clean up expired plan
      sharedPlans.delete(shareId)
      return NextResponse.json(
        { error: 'Shared plan has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      destination: sharedPlan.destination,
      travelerType: sharedPlan.travelerType,
      aiResponse: sharedPlan.aiResponse
    })

  } catch (error) {
    console.error('Error retrieving shared plan:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve shared plan' },
      { status: 500 }
    )
  }
}