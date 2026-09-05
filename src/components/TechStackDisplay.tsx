import { motion } from 'framer-motion';
import type { TechStack } from '../types';

interface TechStackDisplayProps {
  techStack: TechStack;
}

const ease = [0.22, 1, 0.36, 1] as const;

function BadgeGroup({
  label,
  items,
  color,
  delay,
}: {
  label: string;
  items: string[];
  color: string;
  delay: number;
}) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      <h4 className="text-xs uppercase tracking-[0.15em] text-text-muted mb-3">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <motion.span
            key={item}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + i * 0.05 }}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: `${color}10`,
              borderColor: `${color}30`,
              color,
            }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function TechStackDisplay({ techStack }: TechStackDisplayProps) {
  const groups = [
    {
      label: 'Frameworks',
      items: techStack.frameworks,
      color: '#818CF8',
    },
    {
      label: 'Languages',
      items: techStack.languages,
      color: '#22D3EE',
    },
    {
      label: 'Tools',
      items: techStack.tools,
      color: '#A855F7',
    },
    {
      label: 'Runtimes',
      items: techStack.runtimes,
      color: '#10B981',
    },
  ];

  // Only show groups that have items
  const visibleGroups = groups.filter((g) => g.items.length > 0);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          Technology Stack
        </h3>
        {techStack.primary && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-accent-indigo to-accent-purple text-white rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Primary: {techStack.primary}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {visibleGroups.map((group, i) => (
          <BadgeGroup
            key={group.label}
            label={group.label}
            items={group.items}
            color={group.color}
            delay={0.1 + i * 0.1}
          />
        ))}

        {visibleGroups.length === 0 && (
          <p className="text-sm text-text-tertiary">
            No specific technologies detected for this repository.
          </p>
        )}
      </div>
    </div>
  );
}