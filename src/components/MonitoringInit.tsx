'use client';

import { useEffect } from 'react';
import { initDynatrace } from '@/lib/monitoring/dynatrace';

export function MonitoringInit() {
  useEffect(() => {
    // Initialize Dynatrace client-side monitoring
    initDynatrace();
  }, []);

  return null; // This component doesn't render anything
}

