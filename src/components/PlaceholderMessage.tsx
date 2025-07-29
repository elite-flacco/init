import { Card } from './ui/Card';
import { TravelerType } from '../types/travel';

interface PlaceholderMessageProps {
  travelerType: TravelerType;
}

export function PlaceholderMessage({ travelerType }: PlaceholderMessageProps) {
  if (!travelerType.showPlaceholder || !travelerType.placeholderMessage) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="card pt-12 text-center">
        <div className="text-6xl mb-6" aria-hidden="true">
          {travelerType.icon}
        </div>
        <h3 className="mb-12">{travelerType.greeting}</h3>
        <h6 className="mb-6 text-foreground-secondary">
          {travelerType.placeholderMessage}
        </h6>
      </Card>
    </div>
  );
}
