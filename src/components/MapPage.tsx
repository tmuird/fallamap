import MapComponent from "./MapComponent";
import { motion } from "framer-motion";

export default function MapPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 overflow-hidden bg-falla-sand/20"
      style={{ top: "var(--content-top, 3.5rem)" }}
    >
      <div className="w-full h-full relative">
        <MapComponent />
      </div>
    </motion.div>
  );
}
