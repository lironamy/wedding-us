'use client';

import { Button } from '@/components/ui/Button';

export default function ExportPDFButton() {
  return (
    <a href="/api/statistics/export-pdf" download>
      <Button variant="outline" size="sm">
        📄 יצוא PDF
      </Button>
    </a>
  );
}
