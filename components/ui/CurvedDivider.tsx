"use client";

interface CurvedDividerProps {
  fillColor?: string;
  bgColor?: string;
  flip?: boolean;
  variant?: "curve" | "blob" | "diagonal";
  className?: string;
}

export default function CurvedDivider({
  fillColor = "#ffffff",
  bgColor = "transparent",
  flip = false,
  variant = "curve",
  className = "",
}: CurvedDividerProps) {
  const paths = {
    curve: "M0,120 C360,0 1080,0 1440,120 L1440,120 L0,120 Z",
    blob: "M0,120 L0,80 C120,100 200,40 360,60 C520,80 600,20 720,40 C840,60 960,90 1080,50 C1200,10 1320,70 1440,60 L1440,120 Z",
    diagonal: "M0,120 L0,60 L1440,0 L1440,120 Z",
  };

  return (
    <div
      className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <svg
        className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill={fillColor}
          d={paths[variant]}
        />
      </svg>
    </div>
  );
}
