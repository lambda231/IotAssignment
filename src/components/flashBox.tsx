"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type FlashBoxProps = {
  items: any[];
  children?: React.ReactNode;
  className?: string;
};

export default function FlashBox({
  items,
  children,
  className,
}: FlashBoxProps) {
  const [showFlash, setShowFlash] = useState(false);
  const prevLengthRef = useRef(items.length);

  useEffect(() => {
    const prevLength = prevLengthRef.current;
    if (items.length > prevLength) {
      setShowFlash(true);
      const timeout = setTimeout(() => setShowFlash(false), 300); // Flash duration
      return () => clearTimeout(timeout);
    }
    prevLengthRef.current = items.length;
  }, [items.length]);

  return (
    <motion.div
      initial={{
        backgroundColor: "rgb(255, 255, 255)",
        color: "rgb(255, 217, 0)",
      }}
      animate={
        showFlash
          ? {
              backgroundColor: ["rgb(255, 217, 0)", "rgb(255, 255, 255)"],
              color: ["rgb(0, 0, 0)", "rgb(255, 217, 0)"],
            }
          : {
              backgroundColor: ["rgb(255, 255, 255)", "rgb(255, 255, 255)"],
            }
      }
      transition={{
        duration: 0.2,
        times: [0, 1.0],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
