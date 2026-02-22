// src/components/features/Dashboard/VenueCard.jsx
import { Star } from 'lucide-react';

export function VenueCard({ venue, onClick }) {
  const {
    name,
    drink_price,
    rating,
    risk_level,
    category,
    decoration_level,
    location,
    Pinned
  } = venue;

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-purple-900/20 cursor-pointer transition"
    >
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-purple-900/50 rounded-lg flex items-center justify-center">
          <Star className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            {name}
            {Pinned && <span className="text-amber-400 text-xs">★</span>}
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              risk_level === 'Low' ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'
            }`}>
              {risk_level}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-purple-400">{category}</span>
            <span className="text-gray-600">|</span>
            <span className="text-amber-400">{decoration_level || '普通'}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-amber-500 font-bold">{drink_price}฿</div>
        <div className="text-xs text-gray-500">{rating} ★</div>
      </div>
    </div>
  );
}