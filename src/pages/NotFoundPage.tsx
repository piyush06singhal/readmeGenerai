import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

export default function NotFoundPage() {
  return (
    <section className="pt-40 pb-32 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="text-center"
      >
        <p className="font-mono text-7xl md:text-8xl font-bold text-aurora mb-6">
          404
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-text-secondary mb-10 max-w-md mx-auto leading-relaxed">
          This section doesn't exist — but your documentation does.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple text-white shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
      </motion.div>
    </section>
  );
}
