'use client';

import { getTemplateComponent } from './templates';
import type { WeddingData, GuestData, DateParts } from './templates/types';

interface InvitationRendererProps {
  wedding: WeddingData;
  guest?: GuestData;
  dateParts: DateParts;
  isRSVP?: boolean;
}

export default function InvitationRenderer({ wedding, guest, dateParts, isRSVP = false }: InvitationRendererProps) {
  const templateId = wedding.invitationTemplate || 'classic';
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <TemplateComponent
      wedding={wedding}
      guest={guest}
      dateParts={dateParts}
      isRSVP={isRSVP}
    />
  );
}
