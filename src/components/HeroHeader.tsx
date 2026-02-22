import { motion } from 'framer-motion';
import { Sparkles, Users, Shield, MapPin } from 'lucide-react';

const HeroHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl triton-gradient-accent p-8 md:p-10 mb-8"
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight mb-3">
            Meet your next<br />
            <span className="text-secondary">favorite ride.</span>
          </h1>
          <p className="text-primary-foreground/70 text-sm md:text-base max-w-md leading-relaxed">
            UCSD rides powered by real connections. Not just a ride — a social experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-3 mt-6"
        >
          {[
            { icon: <Users className="w-3.5 h-3.5" />, text: 'Social matching' },
            { icon: <Shield className="w-3.5 h-3.5" />, text: 'UCSD verified' },
            { icon: <MapPin className="w-3.5 h-3.5" />, text: '23 destinations' },
            { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Vibe-based' },
          ].map((item) => (
            <span
              key={item.text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-xs font-medium backdrop-blur-sm"
            >
              {item.icon}
              {item.text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-secondary/20 blur-3xl" />
    </motion.div>
  );
};

export default HeroHeader;
