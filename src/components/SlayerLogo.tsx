import React from "react";

export const SlayerLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* A jagged, aggressive "S" / Blade mark */}
    <path d="M20 10L80 10L70 30L90 30L30 90L40 60L10 60L20 10Z" className="text-red-500" />
  </svg>
);
