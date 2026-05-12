export default function Spinner({
  size = 28,
  color = "#2563eb",
  thickness = 4,
}) {
  const radius = 50 - thickness * 2;
  const circumference = 2 * Math.PI * radius;
 
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}>
      <svg
        className="animate-spin-smooth"
        viewBox="0 0 100 100"
        style={{
          width: size,
          height: size,
          filter: "drop-shadow(0 0 4px rgba(0,0,0,0.1))",
        }}>
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={thickness}
          fill="none"
        />
        {/* Foreground Animated Arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          fill="none"
          className="animate-spinner-dash"
        />
      </svg>

      <style>{`
  @keyframes spin-smooth {
    100% {
      transform: rotate(360deg);
    }
  }
  .animate-spin-smooth {
    animation: spin-smooth 1s linear infinite;
  }

  @keyframes spinner-dash {
    0% {
      stroke-dasharray: 1, ${circumference};
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: ${circumference / 2}, ${circumference};
      stroke-dashoffset: -${circumference / 4};
    }
    100% {
      stroke-dasharray: 1, ${circumference};
      stroke-dashoffset: -${circumference};
    }
  }
  .animate-spinner-dash {
    animation: spinner-dash 1.5s ease-in-out infinite;
  }
`}</style>
    </div>
  );
}
