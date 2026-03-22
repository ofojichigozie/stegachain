/**
 * StepCard — numbered step container used throughout sender / receiver flows.
 */

interface StepCardProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Dim the card when the step is not yet reachable. */
  disabled?: boolean;
}

export function StepCard({
  step,
  title,
  description,
  children,
  disabled = false,
}: StepCardProps) {
  return (
    <div
      className={`card transition-opacity duration-200 ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="step-badge">{step}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-0.5">{title}</h3>
          {description && <p className="text-xs text-gray-500 mb-4">{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
