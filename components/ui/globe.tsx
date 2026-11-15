"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

const COUNTRY_PHI_MAP: Record<string, number> = {
  "Turkey": -0.5,
  "United States": 1.5,
  "Germany": -0.2,
  "United Kingdom": 0,
  "France": -0.1,
  "Netherlands": -0.1,
  "Russia": -1.0,
  "Azerbaijan": -0.8,
  "Default": -0.5
};

export default function Globe({ className = "", topCountry }: { className?: string, topCountry?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const widthRef = useRef(0);
  
  const initialPhi = topCountry && COUNTRY_PHI_MAP[topCountry] !== undefined 
    ? COUNTRY_PHI_MAP[topCountry] 
    : COUNTRY_PHI_MAP["Default"];
    
  const phiRef = useRef(initialPhi);
  const thetaRef = useRef(0.25); // Başlangıç dikey (theta) açısı

  useEffect(() => {
    let globe: ReturnType<typeof createGlobe> | null = null;

    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize(); // Initial measurement

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
        phi: initialPhi,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.3, 0.3, 0.3], // Koyu gri kara parçaları
        markerColor: [0.1, 0.8, 1],
        glowColor: [1, 1, 1], // Parlak glow
        markers: [
          { location: [41.0082, 28.9784], size: 0.08 },
          { location: [39.9334, 32.8597], size: 0.06 },
          { location: [38.4192, 27.1287], size: 0.05 },
          { location: [51.5074, -0.1278], size: 0.04 },
          { location: [40.7128, -74.006], size: 0.06 },
          { location: [52.52, 13.405], size: 0.05 },
        ],
        onRender: (state) => {
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
          state.width = widthRef.current * 2;
          state.height = widthRef.current * 2;
        },
      });
      
      // opacity transition trick required by cobe standard pattern
      setTimeout(() => {
          if(canvasRef.current) canvasRef.current.style.opacity = '1';
      });
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (globe) globe.destroy();
    };
  }, [initialPhi]);

  return (
    <div className={`w-full max-w-[450px] aspect-square relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = { x: e.clientX, y: e.clientY };
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const deltaX = e.clientX - pointerInteracting.current.x;
            const deltaY = e.clientY - pointerInteracting.current.y;
            pointerInteracting.current = { x: e.clientX, y: e.clientY };
            phiRef.current += deltaX / 200;
            thetaRef.current += deltaY / 200;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const deltaX = e.touches[0].clientX - pointerInteracting.current.x;
            const deltaY = e.touches[0].clientY - pointerInteracting.current.y;
            pointerInteracting.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            phiRef.current += deltaX / 200;
            thetaRef.current += deltaY / 200;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          opacity: 0,
          transition: "opacity 1s ease"
        }}
      />
    </div>
  );
}
