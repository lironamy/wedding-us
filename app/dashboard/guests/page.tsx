import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Wedding from '@/lib/db/models/Wedding';
import { GuestManagement } from '@/components/dashboard/GuestManagement';
import GuestsPageHeader from '@/components/dashboard/GuestsPageHeader';

export default async function GuestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

  // Get user's wedding
  const wedding = await Wedding.findOne({
    userId: session.user.id,
    status: { $ne: 'archived' },
  }).lean() as any;

  if (!wedding) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">ניהול אורחים</h1>
          <p className="text-gray-600 mb-6">
            עליך ליצור חתונה לפני שתוכל להוסיף אורחים
          </p>
          <a
            href="/dashboard/settings"
            className="inline-block px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
          >
            צור חתונה
          </a>
        </div>
      </div>
    );
  }

  const weddingId = wedding._id.toString();

  // Prepare meal settings to pass to GuestManagement
  const mealSettings = {
    askAboutMeals: wedding.askAboutMeals !== false, // Default to true
    mealOptions: wedding.mealOptions || {
      regular: true,
      vegetarian: true,
      vegan: true,
      kids: true,
      glutenFree: true,
      other: true,
    },
    customOtherMealName: wedding.customOtherMealName || '',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <GuestsPageHeader />
      <GuestManagement weddingId={weddingId} mealSettings={mealSettings} />
    </div>
  );
}
