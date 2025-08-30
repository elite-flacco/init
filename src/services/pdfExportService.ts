import jsPDF from "jspdf";
import {
  EnhancedTravelPlan,
  TravelerType,
  Destination,
  ItineraryDay,
  Activity,
} from "../types/travel";

export interface PdfExportOptions {
  destination: Destination;
  travelerType: TravelerType;
  plan: EnhancedTravelPlan;
  includeItinerary?: boolean;
  includeInfo?: boolean;
}

export class PdfExportService {
  private static readonly PAGE_WIDTH = 595.28; // A4 width in points
  private static readonly PAGE_HEIGHT = 841.89; // A4 height in points
  private static readonly MARGIN = 40;
  private static readonly CONTENT_WIDTH =
    PdfExportService.PAGE_WIDTH - PdfExportService.MARGIN * 2;

  static async exportTravelPlanToPdf(options: PdfExportOptions): Promise<void> {
    const {
      destination,
      travelerType,
      plan,
      includeItinerary = true,
      includeInfo = true,
    } = options;

    try {
      const pdf = new jsPDF("p", "pt", "a4");

      // Set default font for entire document
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      let yPosition = PdfExportService.MARGIN;

      // Add title page
      this.addTitlePage(pdf, destination, travelerType, yPosition);

      if (includeItinerary && plan.itinerary && plan.itinerary.length > 0) {
        // Add new page for itinerary
        pdf.addPage();
        yPosition = PdfExportService.MARGIN;
        yPosition = this.addItinerary(pdf, plan.itinerary, yPosition);
      }

      if (includeInfo) {
        // Add new page for travel info
        pdf.addPage();
        yPosition = PdfExportService.MARGIN;
        yPosition = this.addTravelInfo(pdf, plan, yPosition);
      }

      // Download the PDF
      const fileName = `${destination.name.replace(/\s+/g, "_")}_Travel_Plan.pdf`;
      pdf.save(fileName);
    } catch {
      throw new Error("Failed to generate PDF. Please try again.");
    }
  }

  private static addTitlePage(
    pdf: jsPDF,
    destination: Destination,
    travelerType: TravelerType,
    yPosition: number,
  ): number {
    // Main title - centered horizontally and vertically
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    const title = `Your Travel Info Packet for ${destination.name}`;
    const titleWidth = pdf.getTextWidth(title);
    const titleX = (PdfExportService.PAGE_WIDTH - titleWidth) / 2;
    const titleY = PdfExportService.PAGE_HEIGHT / 2;
    pdf.text(title, titleX, titleY);

    return titleY + 40;
  }

  private static addItinerary(
    pdf: jsPDF,
    itinerary: ItineraryDay[],
    yPosition: number,
  ): number {
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Sample Itinerary", PdfExportService.MARGIN, yPosition);
    yPosition += 40;

    itinerary.forEach((day) => {
      // Check if we need a new page
      if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
        pdf.addPage();
        yPosition = PdfExportService.MARGIN;
      }

      // Day title
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Day ${day.day}: ${day.title}`,
        PdfExportService.MARGIN,
        yPosition,
      );
      yPosition += 30;

      // Activities
      day.activities.forEach((activity: Activity) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        const activityText = `${activity.time} - ${activity.title}`;
        const activityLines = this.wrapText(
          pdf,
          activityText,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        activityLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 15, yPosition);
          yPosition += 15;
        });
        yPosition += 18;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        if (activity.location) {
          const locationLines = this.wrapText(
            pdf,
            `Location: ${activity.location}`,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          locationLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 15, yPosition);
            yPosition += 15;
          });
        }

        if (activity.description) {
          const descLines = this.wrapText(
            pdf,
            activity.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 15, yPosition);
            yPosition += 15;
          });
        }
        yPosition += 10;
      });

      yPosition += 20;
    });

    return yPosition;
  }

  private static addTravelInfo(
    pdf: jsPDF,
    plan: EnhancedTravelPlan,
    yPosition: number,
  ): number {
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Travel Information", PdfExportService.MARGIN, yPosition);
    yPosition += 40;

    // Places to Visit
    if (plan.placesToVisit && plan.placesToVisit.length > 0) {
      yPosition = this.addSection(pdf, "Top Attractions", yPosition);
      plan.placesToVisit.forEach((place) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${place.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        if (place.description) {
          const descLines = this.wrapText(
            pdf,
            place.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        yPosition += 5;
      });
      yPosition += 20;
    }

    // Neighborhoods
    if (plan.neighborhoods && plan.neighborhoods.length > 0) {
      yPosition = this.addSection(pdf, "Recommended Neighborhoods", yPosition);
      plan.neighborhoods.forEach((neighborhood) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `• ${neighborhood.name}`,
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
          `Vibe: ${neighborhood.vibe}`,
          PdfExportService.MARGIN + 20,
          yPosition,
        );
        yPosition += 15;

        if (neighborhood.summary) {
          const summaryLines = this.wrapText(
            pdf,
            neighborhood.summary,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          summaryLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }

        if (neighborhood.bestFor) {
          pdf.text(
            `Best for: ${neighborhood.bestFor.replace("Best for: ", "")}`,
            PdfExportService.MARGIN + 20,
            yPosition,
          );
          yPosition += 15;
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Hotel Recommendations / Accommodations
    if (plan.hotelRecommendations && plan.hotelRecommendations.length > 0) {
      yPosition = this.addSection(
        pdf,
        "Accommodation Recommendations",
        yPosition,
      );
      plan.hotelRecommendations.forEach((hotel) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${hotel.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
          `${hotel.neighborhood} • ${hotel.priceRange}`,
          PdfExportService.MARGIN + 20,
          yPosition,
        );
        yPosition += 15;

        if (hotel.description) {
          const descLines = this.wrapText(
            pdf,
            hotel.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }

        if (hotel.amenities && hotel.amenities.length > 0) {
          // Explicitly reset font right before rendering
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          // Normalize Unicode characters that can cause spacing issues
          const cleanAmenities = hotel.amenities
            .filter((a) => a && a.trim())
            .map((a) => a.replace(/[\u2011\u2012\u2013\u2014\u2015]/g, "-")); // Replace various Unicode dashes with regular hyphen
          const amenitiesText = `Amenities: ${cleanAmenities.join(", ")}`;
          pdf.text(amenitiesText, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Restaurants
    if (plan.restaurants && plan.restaurants.length > 0) {
      yPosition = this.addSection(pdf, "Restaurant Recommendations", yPosition);
      plan.restaurants.slice(0, 15).forEach((restaurant) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `• ${restaurant.name}`,
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        const details = [
          restaurant.cuisine,
          restaurant.priceRange,
          restaurant.neighborhood,
        ]
          .filter(Boolean)
          .join(" • ");
        pdf.text(details, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;

        if (restaurant.description) {
          const descLines = this.wrapText(
            pdf,
            restaurant.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }

        if (restaurant.specialDishes && restaurant.specialDishes.length > 0) {
          pdf.text(
            `Specialties: ${restaurant.specialDishes.join(", ")}`,
            PdfExportService.MARGIN + 20,
            yPosition,
          );
          yPosition += 15;
        }

        if (restaurant.reservationsRecommended === "Yes") {
          pdf.setFont("helvetica", "normal");
          pdf.text(
            "Note: Reservations recommended",
            PdfExportService.MARGIN + 20,
            yPosition,
          );
          yPosition += 15;
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Bars & Nightlife
    if (plan.bars && plan.bars.length > 0) {
      yPosition = this.addSection(pdf, "Bars & Nightlife", yPosition);
      plan.bars.slice(0, 10).forEach((bar) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${bar.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        const details = [bar.category, bar.atmosphere, bar.neighborhood]
          .filter(Boolean)
          .join(" • ");
        pdf.text(details, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;

        if (bar.description) {
          const descLines = this.wrapText(
            pdf,
            bar.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Must-Try Local Food
    if (
      plan.mustTryFood &&
      plan.mustTryFood.items &&
      plan.mustTryFood.items.length > 0
    ) {
      yPosition = this.addSection(pdf, "Must-Try Local Food", yPosition);

      // Group by category
      const foodByCategory = plan.mustTryFood.items.reduce(
        (acc, item) => {
          const category = item.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {} as Record<string, typeof plan.mustTryFood.items>,
      );

      const categoryTitles: Record<string, string> = {
        main: "Main Dishes",
        dessert: "Desserts",
        drink: "Local Drinks",
        snack: "Snacks",
      };

      Object.entries(foodByCategory).forEach(([category, items]) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          categoryTitles[category] || category,
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 20;

        items.forEach((item) => {
          if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
            pdf.addPage();
            yPosition = PdfExportService.MARGIN;
          }

          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text(`• ${item.name}`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 16;
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");

          if (item.description) {
            const descLines = this.wrapText(
              pdf,
              item.description,
              PdfExportService.CONTENT_WIDTH - 20,
            );
            descLines.forEach((line) => {
              pdf.text(line, PdfExportService.MARGIN + 30, yPosition);
              yPosition += 14;
            });
          }

          if (item.whereToFind) {
            pdf.setFont("helvetica", "italic");
            const whereToFindLines = this.wrapText(
              pdf,
              `Where to find: ${item.whereToFind}`,
              PdfExportService.CONTENT_WIDTH - 30,
            );
            whereToFindLines.forEach((line) => {
              pdf.text(line, PdfExportService.MARGIN + 30, yPosition);
              yPosition += 14;
            });
          }
          yPosition += 5;
        });
        yPosition += 15;
      });
      yPosition += 20;
    }

    // Local Activities & Experiences
    if (plan.activities && plan.activities.length > 0) {
      yPosition = this.addSection(
        pdf,
        "Local Experiences & Activities",
        yPosition,
      );
      plan.activities.forEach((activity) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${activity.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const details = [activity.type, activity.duration]
          .filter(Boolean)
          .join(" • ");
        pdf.text(details, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;

        if (activity.description) {
          const descLines = this.wrapText(
            pdf,
            activity.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }

        yPosition += 10;
      });
      yPosition += 20;
    }

    // Local Events
    if (plan.localEvents && plan.localEvents.length > 0) {
      yPosition = this.addSection(
        pdf,
        "Local Events During Your Visit",
        yPosition,
      );
      plan.localEvents.forEach((event) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${event.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
          `${event.type} • ${event.dates}`,
          PdfExportService.MARGIN + 20,
          yPosition,
        );
        yPosition += 15;

        pdf.text(
          `Location: ${event.location}`,
          PdfExportService.MARGIN + 20,
          yPosition,
        );
        yPosition += 15;

        if (event.description) {
          const descLines = this.wrapText(
            pdf,
            event.description,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          descLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Transportation
    if (plan.transportationInfo) {
      yPosition = this.addSection(pdf, "Transportation Guide", yPosition);

      if (plan.transportationInfo.publicTransport) {
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "Public Transportation:",
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 18;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        const transportLines = this.wrapText(
          pdf,
          plan.transportationInfo.publicTransport,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        transportLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }

      if (plan.transportationInfo.ridesharing) {
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "Ridesharing & Taxis:",
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 18;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        const rideLines = this.wrapText(
          pdf,
          plan.transportationInfo.ridesharing,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        rideLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }

      // Airport Transportation
      if (
        plan.transportationInfo.airportTransport &&
        plan.transportationInfo.airportTransport.airports
      ) {
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "Airport Transportation:",
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 18;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        plan.transportationInfo.airportTransport.airports.forEach((airport) => {
          if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
            pdf.addPage();
            yPosition = PdfExportService.MARGIN;
          }

          pdf.setFont("helvetica", "bold");
          const airportNameLines = this.wrapText(
            pdf,
            `${airport.name} (${airport.code})`,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          airportNameLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 16;
          });
          yPosition -= 16;
          yPosition += 16;

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          const distanceLines = this.wrapText(
            pdf,
            `Distance: ${airport.distanceToCity}`,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          distanceLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 14;
          });
          yPosition -= 14;
          yPosition += 14;

          if (airport.transportOptions) {
            airport.transportOptions.forEach((option) => {
              const optionTextLines = this.wrapText(
                pdf,
                `• ${option.type}: ${option.cost} (${option.duration})`,
                PdfExportService.CONTENT_WIDTH - 30,
              );
              optionTextLines.forEach((line) => {
                pdf.text(line, PdfExportService.MARGIN + 30, yPosition);
                yPosition += 14;
              });
              yPosition -= 14;
              yPosition += 14;

              if (option.description) {
                const optionLines = this.wrapText(
                  pdf,
                  option.description,
                  PdfExportService.CONTENT_WIDTH - 30,
                );
                optionLines.forEach((line) => {
                  pdf.text(line, PdfExportService.MARGIN + 40, yPosition);
                  yPosition += 12;
                });
              }
            });
          }
          yPosition += 10;
        });
        yPosition += 10;
      }
      yPosition += 20;
    }

    // Weather Information
    if (plan.weatherInfo) {
      yPosition = this.addSection(pdf, "Weather Information", yPosition);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const tempLines = this.wrapText(
        pdf,
        `Temperature: ${plan.weatherInfo.temperature}`,
        PdfExportService.CONTENT_WIDTH - 20,
      );
      tempLines.forEach((line) => {
        pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
      });

      const conditionsLines = this.wrapText(
        pdf,
        `Conditions: ${plan.weatherInfo.conditions}`,
        PdfExportService.CONTENT_WIDTH - 20,
      );
      conditionsLines.forEach((line) => {
        pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
      });

      const humidityLines = this.wrapText(
        pdf,
        `Humidity: ${plan.weatherInfo.humidity}`,
        PdfExportService.CONTENT_WIDTH - 20,
      );
      humidityLines.forEach((line) => {
        pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
      });

      if (
        plan.weatherInfo.recommendations &&
        plan.weatherInfo.recommendations.length > 0
      ) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Recommendations:", PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
        pdf.setFont("helvetica", "normal");

        plan.weatherInfo.recommendations.forEach((rec) => {
          const recLines = this.wrapText(
            pdf,
            `• ${rec}`,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          recLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 14;
          });
        });
      }
      yPosition += 20;
    }

    // Safety Tips
    if (plan.safetyTips && plan.safetyTips.length > 0) {
      yPosition = this.addSection(pdf, "Safety Tips", yPosition);
      plan.safetyTips.forEach((tip) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        const tipLines = this.wrapText(
          pdf,
          `• ${tip}`,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        tipLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 15;
        });
      });
      yPosition += 20;
    }

    // Cultural Insights
    if (plan.socialEtiquette && plan.socialEtiquette.length > 0) {
      yPosition = this.addSection(
        pdf,
        "Cultural Insights & Etiquette",
        yPosition,
      );
      plan.socialEtiquette.forEach((tip) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        const tipLines = this.wrapText(
          pdf,
          `• ${tip}`,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        tipLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 15;
        });
      });
      yPosition += 20;
    }

    // Currency Information
    if (plan.localCurrency) {
      yPosition = this.addSection(pdf, "Currency & Payments", yPosition);

      pdf.text(
        `Local currency: ${plan.localCurrency.currency}`,
        PdfExportService.MARGIN + 10,
        yPosition,
      );
      yPosition += 18;

      if (plan.localCurrency.creditCardUsage) {
        const creditLines = this.wrapText(
          pdf,
          `Credit card usage: ${plan.localCurrency.creditCardUsage}`,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        creditLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }

      if (plan.localCurrency.exchangeRate) {
        pdf.text(
          `Exchange rate: 1 ${plan.localCurrency.exchangeRate.from} = ${plan.localCurrency.exchangeRate.rate} ${plan.localCurrency.exchangeRate.to}`,
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 16;
      }

      if (plan.localCurrency.tips && plan.localCurrency.tips.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Money Tips:", PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
        pdf.setFont("helvetica", "normal");

        plan.localCurrency.tips.forEach((tip) => {
          const tipLines = this.wrapText(
            pdf,
            `• ${tip}`,
            PdfExportService.CONTENT_WIDTH - 20,
          );
          tipLines.forEach((line) => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 14;
          });
        });
      }
      yPosition += 20;
    }

    // Tipping Etiquette
    if (plan.tipEtiquette) {
      yPosition = this.addSection(pdf, "Tipping Etiquette", yPosition);

      Object.entries(plan.tipEtiquette).forEach(([category, tip]) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(
          `${category.charAt(0).toUpperCase() + category.slice(1)}:`,
          PdfExportService.MARGIN + 10,
          yPosition,
        );
        yPosition += 16;
        pdf.setFont("helvetica", "normal");

        const tipLines = this.wrapText(
          pdf,
          tip,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        tipLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 14;
        });
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Water Safety
    if (plan.tapWaterSafe) {
      yPosition = this.addSection(pdf, "Water Safety", yPosition);

      const waterStatus = plan.tapWaterSafe.safe
        ? "Tap water is safe to drink."
        : "Tap water is not recommended for drinking.";
      pdf.text(waterStatus, PdfExportService.MARGIN + 10, yPosition);
      yPosition += 16;

      if (plan.tapWaterSafe.details) {
        const detailLines = this.wrapText(
          pdf,
          plan.tapWaterSafe.details,
          PdfExportService.CONTENT_WIDTH - 20,
        );
        detailLines.forEach((line) => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 14;
        });
      }
      yPosition += 20;
    }

    // Historical Context
    if (plan.history) {
      yPosition = this.addSection(pdf, "Historical Context", yPosition);

      const historyLines = this.wrapText(
        pdf,
        plan.history,
        PdfExportService.CONTENT_WIDTH - 20,
      );
      historyLines.forEach((line) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 20) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 15;
      });
      yPosition += 20;
    }

    return yPosition;
  }

  private static addSection(
    pdf: jsPDF,
    title: string,
    yPosition: number,
  ): number {
    if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
      pdf.addPage();
      yPosition = PdfExportService.MARGIN;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, PdfExportService.MARGIN, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    return yPosition + 30;
  }

  private static wrapText(
    pdf: jsPDF,
    text: string,
    maxWidth: number,
  ): string[] {
    const lines: string[] = [];
    const words = text.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = pdf.getTextWidth(testLine);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
