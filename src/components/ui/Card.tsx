import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "glass" | "elevated" | "flat" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
}

const cardVariants = {
  default: "bg-background-card border border-border/50 shadow-card",
  glass: "bg-white/10 border border-white/20 backdrop-blur-xl shadow-glass",
  elevated: "bg-background-card border border-border/30 shadow-card-hover",
  flat: "bg-background-muted border border-border/30 shadow-none",
  gradient:
    "bg-gradient-to-br from-primary/5 via-background-card to-accent/5 border border-primary/20 shadow-card",
};

const cardSizes = {
  sm: "p-4 rounded-xl",
  md: "p-6 rounded-2xl",
  lg: "p-8 rounded-3xl",
  xl: "p-12 rounded-3xl",
};

export function Card({
  as: Component = "div",
  className,
  children,
  variant = "default",
  size = "md",
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "transition-all duration-300 hover:shadow-card-hover",
        cardVariants[variant],
        cardSizes[size],
        className,
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
      className={cn(
        "flex flex-col space-y-2 p-6 border-b border-border/20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({
  as: Component = "h3",
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        "text-xl font-bold leading-tight tracking-tight",
        "text-foreground",
        className,
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
        "text-sm text-foreground-secondary leading-relaxed",
        className,
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
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
