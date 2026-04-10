'use client';

import { useEffect } from 'react';
import { gtagEvent } from '@/lib/gtag';

export default function ReportViewTracker({ businessName, grade }: { businessName: string; grade?: string }) {
  useEffect(() => {
    gtagEvent('report_viewed', { business_name: businessName, overall_grade: grade || 'unknown' });
  }, [businessName, grade]);

  return null;
}
