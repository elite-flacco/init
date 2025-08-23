import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { TravelerType, Destination } from "../../../src/types/travel";
import { AITripPlanningResponse } from "../../../src/services/aiTripPlanningService";
import { SharedPlanService } from "../../../src/services/sharedPlanService";
import { SecurityMiddleware } from "../../../src/lib/security";

export interface CreateSharedPlanRequest {
  destination: Destination;
  travelerType: TravelerType;
  aiResponse: AITripPlanningResponse;
}

function generateShareId(): string {
  return randomBytes(6).toString("hex");
}

// OPTIONS /api/shared-plans - Handle preflight CORS requests
export async function OPTIONS(request: NextRequest) {
  return SecurityMiddleware.createSecureResponse({}, 200, request);
}

// POST /api/shared-plans - Create a new shared plan
export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    await SecurityMiddleware.validateRequest(request, {
      rateLimit: {
        maxRequests: 5, // Allow 5 plan creations per 15 minutes
        windowMs: 15 * 60 * 1000,
      },
      requireValidPlan: true,
    });

    // Get the validated body from security middleware
    const body: CreateSharedPlanRequest =
      (request as { _validatedBody?: CreateSharedPlanRequest })
        ._validatedBody || (await request.json());

    // Additional validation for required fields
    if (!body.destination || !body.travelerType || !body.aiResponse) {
      return SecurityMiddleware.createSecureResponse(
        { error: "Missing required fields" },
        400,
        request
      );
    }

    const shareId = generateShareId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await SharedPlanService.createSharedPlan({
      id: shareId,
      destination: body.destination,
      travelerType: body.travelerType,
      aiResponse: body.aiResponse,
      expiresAt: expiresAt.toISOString(),
    });

    return SecurityMiddleware.createSecureResponse({
      shareId,
      shareUrl: `${request.nextUrl.origin}/share/${shareId}`,
      expiresAt: expiresAt.toISOString(),
    }, 200, request);
  } catch (error) {
    return SecurityMiddleware.handleSecurityError(error as Error, request);
  }
}
