import jsPDF from 'jspdf';
import { EnhancedTravelPlan, TravelerType, Destination, ItineraryDay, Activity } from '../types/travel';

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
  private static readonly CONTENT_WIDTH = PdfExportService.PAGE_WIDTH - (PdfExportService.MARGIN * 2);

  static async exportTravelPlanToPdf(options: PdfExportOptions): Promise<void> {
    const { destination, travelerType, plan, includeItinerary = true, includeInfo = true } = options;
    
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
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
      const fileName = `${destination.name.replace(/\s+/g, '_')}_Travel_Plan.pdf`;
      pdf.save(fileName);
    } catch {
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  private static addTitlePage(pdf: jsPDF, destination: Destination, travelerType: TravelerType, yPosition: number): number {
    // Main title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const title = `Your Travel Info Packet for ${destination.name}`;
    const titleWidth = pdf.getTextWidth(title);
    const titleX = (PdfExportService.PAGE_WIDTH - titleWidth) / 2;
    pdf.text(title, titleX, yPosition);
    yPosition += 40;

    // Destination description
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('About the Destination:', PdfExportService.MARGIN, yPosition);
    yPosition += 25;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const description = this.wrapText(pdf, destination.description, PdfExportService.CONTENT_WIDTH);
    description.forEach(line => {
      pdf.text(line, PdfExportService.MARGIN, yPosition);
      yPosition += 18;
    });
    yPosition += 20;

    // Highlights
    if (destination.highlights && destination.highlights.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Highlights:', PdfExportService.MARGIN, yPosition);
      yPosition += 25;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      destination.highlights.forEach(highlight => {
        pdf.text(`• ${highlight}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
      });
    }

    return yPosition;
  }

  private static addItinerary(pdf: jsPDF, itinerary: ItineraryDay[], yPosition: number): number {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sample Itinerary', PdfExportService.MARGIN, yPosition);
    yPosition += 40;

    itinerary.forEach((day) => {
      // Check if we need a new page
      if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
        pdf.addPage();
        yPosition = PdfExportService.MARGIN;
      }

      // Day title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Day ${day.day}: ${day.title}`, PdfExportService.MARGIN, yPosition);
      yPosition += 30;

      // Activities
      day.activities.forEach((activity: Activity) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${activity.time} - ${activity.title}`, PdfExportService.MARGIN + 15, yPosition);
        yPosition += 18;

        if (activity.location) {
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Location: ${activity.location}`, PdfExportService.MARGIN + 15, yPosition);
          yPosition += 15;
        }

        if (activity.description) {
          pdf.setFont('helvetica', 'normal');
          const descLines = this.wrapText(pdf, activity.description, PdfExportService.CONTENT_WIDTH - 15);
          descLines.forEach(line => {
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

  private static addTravelInfo(pdf: jsPDF, plan: EnhancedTravelPlan, yPosition: number): number {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Travel Information', PdfExportService.MARGIN, yPosition);
    yPosition += 40;

    // Places to Visit
    if (plan.placesToVisit && plan.placesToVisit.length > 0) {
      yPosition = this.addSection(pdf, 'Top Attractions', yPosition);
      plan.placesToVisit.forEach(place => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${place.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        if (place.description) {
          pdf.setFont('helvetica', 'normal');
          const descLines = this.wrapText(pdf, place.description, PdfExportService.CONTENT_WIDTH - 20);
          descLines.forEach(line => {
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
      yPosition = this.addSection(pdf, 'Recommended Neighborhoods', yPosition);
      plan.neighborhoods.forEach(neighborhood => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${neighborhood.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Vibe: ${neighborhood.vibe}`, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        if (neighborhood.summary) {
          const summaryLines = this.wrapText(pdf, neighborhood.summary, PdfExportService.CONTENT_WIDTH - 20);
          summaryLines.forEach(line => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        
        if (neighborhood.bestFor) {
          pdf.text(`Best for: ${neighborhood.bestFor.replace('Best for: ', '')}`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Hotel Recommendations / Accommodations
    if (plan.hotelRecommendations && plan.hotelRecommendations.length > 0) {
      yPosition = this.addSection(pdf, 'Accommodation Recommendations', yPosition);
      plan.hotelRecommendations.forEach(hotel => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${hotel.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${hotel.neighborhood} • ${hotel.priceRange}`, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        if (hotel.description) {
          const descLines = this.wrapText(pdf, hotel.description, PdfExportService.CONTENT_WIDTH - 20);
          descLines.forEach(line => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        
        if (hotel.amenities && hotel.amenities.length > 0) {
          pdf.text(`Amenities: ${hotel.amenities.join(', ')}`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Restaurants
    if (plan.restaurants && plan.restaurants.length > 0) {
      yPosition = this.addSection(pdf, 'Restaurant Recommendations', yPosition);
      plan.restaurants.slice(0, 15).forEach(restaurant => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${restaurant.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        const details = [restaurant.cuisine, restaurant.priceRange, restaurant.neighborhood].filter(Boolean).join(' • ');
        pdf.text(details, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        if (restaurant.description) {
          const descLines = this.wrapText(pdf, restaurant.description, PdfExportService.CONTENT_WIDTH - 20);
          descLines.forEach(line => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        
        if (restaurant.specialDishes && restaurant.specialDishes.length > 0) {
          pdf.text(`Specialties: ${restaurant.specialDishes.join(', ')}`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        }
        
        if (restaurant.reservationsRecommended === "Yes") {
          pdf.text('💡 Reservations recommended', PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Bars & Nightlife
    if (plan.bars && plan.bars.length > 0) {
      yPosition = this.addSection(pdf, 'Bars & Nightlife', yPosition);
      plan.bars.slice(0, 10).forEach(bar => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${bar.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        const details = [bar.category, bar.atmosphere, bar.neighborhood].filter(Boolean).join(' • ');
        pdf.text(details, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        if (bar.description) {
          const descLines = this.wrapText(pdf, bar.description, PdfExportService.CONTENT_WIDTH - 20);
          descLines.forEach(line => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 15;
          });
        }
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Must-Try Local Food
    if (plan.mustTryFood && plan.mustTryFood.items && plan.mustTryFood.items.length > 0) {
      yPosition = this.addSection(pdf, 'Must-Try Local Food', yPosition);
      
      // Group by category
      const foodByCategory = plan.mustTryFood.items.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, typeof plan.mustTryFood.items>);

      const categoryTitles: Record<string, string> = {
        main: 'Main Dishes',
        dessert: 'Desserts',
        drink: 'Local Drinks',
        snack: 'Snacks'
      };

      Object.entries(foodByCategory).forEach(([category, items]) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(categoryTitles[category] || category, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 20;
        
        items.forEach(item => {
          if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
            pdf.addPage();
            yPosition = PdfExportService.MARGIN;
          }
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`• ${item.name}`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 16;
          
          if (item.description) {
            pdf.setFont('helvetica', 'normal');
            const descLines = this.wrapText(pdf, item.description, PdfExportService.CONTENT_WIDTH - 30);
            descLines.forEach(line => {
              pdf.text(line, PdfExportService.MARGIN + 30, yPosition);
              yPosition += 14;
            });
          }
          
          if (item.whereToFind) {
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Where to find: ${item.whereToFind}`, PdfExportService.MARGIN + 30, yPosition);
            yPosition += 14;
          }
          yPosition += 5;
        });
        yPosition += 15;
      });
      yPosition += 20;
    }

    // Local Activities & Experiences
    if (plan.activities && plan.activities.length > 0) {
      yPosition = this.addSection(pdf, 'Local Experiences & Activities', yPosition);
      plan.activities.forEach(activity => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 80) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${activity.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        const details = [activity.type, activity.duration].filter(Boolean).join(' • ');
        pdf.text(details, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        if (activity.description) {
          const descLines = this.wrapText(pdf, activity.description, PdfExportService.CONTENT_WIDTH - 20);
          descLines.forEach(line => {
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
      yPosition = this.addSection(pdf, 'Local Events During Your Visit', yPosition);
      plan.localEvents.forEach(event => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 60) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${event.name}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${event.type} • ${event.dates}`, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        pdf.text(`Location: ${event.location}`, PdfExportService.MARGIN + 20, yPosition);
        yPosition += 15;
        
        if (event.description) {
          const descLines = this.wrapText(pdf, event.description, PdfExportService.CONTENT_WIDTH - 20);
          descLines.forEach(line => {
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
      yPosition = this.addSection(pdf, 'Transportation Guide', yPosition);
      
      if (plan.transportationInfo.publicTransport) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Public Transportation:', PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        const transportLines = this.wrapText(pdf, plan.transportationInfo.publicTransport, PdfExportService.CONTENT_WIDTH - 20);
        transportLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }

      if (plan.transportationInfo.ridesharing) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Ridesharing & Taxis:', PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        const rideLines = this.wrapText(pdf, plan.transportationInfo.ridesharing, PdfExportService.CONTENT_WIDTH - 20);
        rideLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }

      // Airport Transportation
      if (plan.transportationInfo.airportTransport && plan.transportationInfo.airportTransport.airports) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Airport Transportation:', PdfExportService.MARGIN + 10, yPosition);
        yPosition += 18;
        
        plan.transportationInfo.airportTransport.airports.forEach(airport => {
          if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
            pdf.addPage();
            yPosition = PdfExportService.MARGIN;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${airport.name} (${airport.code})`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 16;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Distance: ${airport.distanceToCity}`, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 14;
          
          if (airport.transportOptions) {
            airport.transportOptions.forEach(option => {
              pdf.text(`• ${option.type}: ${option.cost} (${option.duration})`, PdfExportService.MARGIN + 30, yPosition);
              yPosition += 14;
              
              if (option.description) {
                const optionLines = this.wrapText(pdf, option.description, PdfExportService.CONTENT_WIDTH - 40);
                optionLines.forEach(line => {
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
      yPosition = this.addSection(pdf, 'Weather Information', yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Temperature: ${plan.weatherInfo.temperature}`, PdfExportService.MARGIN + 10, yPosition);
      yPosition += 16;
      
      pdf.text(`Conditions: ${plan.weatherInfo.conditions}`, PdfExportService.MARGIN + 10, yPosition);
      yPosition += 16;
      
      pdf.text(`Humidity: ${plan.weatherInfo.humidity}`, PdfExportService.MARGIN + 10, yPosition);
      yPosition += 16;
      
      if (plan.weatherInfo.recommendations && plan.weatherInfo.recommendations.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recommendations:', PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
        
        pdf.setFont('helvetica', 'normal');
        plan.weatherInfo.recommendations.forEach(rec => {
          const recLines = this.wrapText(pdf, `• ${rec}`, PdfExportService.CONTENT_WIDTH - 20);
          recLines.forEach(line => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 14;
          });
        });
      }
      yPosition += 20;
    }

    // Safety Tips
    if (plan.safetyTips && plan.safetyTips.length > 0) {
      yPosition = this.addSection(pdf, 'Safety Tips', yPosition);
      plan.safetyTips.forEach(tip => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const tipLines = this.wrapText(pdf, `• ${tip}`, PdfExportService.CONTENT_WIDTH - 10);
        tipLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 15;
        });
      });
      yPosition += 20;
    }

    // Cultural Insights
    if (plan.socialEtiquette && plan.socialEtiquette.length > 0) {
      yPosition = this.addSection(pdf, 'Cultural Insights & Etiquette', yPosition);
      plan.socialEtiquette.forEach(tip => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const tipLines = this.wrapText(pdf, `• ${tip}`, PdfExportService.CONTENT_WIDTH - 10);
        tipLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 15;
        });
      });
      yPosition += 20;
    }

    // Currency Information
    if (plan.localCurrency) {
      yPosition = this.addSection(pdf, 'Currency & Payments', yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Local currency: ${plan.localCurrency.currency}`, PdfExportService.MARGIN + 10, yPosition);
      yPosition += 18;
      
      if (plan.localCurrency.creditCardUsage) {
        const creditLines = this.wrapText(pdf, `Credit card usage: ${plan.localCurrency.creditCardUsage}`, PdfExportService.CONTENT_WIDTH - 20);
        creditLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 15;
        });
        yPosition += 10;
      }
      
      if (plan.localCurrency.exchangeRate) {
        pdf.text(`Exchange rate: 1 ${plan.localCurrency.exchangeRate.from} = ${plan.localCurrency.exchangeRate.rate} ${plan.localCurrency.exchangeRate.to}`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
      }
      
      if (plan.localCurrency.tips && plan.localCurrency.tips.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Money Tips:', PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
        
        pdf.setFont('helvetica', 'normal');
        plan.localCurrency.tips.forEach(tip => {
          const tipLines = this.wrapText(pdf, `• ${tip}`, PdfExportService.CONTENT_WIDTH - 20);
          tipLines.forEach(line => {
            pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
            yPosition += 14;
          });
        });
      }
      yPosition += 20;
    }

    // Tipping Etiquette
    if (plan.tipEtiquette) {
      yPosition = this.addSection(pdf, 'Tipping Etiquette', yPosition);
      
      Object.entries(plan.tipEtiquette).forEach(([category, tip]) => {
        if (yPosition > PdfExportService.PAGE_HEIGHT - 40) {
          pdf.addPage();
          yPosition = PdfExportService.MARGIN;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${category.charAt(0).toUpperCase() + category.slice(1)}:`, PdfExportService.MARGIN + 10, yPosition);
        yPosition += 16;
        
        pdf.setFont('helvetica', 'normal');
        const tipLines = this.wrapText(pdf, tip, PdfExportService.CONTENT_WIDTH - 20);
        tipLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 20, yPosition);
          yPosition += 14;
        });
        yPosition += 10;
      });
      yPosition += 20;
    }

    // Water Safety
    if (plan.tapWaterSafe) {
      yPosition = this.addSection(pdf, 'Water Safety', yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const waterStatus = plan.tapWaterSafe.safe ? 'Tap water is safe to drink.' : 'Tap water is not recommended for drinking.';
      pdf.text(waterStatus, PdfExportService.MARGIN + 10, yPosition);
      yPosition += 16;
      
      if (plan.tapWaterSafe.details) {
        const detailLines = this.wrapText(pdf, plan.tapWaterSafe.details, PdfExportService.CONTENT_WIDTH - 20);
        detailLines.forEach(line => {
          pdf.text(line, PdfExportService.MARGIN + 10, yPosition);
          yPosition += 14;
        });
      }
      yPosition += 20;
    }

    // Historical Context
    if (plan.history) {
      yPosition = this.addSection(pdf, 'Historical Context', yPosition);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const historyLines = this.wrapText(pdf, plan.history, PdfExportService.CONTENT_WIDTH - 10);
      historyLines.forEach(line => {
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

  private static addSection(pdf: jsPDF, title: string, yPosition: number): number {
    if (yPosition > PdfExportService.PAGE_HEIGHT - 100) {
      pdf.addPage();
      yPosition = PdfExportService.MARGIN;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, PdfExportService.MARGIN, yPosition);
    return yPosition + 30;
  }

  private static wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
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