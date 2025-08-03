import { NextRequest } from "next/server";
import { SharedPlanService } from "../../../../src/services/sharedPlanService";
import { SecurityMiddleware } from "../../../../src/lib/security";

// GET /api/shared-plans/[id] - Retrieve a shared plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Apply security middleware (more lenient for GET requests)
    await SecurityMiddleware.validateRequest(request, {
      rateLimit: {
        maxRequests: 30, // Allow 30 plan views per 15 minutes
        windowMs: 15 * 60 * 1000,
      },
      requireValidPlan: false, // No body validation for GET
    });

    const shareId = params.id;

    if (!shareId) {
      return SecurityMiddleware.createSecureResponse(
        { error: "Share ID is required" },
        400,
      );
    }

    // Validate shareId format (should be hex string)
    if (!/^[a-f0-9]+$/i.test(shareId)) {
      return SecurityMiddleware.createSecureResponse(
        { error: "Invalid share ID format" },
        400,
      );
    }

    const sharedPlan = await SharedPlanService.getSharedPlan(shareId);

    if (!sharedPlan) {
      return SecurityMiddleware.createSecureResponse(
        { error: "Shared plan not found or has expired" },
        404,
      );
    }

    return SecurityMiddleware.createSecureResponse({
      destination: sharedPlan.destination,
      travelerType: sharedPlan.travelerType,
      aiResponse: sharedPlan.aiResponse,
    });
  } catch (error) {
    return SecurityMiddleware.handleSecurityError(error as Error);
  }
}
