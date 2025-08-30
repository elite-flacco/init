import { NextResponse } from "next/server";
import { getAIConfig, modelSupportsTemperature } from "../config";

export async function GET() {
  try {
    const config = getAIConfig();

    return NextResponse.json({
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      temperatureSupported: modelSupportsTemperature(config.model || ""),
      // Don't expose the actual API key for security
      apiKeyPreview: config.apiKey
        ? `${config.apiKey.substring(0, 8)}...`
        : "Not set",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get AI config" },
      { status: 500 },
    );
  }
}
