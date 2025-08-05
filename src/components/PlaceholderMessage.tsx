import { TravelerType } from "../types/travel";
import { getTravelerTypeIcon } from "../utils/iconMapping";

interface PlaceholderMessageProps {
  travelerType: TravelerType;
  onContinue?: () => void;
}

export function PlaceholderMessage({
  travelerType,
  onContinue,
}: PlaceholderMessageProps) {
  if (!travelerType.showPlaceholder || !travelerType.placeholderMessage) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="group card-3d items-center justify-center text-center p-12 lift-hover">
        <div className="mb-6 rotate-hover group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" aria-hidden="true">
          {getTravelerTypeIcon(travelerType.id, "2xl")}
        </div>
        <h3 className="text-3d-title mb-12">{travelerType.greeting}</h3>
        <h6 className="mb-8 text-foreground-secondary font-medium">
          {travelerType.placeholderMessage}
        </h6>
      </div>
    </div>
  );
}
