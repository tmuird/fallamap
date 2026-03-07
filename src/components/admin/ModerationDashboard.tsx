import { ImageReview } from "./ImageReview";
import { CommentReview } from "./CommentReview";
import { motion } from "framer-motion";

export default function ModerationDashboard() {
  return (
    <div className="min-h-screen bg-falla-paper py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="brutal-pill inline-block mb-6 bg-white border-falla-ink/20 shadow-none px-4 py-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Admin</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-display text-falla-ink mb-4 leading-tight">
            Moderation <span className="text-falla-fire">HQ</span>
          </h1>
          <p className="text-falla-ink/60 font-medium text-lg">
            Review community submissions before they go live on the map.
          </p>
        </motion.div>

        <ImageReview />
        <CommentReview />
      </div>
    </div>
  );
}
