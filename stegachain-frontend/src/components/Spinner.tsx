/**
 * Spinner — lightweight inline loading indicator.
 */

interface SpinnerProps {
  size?: "sm" | "md";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const dim = size === "sm" ? "w-4 h-4 border-2" : "w-5 h-5 border-2";
  return (
    <span
      className={`inline-block rounded-full border-current border-t-transparent animate-spin ${dim}`}
      role="status"
      aria-label="Loading"
    />
  );
}
