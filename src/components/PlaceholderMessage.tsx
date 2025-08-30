import { TravelerType } from "../types/travel";
import { getTravelerTypeIcon } from "../utils/iconMappingUtils";

interface PlaceholderMessageProps {
  travelerType: TravelerType;
  onContinue?: () => void;
}

export function PlaceholderMessage({ travelerType }: PlaceholderMessageProps) {
  if (!travelerType.showPlaceholder || !travelerType.placeholderMessage) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
      <div className="group card-3d items-center justify-center text-center p-2 sm:p-4 md:p-6 lift-hover">
        <div
          className="mb-2 sm:mb-4 rotate-hover group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"
          aria-hidden="true"
        >
          <div className="block sm:block md:hidden">
            {getTravelerTypeIcon(travelerType.id, "lg")}
          </div>
          <div className="hidden sm:hidden md:block">
            {getTravelerTypeIcon(travelerType.id, "2xl")}
          </div>
        </div>
        <h3 className="text-3d-title mb-12">{travelerType.greeting}</h3>
        <h6 className="mb-8 text-foreground-secondary font-medium">
          {travelerType.placeholderMessage}
        </h6>
      </div>
    </div>
  );
}
