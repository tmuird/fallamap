import { useUser } from "@clerk/react";
import { PassportView } from "./PassportView";
import { CollectionView } from "./CollectionView";
import { ActivityView } from "./ActivityView";
import { motion } from "framer-motion";

export default function UserProfile() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-falla-paper py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-20"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden ink-border shadow-solid mb-6 border-4">
            <img src={user?.imageUrl} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display italic mb-2 text-falla-ink">
            Bon dia, <span className="text-falla-fire">{user?.firstName || "Faller"}</span>
          </h1>
          <p className="text-falla-ink font-bold uppercase tracking-[0.2em] text-xs opacity-40">
            València's Street Art Scout
          </p>
        </motion.div>

        <PassportView />
        <CollectionView />
        <ActivityView />
      </div>
    </div>
  );
}
