import React from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/persian';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showScore?: boolean;
  reviewCount?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 14,
  showScore = true,
  reviewCount,
  className = ''
}) => {
  const { language } = useApp();

  const formattedScore = language === 'fa' 
    ? toPersianDigits(rating.toFixed(1)) 
    : rating.toFixed(1);

  const formattedCount = reviewCount !== undefined 
    ? language === 'fa'
      ? toPersianDigits(reviewCount.toLocaleString('fa-IR'))
      : reviewCount.toLocaleString()
    : undefined;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showScore && (
        <span className="font-bold text-xs text-amber-500 dark:text-amber-400">
          {formattedScore}
        </span>
      )}
      <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of ${maxStars}`}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(1, rating - index));
          return (
            <div key={index} className="relative">
              <Star size={size} className="text-slate-300 dark:text-slate-700 fill-slate-300 dark:fill-slate-700" />
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star size={size} className="text-amber-400 fill-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {formattedCount && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({formattedCount})
        </span>
      )}
    </div>
  );
};
