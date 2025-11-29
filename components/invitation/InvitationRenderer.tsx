'use client';

import { getTemplateComponent } from './templates';
import type { WeddingData, GuestData, DateParts, MealOptions } from './templates/types';

interface InvitationRendererProps {
  wedding: WeddingData;
  guest?: GuestData;
  dateParts: DateParts;
  isRSVP?: boolean;
  askAboutMeals?: boolean;
  mealOptions?: MealOptions;
  customOtherMealName?: string;
}

export default function InvitationRenderer({
  wedding,
  guest,
  dateParts,
  isRSVP = false,
  askAboutMeals = true,
  mealOptions,
  customOtherMealName
}: InvitationRendererProps) {
  const templateId = wedding.invitationTemplate || 'classic';
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <TemplateComponent
      wedding={wedding}
      guest={guest}
      dateParts={dateParts}
      isRSVP={isRSVP}
      askAboutMeals={askAboutMeals}
      mealOptions={mealOptions}
      customOtherMealName={customOtherMealName}
    />
  );
}
