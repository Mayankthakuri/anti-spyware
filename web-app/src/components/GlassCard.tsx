import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = false 
}) => {
  return (
    <motion.div
      className={`
        backdrop-blur-md bg-white/5 border border-white/10 rounded-xl
        ${glow ? 'shadow-lg shadow-cyber-400/20' : 'shadow-lg shadow-black/20'}
        ${hover ? 'hover:bg-white/10 hover:border-white/20' : ''}
        transition-all duration-300 ${className}
      `}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};