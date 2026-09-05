import { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import WorkflowSection from '../components/WorkflowSection';
import Footer from '../components/Footer';

// Three.js is heavy — load the 3D scene lazily so it never blocks
// first paint of the landing page.
const Scene = lazy(() => import('../components/3d/Scene'));

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Hero />
      <WorkflowSection />
      <Footer />
    </>
  );
}
