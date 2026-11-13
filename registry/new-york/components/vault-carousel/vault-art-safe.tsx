"use client";

import { motion } from "motion/react";
import {
  EASE,
  FACE_TOP,
  INK_C,
  IsoBox,
  Rise,
  Shadow,
  detail,
  useArt,
} from "./vault-art-core";

export function SafeArt() {
  const { id, accent: a, live, motionAllowed, sw } = useArt();
  return (
    <>
      <Shadow cy={252} rx={100} ry={26} />
      <Rise>
        <IsoBox
          x={120}
          y={186}
          w={78}
          h={10}
          r={10}
          skin="accent"
          bevel={false}
        />
      </Rise>
      <Rise delay={0.1} from={-24}>
        <IsoBox
          x={120}
          y={114}
          w={58}
          h={72}
          r={9}
          leftDecor={
            <>
              <rect x={7} y={8} width={44} height={56} rx={5} fill={FACE_TOP} />
              <rect
                x={10}
                y={11}
                width={38}
                height={50}
                rx={3}
                fill="none"
                {...detail(sw)}
                strokeOpacity={0.5}
              />
              {/* Dial spins in the door's plane while live. */}
              <motion.g
                initial={false}
                animate={{ rotate: live && motionAllowed ? [0, 200, 140] : 0 }}
                transition={
                  live && motionAllowed
                    ? { duration: 1.3, times: [0, 0.6, 1], ease: EASE }
                    : { type: "spring", stiffness: 120, damping: 16 }
                }
              >
                <circle cx={27} cy={36} r={14} fill={`url(#${id}-accv)`} />
                <circle cx={27} cy={36} r={4.5} fill={FACE_TOP} />
                <path
                  d="M27 22 V31.5 M27 40.5 V50 M13 36 H22.5 M31.5 36 H41"
                  fill="none"
                />
              </motion.g>
              <rect
                x={45}
                y={27}
                width={4}
                height={18}
                rx={2}
                fill={INK_C}
                stroke="none"
              />
            </>
          }
          rightDecor={
            <>
              <path
                d="M12 46 H34 M12 53 H34 M12 60 H34"
                fill="none"
                {...detail(sw)}
              />
              <motion.circle
                cx={30}
                cy={16}
                r={3.5}
                initial={false}
                animate={{ fill: live ? a.base : "#2b2c34" }}
                transition={{ duration: motionAllowed ? 0.3 : 0 }}
              />
            </>
          }
        />
      </Rise>
    </>
  );
}

// User-supplied illustrations keep their own viewBox; the frame fits each one
// into the 240x300 art box (~80% of its width).
