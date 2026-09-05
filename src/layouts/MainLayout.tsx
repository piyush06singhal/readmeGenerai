import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CodeRain from '../components/CodeRain';

export default function MainLayout() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="app-background" aria-hidden="true">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="glowing-orb" />
      </div>
      <CodeRain />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
