import React from "react";

// Base 3D Icon component
export interface Icon3DProps {
  src: string;
  alt: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  animation?: "float" | "pulse" | "bounce" | "spin" | "spin-horizontal" | "none";
  animationDelay?: string;
}

const sizeClasses = {
  xs: "w-12 h-12",
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
  "2xl": "w-72 h-72",
  "3xl": "w-96 h-96",
};

const animationClasses = {
  float: "animate-float",
  pulse: "animate-pulse-slow",
  bounce: "animate-bounce-subtle",
  spin: "animate-spin-slow",
  "spin-horizontal": "animate-spin-horizontal",
  none: "",
};

export function Icon3D({
  src,
  alt,
  className = "",
  size = "md",
  animation = "none",
  animationDelay = "0s"
}: Icon3DProps) {
  const sizeClass = sizeClasses[size];
  const animationClass = animationClasses[animation];

  return (
    <div className={`${sizeClass} flex items-center justify-center overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        className={`object-contain ${src === "/icons/brain.png" ? "scale-150" : src === "/icons/map.png" ? "scale-250" : (animation === "none" || animation === "pulse" || animation === "bounce") ? "scale-200" : ""} ${animationClass} ${className}`}
        style={animationDelay !== "0s" ? { animationDelay } : undefined}
      />
    </div>
  );
}

// Predefined travel icon components
export function TravelIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/plane.png" alt="Travel" {...props} />;
}

export function GlobeIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/globe.png" alt="Globe" {...props} />;
}

export function SuitcaseIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/suitcase.png" alt="Suitcase" {...props} />;
}

export function MapIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/map.png" alt="Map" {...props} />;
}

export function NotebookIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/notebook.png" alt="Notebook" {...props} />;
}

export function CameraIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/camera.png" alt="Camera" {...props} />;
}

export function PassportIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/passport.png" alt="Passport" {...props} />;
}

export function SunglassesIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/sunglasses.png" alt="Sunglasses" {...props} />;
}

export function HelicopterIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/helicopter.png" alt="Helicopter" {...props} />;
}

// Alternative suitcase
export function Suitcase2Icon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/suitcase2.png" alt="Suitcase" {...props} />;
}

export function Sunglasses2Icon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/sunglasses2.png" alt="Sunglasses" {...props} />;
}

export function PalmTreeIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/palmtree.png" alt="Palm Tree" {...props} />;
}

export function BrainIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/brain.png" alt="Brain" {...props} />;
}

export function CalendarIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/calendar.png" alt="Calendar" {...props} />;
}

export function SpreadSheetIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/spreadsheet.png" alt="Spreadsheet" {...props} />;
}

export function MapPinIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/map-pin.png" alt="Map Pin" {...props} />;
}

export function CoffeeIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/coffee.png" alt="Coffee" {...props} />;
}

export function UtensilsIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/utensils.png" alt="Utensils" {...props} />;
}

export function HotelIcon3D(props: Omit<Icon3DProps, "src" | "alt">) {
  return <Icon3D src="/icons/house.png" alt="Hotel" {...props} />;
}