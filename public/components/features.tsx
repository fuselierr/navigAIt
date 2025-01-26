import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Features() {
  const words = [
    "Innovation", "Technology", "Integration", "Efficiency", "Scalability", "Performance",
    "Security", "Reliability", "Automation", "Flexibility", "Collaboration", "Support",
    "Data", "Insights", "Optimization", "Cloud", "Accessibility", "Intelligence"
  ];

  const [displayedWords, setDisplayedWords] = useState([]);

  useEffect(() => {
    setDisplayedWords(words);
  }, []);

  return (
    <div className="mt-12 bg-[#1A1744] p-8 rounded-lg shadow-lg overflow-y-auto" style={{ maxHeight: "calc(6 * 2.5rem)" }}>
      <h2 className="text-2xl font-bold text-[#87CEEB] mb-6">Why Choose navigAIt?</h2>
      <div className="flex flex-wrap gap-4">
        {displayedWords.map((word, index) => (
          <motion.div
            key={index}
            className="text-gray-300 italic text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.6 }}
          >
            <motion.span
              className="inline-block"
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              transition={{ duration: 0.6, ease: "linear", delay: index * 0.6 }}
              style={{ overflow: "hidden", whiteSpace: "nowrap", display: "inline-block" }}
            >
              {word}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
