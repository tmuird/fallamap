import { motion } from "framer-motion";
import { title } from "@/components/primitives.ts";
import "../styles/globals.css";

export function FallamapHeader({ isVisible }) {
  // Animation variants
  const headerVariants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: -100 }, // Adjust these values as needed
  };

  return (
    <motion.div
      className="w-full flex flex-col items-center justify-center overflow-hidden rounded-md"
      initial="visible"
      animate={isVisible ? "visible" : "hidden"}
      variants={headerVariants}
      transition={{ duration: 0.8 }} // Customize the duration and easing
    >
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
        <span className={title({ color: "orange", size: "lg" })}>
          Welcome to{" "}
        </span>
        <span className={title({ color: "orange", size: "lg" })}>Fallamap</span>
      </h1>
    </motion.div>
  );
}
