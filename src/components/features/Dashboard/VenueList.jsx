// src/components/features/Dashboard/VenueList.jsx
import { Search, DollarSign } from 'lucide-react';
import { VenueCard } from './VenueCard';
import { PREFERENCE_LABELS } from '../../../constants/preferences';

export function VenueList({
  venues,
  loading,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onVenueClick,
  showAll,
  onToggleShowAll,
  t
}) {
  const displayedVenues = showAll ? venues.slice(0, 20) : venues.slice(0, 5);

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-purple-500/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-amber-500" />
          <span>{t?.dashboard?.priceIndex || 'Price Index'}</span>
        </h3>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t?.dashboard?.search || 'Search venues...'}
              className="w-full sm:w-40 pl-9 pr-3 py-2 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-xs focus:border-purple-500 outline-none"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="py-2 px-3 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-xs"
          >
            <option value="price">{t?.dashboard?.sortPrice || 'Price'}</option>
            <option value="rating">{t?.dashboard?.sortRating || 'Rating'}</option>
            <option value="decoration">{t?.dashboard?.sortDecoration || 'Decoration'}</option>
            <option value="friendliness">{t?.dashboard?.sortFriendliness || 'Friendliness'}</option>
            <option value="location">{t?.dashboard?.sortLocation || 'Location'}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading venues...</div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayedVenues.map((venue, i) => (
              <VenueCard
                key={venue.id || i}
                venue={venue}
                onClick={() => onVenueClick(venue)}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onToggleShowAll}
              className="flex-1 py-3 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/10 transition text-sm"
            >
              {showAll 
                ? (t?.dashboard?.viewLess || 'Show Less') 
                : (t?.dashboard?.viewAll || 'View All Venues')
              }
            </button>
            
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="py-3 px-2 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-sm"
            >
              <option value="all">{t?.venues?.all || 'All'}</option>
              {Object.keys(PREFERENCE_LABELS).map(c => (
                <option key={c} value={c}>
                  {c} - {PREFERENCE_LABELS[c].en}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}