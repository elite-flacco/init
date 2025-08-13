import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';
import {
  TravelerType,
  Destination,
  TripPreferences,
} from "../../../../../src/types/travel";
import { getAIConfig } from "../../config";

export interface AITripPlanningRequest {
  destination: Destination;
  travelerType: TravelerType;
  preferences: TripPreferences;
}

// JSON Schema for structured outputs (keeping existing schemas)
const CHUNK_SCHEMAS = {
  1: { // Locations
    type: "object",
    properties: {

      neighborhoods: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            summary: { type: "string" },
            vibe: { type: "string" },
            pros: {
              type: "array",
              items: { type: "string" }
            },
            cons: {
              type: "array",
              items: { type: "string" }
            },
            bestFor: { type: "string" }
          },
          required: ["name", "summary", "vibe", "pros", "cons", "bestFor"],
          additionalProperties: false
        }
      },
      hotelRecommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            neighborhood: { type: "string" },
            priceRange: { type: "string" },
            description: { type: "string" },
            amenities: {
              type: "array",
              items: { type: "string" }
            },
            airbnbLink: {
              type: "string",
              description: "Airbnb link if applicable, otherwise empty string"
            }
          },
          required: ["name", "neighborhood", "priceRange", "description", "amenities", "airbnbLink"],
          additionalProperties: false
        }
      },
      restaurants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            cuisine: { type: "string" },
            priceRange: { type: "string" },
            description: { type: "string" },
            neighborhood: { type: "string" },
            specialDishes: {
              type: "array",
              items: { type: "string" }
            },
            reservationsRecommended: { type: "string" }
          },
          required: ["name", "cuisine", "priceRange", "description", "neighborhood", "specialDishes", "reservationsRecommended"],
          additionalProperties: false
        }
      },
      bars: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            atmosphere: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            neighborhood: { type: "string" }
          },
          required: ["name", "type", "atmosphere", "description", "category", "neighborhood"],
          additionalProperties: false
        }
      },
    },
    required: ["neighborhoods", "hotelRecommendations", "restaurants", "bars"],
    additionalProperties: false
  },
  2: { // Attractions & food schema
    type: "object",
    properties: {
      placesToVisit: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            priority: { type: "number" },
            ticketInfo: {
              type: "object",
              properties: {
                required: { type: "boolean" },
                recommended: { type: "boolean" },
                bookingAdvice: { type: "string" },
                peakTime: {
                  type: "array",
                  items: { type: "string" }
                },
                averageWaitTime: { type: "string" }
              },
              required: ["required", "recommended", "bookingAdvice", "peakTime", "averageWaitTime"],
              additionalProperties: false
            }
          },
          required: ["name", "description", "category", "priority", "ticketInfo"],
          additionalProperties: false
        }
      },
      mustTryFood: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                category: {
                  type: "string",
                  enum: ["main", "dessert", "drink", "snack"]
                },
                whereToFind: { type: "string" },
                priceRange: { type: "string" }
              },
              required: ["name", "description", "category", "whereToFind", "priceRange"],
              additionalProperties: false
            }
          }
        },
        required: ["items"],
        additionalProperties: false
      }
    },
    required: ["placesToVisit", "mustTryFood"],
    additionalProperties: false
  },
  3: { // Practical info schema
    type: "object",
    properties: {
      weatherInfo: {
        type: "object",
        properties: {
          season: { type: "string" },
          temperature: { type: "string" },
          conditions: { type: "string" },
          humidity: { type: "string" },
          dayNightTempDifference: { type: "string" },
          airQuality: { type: "string" },
          feelsLikeWarning: { type: "string" },
          recommendations: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["season", "temperature", "conditions", "humidity", "dayNightTempDifference", "airQuality", "feelsLikeWarning", "recommendations"],
        additionalProperties: false
      },
      localCurrency: {
        type: "object",
        properties: {
          currency: { type: "string" },
          cashNeeded: { type: "boolean" },
          creditCardUsage: { type: "string" },
          tips: {
            type: "array",
            items: { type: "string" }
          },
          exchangeRate: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              rate: { type: "number" },
              lastUpdated: { type: "string" }
            },
            required: ["from", "to", "rate", "lastUpdated"],
            additionalProperties: false
          }
        },
        required: ["currency", "cashNeeded", "creditCardUsage", "tips", "exchangeRate"],
        additionalProperties: false
      },
      safetyTips: {
        type: "array",
        items: { type: "string" }
      },
      socialEtiquette: {
        type: "array",
        items: { type: "string" }
      },
      transportationInfo: {
        type: "object",
        properties: {
          publicTransport: { type: "string" },
          creditCardPayment: { type: "boolean" },
          airportTransport: {
            type: "object",
            properties: {
              airports: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    code: { type: "string" },
                    distanceToCity: { type: "string" },
                    transportOptions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string" },
                          cost: { type: "string" },
                          duration: { type: "string" },
                          description: { type: "string" },
                          notes: {
                            type: "array",
                            items: { type: "string" },
                            description: "Additional notes or warnings, can be empty array"
                          }
                        },
                        required: ["type", "cost", "duration", "description", "notes"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["name", "code", "distanceToCity", "transportOptions"],
                  additionalProperties: false
                }
              }
            },
            required: ["airports"],
            additionalProperties: false
          },
          ridesharing: { type: "string" },
          taxiInfo: {
            type: "object",
            properties: {
              available: { type: "boolean" },
              averageCost: { type: "string" },
              tips: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["available", "averageCost", "tips"],
            additionalProperties: false
          }
        },
        required: ["publicTransport", "creditCardPayment", "airportTransport", "ridesharing", "taxiInfo"],
        additionalProperties: false
      },
      tipEtiquette: {
        type: "object",
        properties: {
          restaurants: { type: "string" },
          bars: { type: "string" },
          taxis: { type: "string" },
          hotels: { type: "string" },
          tours: { type: "string" },
          general: { type: "string" }
        },
        required: ["restaurants", "bars", "taxis", "hotels", "tours", "general"],
        additionalProperties: false
      },
      tapWaterSafe: {
        type: "object",
        properties: {
          safe: { type: "boolean" },
          details: { type: "string" }
        },
        required: ["safe", "details"],
        additionalProperties: false
      }
    },
    required: ["weatherInfo", "localCurrency", "safetyTips", "socialEtiquette", "transportationInfo", "tipEtiquette", "tapWaterSafe"],
    additionalProperties: false
  },
  4: { // Cultural schema
    type: "object",
    properties: {
      activities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            description: { type: "string" },
            duration: { type: "string" },
            localSpecific: { type: "boolean" },
            experienceType: {
              type: "string",
              enum: ["airbnb", "getyourguide", "viator", "other"]
            }
          },
          required: ["name", "type", "description", "duration", "localSpecific", "experienceType"],
          additionalProperties: false
        }
      },
      localEvents: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            description: { type: "string" },
            dates: { type: "string" },
            location: { type: "string" }
          },
          required: ["name", "type", "description", "dates", "location"],
          additionalProperties: false
        }
      },
      history: { type: "string" },
      itinerary: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "number" },
            title: { type: "string" },
            activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  location: { type: "string" },
                  icon: { type: "string" }
                },
                required: ["time", "title", "description", "location", "icon"],
                additionalProperties: false
              }
            }
          },
          required: ["day", "title", "activities"],
          additionalProperties: false
        }
      }
    },
    required: ["activities", "localEvents", "history", "itinerary"],
    additionalProperties: false
  }
};

// Import the existing prompt generators from chunked route
import {
  generateLocationsPrompt,
  generateFoodPrompt,
  generatePracticalPrompt,
  generateCulturalPrompt
} from '../chunked/route';

const CHUNK_GENERATORS = {
  1: generateLocationsPrompt,
  2: generateFoodPrompt,
  3: generatePracticalPrompt,
  4: generateCulturalPrompt
};

export const runtime = "nodejs"; // More efficient for streaming workloads

// Tiny helper for SSE framing
const enc = new TextEncoder();
const sse = (obj: any) => enc.encode(`data: ${JSON.stringify(obj)}\n\n`);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chunkId = searchParams.get('chunk');

  if (!chunkId) {
    return new NextResponse('Missing chunk parameter', { status: 400 });
  }

  return new NextResponse('Use POST for streaming requests', { status: 405 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chunkId = parseInt(searchParams.get('chunk') || '1');

  try {
    const body: AITripPlanningRequest = await request.json();
    const config = getAIConfig();

    if (config.provider === 'mock') {
      // For mock, just return regular JSON (no streaming)
      return NextResponse.json({
        message: "Mock mode doesn't support streaming",
        useRegularEndpoint: true
      });
    }

    if (config.provider !== 'openai') {
      return new NextResponse('Streaming only supported with OpenAI provider', { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: config.apiKey
    });

    const promptGenerator = CHUNK_GENERATORS[chunkId as keyof typeof CHUNK_GENERATORS];
    const schema = CHUNK_SCHEMAS[chunkId as keyof typeof CHUNK_SCHEMAS];

    if (!promptGenerator || !schema) {
      return new NextResponse('Invalid chunk ID', { status: 400 });
    }

    const prompt = promptGenerator(body);

    console.log(`[Streaming API v2] Starting streaming for chunk ${chunkId}`);

    let controllerClosed = false;
    let respStream: Awaited<ReturnType<typeof openai.responses.stream>> | null = null;

    // Create ReadableStream for Server-Sent Events using OpenAI Responses API
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        // Handle client aborts (e.g., tab closed)
        const abort = () => {
          if (!controllerClosed) {
            try { respStream?.abort?.(); } catch { }
            controller.enqueue(sse({ type: "error", error: "client_aborted", timestamp: Date.now() }));
            controller.enqueue(enc.encode("data: [DONE]\n\n"));
            controller.close();
            controllerClosed = true;
          }
        };
        request.signal.addEventListener("abort", abort);

        const push = (obj: any) => controller.enqueue(sse(obj));

        try {
          push({ type: "start", chunkId, timestamp: Date.now() });

          // Use OpenAI's Responses API - purpose-built for structured streaming outputs
          respStream = await openai.responses.stream({
            model: config.model || 'gpt-4o-2024-08-06',
            input: [{ role: "user", content: prompt }],
            text: {
              format: { 
                type: "json_schema", 
                schema: schema, 
                strict: true, 
                name: `chunk_${chunkId}_response` 
              },
            },
            max_output_tokens: config.chunkTokenLimit || 4000,
            temperature: config.temperature || 0.3
          });

          let buffer = "";

          // Stream events from OpenAI to client
          for await (const event of respStream) {
            // Text deltas for the model's final output (what we'll parse at the end)
            if (event.type === "response.output_text.delta") {
              const delta = event.delta ?? "";
              if (delta) {
                buffer += delta;
                // Forward lightweight progress updates
                push({
                  type: "content_delta",
                  delta,
                  accumulated: buffer,
                  timestamp: Date.now()
                });
              }
            }

            // Handle other event types if needed
            if (event.type === "response.refusal.delta") {
              push({
                type: "refusal",
                delta: event.delta,
                timestamp: Date.now()
              });
            }
          }

          console.log(`[Streaming API v2] Streaming complete for chunk ${chunkId}, parsing final JSON (${buffer.length} chars)`);

          // Parse the buffered text once at the end - much more reliable
          console.log(`[Streaming API v2] Chunk ${chunkId} final buffer length:`, buffer.length);
          console.log(`[Streaming API v2] Chunk ${chunkId} buffer preview (first 200 chars):`, buffer.substring(0, 200));
          try {
            const finalData = JSON.parse(buffer);
            console.log(`[Streaming API v2] Chunk ${chunkId} successfully parsed JSON, data keys:`, Object.keys(finalData || {}));
            push({
              type: "complete",
              chunkId,
              data: finalData,
              timestamp: Date.now()
            });
            console.log(`[Streaming API v2] Successfully completed chunk ${chunkId}`);
          } catch (e: any) {
            console.error(`[Streaming API v2] Final JSON parse failed for chunk ${chunkId}:`, e);
            console.error(`[Streaming API v2] Buffer preview (first 500 chars):`, buffer.substring(0, 500));
            // If parsing fails, ship a helpful preview for debugging
            push({
              type: "error",
              error: "final_json_parse_failed",
              parseError: e?.message ?? "unknown_parse_error",
              preview: buffer.slice(0, 4000),
              timestamp: Date.now(),
            });
          }

        } catch (err: any) {
          console.error(`[Streaming API v2] Stream error for chunk ${chunkId}:`, err);
          push({
            type: "error",
            error: err?.message ?? "unknown_error",
            timestamp: Date.now()
          });
        } finally {
          if (!controllerClosed) {
            controller.enqueue(enc.encode("data: [DONE]\n\n"));
            controller.close();
            controllerClosed = true;
          }
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error) {
    console.error('[Streaming API v2] Request failed:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to start streaming',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}