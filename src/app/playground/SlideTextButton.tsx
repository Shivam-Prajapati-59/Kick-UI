"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  rest: {},
  hover: {},
  tap: { scale: 0.96 },
};

const circleVariants = {
  rest: {
    scale: 0,
    opacity: 0,
  },
  hover: {
    scale: 1,
    opacity: 1,
  },
};

const circleTransition = {
  type: "tween" as const,
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const, // same curve both ways, no residual settle
};

const slideVariants = {
  rest: {
    y: "0%",
  },
  hover: {
    y: "-50%",
  },
};

const slideTransition = {
  type: "spring" as const,
  stiffness: 250,
  damping: 22,
};

const DefaultIcon = () => (
  <svg
    className="h-10 w-10"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 23 18"
  >
    <path
      fill="currentColor"
      d="M19.46 1.496A18.3 18.3 0 0 0 14.785 0a.1.1 0 0 0-.077.034c-.197.37-.427.855-.58 1.226a17.2 17.2 0 0 0-5.257 0A11 11 0 0 0 8.278.034C8.268.01 8.234 0 8.202 0c-1.643.292-3.21.8-4.677 1.496-.011 0-.022.011-.033.022-2.98 4.578-3.8 9.032-3.395 13.44 0 .023.01.046.032.057 1.972 1.485 3.867 2.384 5.74 2.98.032.012.065 0 .076-.022.438-.619.833-1.271 1.172-1.957.022-.045 0-.09-.044-.101a13 13 0 0 1-1.796-.878c-.044-.022-.044-.09-.01-.123.12-.09.24-.192.36-.282a.07.07 0 0 1 .077-.01c3.768 1.765 7.831 1.765 11.555 0a.07.07 0 0 1 .077.01c.12.102.241.192.361.293.044.034.044.101-.01.124-.57.348-1.172.63-1.797.877-.044.011-.054.067-.044.101.351.686.745 1.338 1.172 1.957.033.011.066.023.099.011 1.884-.596 3.779-1.496 5.75-2.98a.06.06 0 0 0 .033-.056c.482-5.095-.8-9.515-3.395-13.44-.011-.012-.022-.023-.044-.023M7.688 12.27c-1.128 0-2.07-1.069-2.07-2.385s.92-2.384 2.07-2.384c1.16 0 2.08 1.08 2.07 2.384 0 1.316-.92 2.385-2.07 2.385m7.634 0c-1.128 0-2.07-1.069-2.07-2.385s.92-2.384 2.07-2.384c1.16 0 2.08 1.08 2.07 2.384 0 1.316-.91 2.385-2.07 2.385"
    ></path>
  </svg>
);

interface SlideTextButtonProps extends HTMLMotionProps<"button"> {
  initialText?: React.ReactNode;
  hoverText?: React.ReactNode;
}

export default function SlideTextButton({
  initialText = <DefaultIcon />,
  hoverText = <DefaultIcon />,
  className,
  ...props
}: SlideTextButtonProps) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "relative h-[66px] w-[70px] overflow-hidden rounded-md bg-secondary",
        className,
      )}
      {...props}
    >
      {/* Expanding Circle */}
      <motion.div
        variants={circleVariants}
        transition={circleTransition}
        style={{ willChange: "transform, opacity" }}
        className="absolute left-1/2 top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-foreground"
      />

      {/* Sliding Text */}
      <div className="relative z-10 h-full overflow-hidden">
        <motion.div
          variants={slideVariants}
          transition={slideTransition}
          className="h-[200%]"
        >
          <div className="flex h-1/2 items-center justify-center font-semibold text-2xl text-secondary-foreground">
            {initialText}
          </div>
          <div className="flex h-1/2 items-center justify-center font-semibold text-2xl text-primary-foreground">
            {hoverText}
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}
