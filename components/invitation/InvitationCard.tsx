import { Card } from '@/components/ui/Card';
import Image from 'next/image';

interface InvitationCardProps {
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  description?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function InvitationCard({
  mediaUrl,
  mediaType,
  description,
  theme
}: InvitationCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Media Section */}
      {mediaUrl && (
        <div className="relative w-full aspect-video bg-gray-100">
          {mediaType === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-full object-cover"
            >
              הדפדפן שלך לא תומך בתגית video.
            </video>
          ) : (
            <Image
              src={mediaUrl}
              alt="תמונת החתונה"
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="p-8">
          <div
            className="text-center text-lg leading-relaxed whitespace-pre-line"
            style={{ color: theme.secondaryColor }}
          >
            {description}
          </div>
        </div>
      )}

      {/* Decorative Element */}
      <div className="flex justify-center py-6">
        <div
          className="w-24 h-1 rounded-full"
          style={{ backgroundColor: theme.primaryColor }}
        />
      </div>
    </Card>
  );
}
