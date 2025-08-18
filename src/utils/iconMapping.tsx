import React from "react";
import {
  TravelIcon3D,
  GlobeIcon3D,
  SuitcaseIcon3D,
  MapIcon3D,
  NotebookIcon3D,
  CameraIcon3D,
  SunglassesIcon3D,
  HelicopterIcon3D,
  PalmTreeIcon3D,
  CoffeeIcon3D,
} from "../components/ui/Icon3D";

// Hero icons composition
export function HeroIconsComposition() {
  return (
    <div className="relative w-full mx-auto h-60 sm:h-48 md:h-64 lg:h-80 flex items-center justify-center overflow-hidden">
      {/* Center focal point */}
      <div className="hidden md:block">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <GlobeIcon3D size="xl" animation="pulse" animationDelay="0.5s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <GlobeIcon3D size="lg" animation="pulse" animationDelay="0.5s" />
        </div>
      </div>

      {/* Top row - spread across full width with better spacing */}
      <div className="absolute top-1 left-2 transform translate-y-1/4">
        <TravelIcon3D size="3xl" animation="float" animationDelay="0s" />
      </div>
      <div className="hidden md:block absolute top-4 left-1/3 transform -translate-x-1/4">
        <NotebookIcon3D size="lg" animation="float" animationDelay="1s" />
      </div>

      <div className="hidden md:block">
        <div className="absolute top-1/4 right-1/3 transform translate-x-1/2 translate-y-1/8">
          <HelicopterIcon3D size="3xl" animation="float" animationDelay="2s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-1/4 right-1/3 transform translate-x-1/2 translate-y-1/4">
          <HelicopterIcon3D size="xl" animation="float" animationDelay="2s" />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="absolute top-6 right-2">
          <PalmTreeIcon3D size="xl" animation="float" animationDelay="2s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-6 left-8">
          <PalmTreeIcon3D size="lg" animation="float" animationDelay="2s" />
        </div>
      </div>

      {/* Middle row - responsive side positioning */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <div className="hidden md:block">
          <SuitcaseIcon3D size="xl" animation="float" animationDelay="1s" />
        </div>
        <div className="block md:hidden">
          <SuitcaseIcon3D size="lg" animation="float" animationDelay="1s" />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
          <CameraIcon3D size="2xl" animation="float" animationDelay="2s" />
        </div>
      </div>
      <div className="block md:hidden">
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
          <CameraIcon3D size="lg" animation="float" animationDelay="2s" />
        </div>
      </div>

      {/* Bottom row - spread across full width with clear spacing */}
      <div className="hidden md:block absolute bottom-2 left-12">
        <SunglassesIcon3D size="xl" animation="float" animationDelay="4s" />
      </div>
      <div className="hidden md:block absolute bottom-6 left-4 transform translate-x-1/4">
        <MapIcon3D size="2xl" animation="float" animationDelay="0.5s" />
      </div>
      <div className="hidden md:block absolute bottom-2 right-6">
        <CoffeeIcon3D size="lg" animation="float" animationDelay="5s" />
      </div>
    </div>
  );
}