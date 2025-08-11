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

// JSON Schema for structured outputs
const BASICS_SCHEMA = {
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
    }
  },
  required: ["placesToVisit", "neighborhoods", "hotelRecommendations"],
  additionalProperties: false
};

const CHUNK_SCHEMAS = {
  1: BASICS_SCHEMA,
  2: { // Dining schema
    type: "object",
    properties: {
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
    required: ["restaurants", "bars", "mustTryFood"],
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

function getRestaurantCount(preferences: TripPreferences): number {
  const baseDays = parseInt(preferences.duration) || 7;
  return Math.ceil(baseDays * 4);
}

function getBarCount(preferences: TripPreferences): number {
  const baseDays = parseInt(preferences.duration) || 7;
  return Math.ceil(baseDays * 2);
}

function getPlacesCount(preferences: TripPreferences): number {
  const baseDays = parseInt(preferences.duration) || 7;
  const activityMultiplier =
    preferences.activityLevel === "high"
      ? 4
      : preferences.activityLevel === "low"
        ? 2
        : 3;
  return Math.ceil(baseDays * activityMultiplier);
}

// Import the existing prompt generators from chunked route
import { 
  generateBasicsPrompt,
  generateDiningPrompt, 
  generatePracticalPrompt,
  generateCulturalPrompt
} from '../chunked/route';

const CHUNK_GENERATORS = {
  1: generateBasicsPrompt,
  2: generateDiningPrompt,
  3: generatePracticalPrompt,
  4: generateCulturalPrompt
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chunkId = searchParams.get('chunk');
  const sessionId = searchParams.get('sessionId');
  
  if (!chunkId || !sessionId) {
    return new NextResponse('Missing chunk or sessionId', { status: 400 });
  }
  
  // This is a streaming endpoint, we'll get the request data from query params
  // In a real implementation, you'd store the request data in a session store
  return new NextResponse('Use POST for streaming requests', { status: 405 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chunkId = parseInt(searchParams.get('chunk') || '1');
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return new NextResponse('Missing sessionId', { status: 400 });
  }

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
    
    console.log(`[Streaming API] Starting streaming for chunk ${chunkId}, session ${sessionId}`);

    // Create ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize SSE connection
          controller.enqueue(`data: ${JSON.stringify({ 
            type: 'start',
            chunkId,
            sessionId,
            timestamp: Date.now()
          })}\n\n`);

          // Create OpenAI streaming request with structured outputs
          const completion = await openai.chat.completions.create({
            model: config.model || 'gpt-4o-2024-08-06',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            response_format: {
              type: "json_schema",
              json_schema: {
                name: `chunk_${chunkId}_response`,
                strict: true,
                schema: schema
              }
            },
            max_tokens: config.chunkTokenLimit || 4000,
            temperature: config.temperature || 0.7
          });

          let accumulatedContent = '';
          let hasStartedJson = false;
          
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || '';
            
            if (delta) {
              accumulatedContent += delta;
              
              // Detect start of JSON
              if (!hasStartedJson && accumulatedContent.includes('{')) {
                hasStartedJson = true;
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'json_start',
                  timestamp: Date.now()
                })}\n\n`);
              }
              
              // Send progressive content updates
              controller.enqueue(`data: ${JSON.stringify({
                type: 'content_delta',
                delta: delta,
                accumulated: accumulatedContent,
                timestamp: Date.now()
              })}\n\n`);

              // Try to parse partial JSON and send structured updates
              if (hasStartedJson) {
                try {
                  // Attempt to parse accumulated JSON
                  const parsed = JSON.parse(accumulatedContent);
                  
                  controller.enqueue(`data: ${JSON.stringify({
                    type: 'partial_json',
                    data: parsed,
                    timestamp: Date.now()
                  })}\n\n`);
                } catch (e) {
                  // JSON not complete yet, continue
                }
              }
            }
          }

          // Final parsing and completion
          try {
            const finalData = JSON.parse(accumulatedContent);
            
            controller.enqueue(`data: ${JSON.stringify({
              type: 'complete',
              chunkId,
              sessionId,
              data: finalData,
              timestamp: Date.now()
            })}\n\n`);
            
            console.log(`[Streaming API] Completed chunk ${chunkId} for session ${sessionId}`);
          } catch (e) {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'error',
              error: 'Failed to parse final JSON',
              accumulated: accumulatedContent,
              timestamp: Date.now()
            })}\n\n`);
          }
          
          controller.close();
        } catch (error) {
          console.error(`[Streaming API] Error in chunk ${chunkId}:`, error);
          
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          })}\n\n`);
          
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('[Streaming API] Request failed:', error);
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