import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import { useReducedMotion } from './hooks/useReducedMotion';

// The /analyze route bundles the editor and markdown-preview stack (CodeMirror,
// react-markdown, rehype-highlight, highlight.js). Lazy-load it so that weight
// never blocks first paint of the landing page.
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading page">
          <div className="w-10 h-10 rounded-full border-2 border-accent-indigo/20 border-t-accent-indigo animate-spin" aria-hidden="true" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function PageTransitions() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route
              path="/about"
              element={
                <LazyRoute>
                  <AboutPage />
                </LazyRoute>
              }
            />
            <Route
              path="/analyze"
              element={
                <LazyRoute>
                  <AnalyzePage />
                </LazyRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return <PageTransitions />;
}
