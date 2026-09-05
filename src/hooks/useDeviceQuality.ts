import { useEffect, useState } from 'react';

export type QualityLevel = 'high' | 'medium' | 'low';

function detectQualityLevel(): QualityLevel {
  if (typeof window === 'undefined') return 'high';

  // Detect mobile / low-power devices
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile || (memory !== undefined && memory <= 4) || cores <= 4) {
    return 'low';
  }
  if ((memory !== undefined && memory <= 8) || cores <= 8) {
    return 'medium';
  }
  return 'high';
}

export function useDeviceQuality(): QualityLevel {
  const [quality, setQuality] = useState<QualityLevel>(() => detectQualityLevel());

  useEffect(() => {
    // Re-detect on visibility change in case of device changes
    const handleVisibility = () => {
      if (!document.hidden) {
        setQuality(detectQualityLevel());
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return quality;
}
