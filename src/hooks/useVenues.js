// src/hooks/useVenues.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';

export function useVenues() {
  const [venues, setVenues] = useState([]);
  const [venuePackages, setVenuePackages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort states
  const [sortBy, setSortBy] = useState('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch all venues
  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('drink_price', { ascending: true });

      if (error) throw error;

      setVenues(data || []);
      
      // Fetch packages for all venues
      if (data?.length > 0) {
        await fetchPackagesForVenues(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch packages for multiple venues
  const fetchPackagesForVenues = async (venuesData) => {
    try {
      const packages = {};
      for (const v of venuesData) {
        const { data } = await supabase
          .from('venue_packages')
          .select('*')
          .eq('venue_id', v.id);
        if (data) packages[v.id] = data;
      }
      setVenuePackages(packages);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Sorted venues (pinned first, then by selected option)
  const sortedVenues = useMemo(() => {
    return [...venues].sort((a, b) => {
      // Pinned always first
      if (a.Pinned && !b.Pinned) return -1;
      if (!a.Pinned && b.Pinned) return 1;

      // Sort by selected option
      switch (sortBy) {
        case 'price':
          return a.drink_price - b.drink_price;
        case 'rating':
          return b.rating - a.rating;
        case 'decoration':
          const decorOrder = { '奢華': 4, '高': 3, '中': 2, '普通': 1, '低': 0 };
          const aDecor = decorOrder[a.decoration_level] || 0;
          const bDecor = decorOrder[b.decoration_level] || 0;
          return bDecor - aDecor;
        case 'friendliness':
          const friendOrder = { '高': 3, '中': 2, '普通': 1, '低': 0 };
          const aFriend = friendOrder[a.friendliness] || 0;
          const bFriend = friendOrder[b.friendliness] || 0;
          return bFriend - aFriend;
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return a.drink_price - b.drink_price;
      }
    });
  }, [venues, sortBy]);

  // Filtered venues (by category and search)
  const filteredVenues = useMemo(() => {
    return sortedVenues.filter(v => {
      const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
      const matchesSearch = !searchQuery ||
        (v.name && v.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.location && v.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [sortedVenues, categoryFilter, searchQuery]);

  return {
    // Data
    venues,
    venuePackages,
    loading,
    error,
    
    // Filter & Sort
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    
    // Computed
    sortedVenues,
    filteredVenues,
    
    // Actions
    fetchVenues,
    fetchPackagesForVenues
  };
}