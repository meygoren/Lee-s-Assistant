export function PriceTriangle({
  direction,
  className,
}: {
  direction: "up" | "down" | "flat";
  className?: string;
}) {
  if (direction === "flat") {
    return (
      <svg width="9" height="9" viewBox="0 0 10 10" className={className} aria-hidden="true">
        <rect x="1" y="4.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" className={className} aria-hidden="true">
      {direction === "up" ? (
        <polygon points="5,0 10,10 0,10" fill="currentColor" />
      ) : (
        <polygon points="0,0 10,0 5,10" fill="currentColor" />
      )}
    </svg>
  );
}
