"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const rings = [
  { transform: "rotateX(75deg)", className: "border-white/50" },
  { transform: "rotateY(75deg)", className: "border-white/50" },
  { transform: "rotateZ(75deg)", className: "border-[#FF0000]" },
];

export default function WireframeNode() {
  const [isSyncing, setIsSyncing] = useState(false);

  const forceSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div
      data-magnetic="true"
      onClick={forceSync}
      className="relative flex h-32 w-32 cursor-pointer items-center justify-center [perspective:1000px]"
    >
      <motion.div
        animate={{ rotateX: 360, rotateY: 360, rotateZ: 360 }}
        transition={{
          duration: isSyncing ? 2 : 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {rings.map((ring) => (
          <div
            key={ring.transform}
            className={`absolute inset-0 rounded-full border ${
              isSyncing
                ? "border-[#FF0000] shadow-[0_0_15px_#FF0000]"
                : ring.className
            }`}
            style={{ transform: ring.transform }}
          />
        ))}
      </motion.div>
    </div>
  );
}
