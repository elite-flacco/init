import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export function Card({ 
  as: Component = 'div', 
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm',
        'transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div 
      className={cn('flex flex-col space-y-1.5 p-6', className)} 
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ 
  as: Component = 'h3', 
  className, 
  children, 
  ...props 
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ 
  className, 
  children, 
  ...props 
}: CardDescriptionProps) {
  return (
    <p
      className={cn(
        'text-sm text-foreground-muted',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ 
  className, 
  children, 
  ...props 
}: CardContentProps) {
  return (
    <div 
      className={cn('p-6 pt-0', className)} 
      {...props}
    >
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ 
  className, 
  children, 
  ...props 
}: CardFooterProps) {
  return (
    <div 
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}
