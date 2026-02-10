import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const COLORS = {
  blue: "#2374c4",
  red: "#db2432",
  yellow: "#feb21a",
};

// Map background colors to cursor colors (contrasting)
function getCursorColor(bgColor: string): string {
  const normalized = bgColor.toLowerCase();
  
  // Check for yellow backgrounds -> red cursor
  // Includes #feb21a, #feb21b, #f9b126, and RGB variations
  if (
    normalized.includes("feb21a") ||
    normalized.includes("feb21b") ||
    normalized.includes("f9b126") ||
    normalized.includes("254, 178, 26") ||
    normalized.includes("254, 178, 27") ||
    normalized.includes("249, 177, 38") ||
    normalized.includes("rgb(254, 178, 26)") ||
    normalized.includes("rgb(254, 178, 27)") ||
    normalized.includes("rgb(249, 177, 38)")
  ) {
    return COLORS.red;
  }
  
  // Check for blue backgrounds -> yellow cursor
  if (normalized.includes("2374c4") || normalized.includes("23, 116, 196") || normalized.includes("rgb(35, 116, 196)")) {
    return COLORS.yellow;
  }
  
  // Check for red backgrounds -> yellow cursor
  if (normalized.includes("db2432") || normalized.includes("219, 36, 50") || normalized.includes("rgb(219, 36, 50)")) {
    return COLORS.yellow;
  }
  
  // Check for cream/off-white backgrounds -> blue cursor
  if (normalized.includes("fdf4e3") || normalized.includes("253, 244, 227")) {
    return COLORS.blue;
  }
  
  // Check for white/light backgrounds -> blue cursor
  if (normalized.includes("255, 255, 255") || normalized === "rgb(255, 255, 255)") {
    return COLORS.blue;
  }
  
  // Check for black/dark backgrounds -> yellow cursor
  if (normalized.includes("rgb(0, 0, 0)") || normalized === "#000000" || normalized === "#000") {
    return COLORS.yellow;
  }
  
  // Default
  return COLORS.yellow;
}

function getBackgroundColor(element: Element | null): string {
  if (!element) return "#2374c4";
  
  let current: Element | null = element;
  
  while (current) {
    const style = window.getComputedStyle(current);
    const bg = style.backgroundColor;
    
    // Skip transparent backgrounds
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      return bg;
    }
    
    current = current.parentElement;
  }
  
  return "#2374c4";
}

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorColor, setCursorColor] = useState(COLORS.yellow);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const updateCursor = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const bgColor = getBackgroundColor(element);
    setCursorColor(getCursorColor(bgColor));
    
    // Check if hovering over clickable element
    if (element) {
      const style = window.getComputedStyle(element);
      const isClickable = 
        element.tagName === "A" || 
        element.tagName === "BUTTON" || 
        !!element.closest("a") || 
        !!element.closest("button") ||
        style.cursor === "pointer";
      setIsPointer(isClickable);
    }
  }, []);

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [updateCursor]);

  // Hide on touch devices
  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`
        *, *::before, *::after {
          cursor: none !important;
        }
      `}</style>
      
      {/* Solid circle cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full"
        style={{
          backgroundColor: cursorColor,
        }}
        animate={{
          x: position.x - (isPointer ? 20 : 12),
          y: position.y - (isPointer ? 20 : 12),
          width: isPointer ? 40 : 24,
          height: isPointer ? 40 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 30,
          mass: 0.4,
        }}
      />
    </>
  );
}
