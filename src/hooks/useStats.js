// src/hooks/useStats.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export function useStats() {
  const [stats, setStats] = useState({
    verifiedMembers: 0,
    totalVenues: 0,
    satisfactionRate: 0,
    loading: true,
    error: null
  });

  const fetchStats = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch profiles count (verified users)
      const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) throw profilesError;

      // Fetch venues count
      const { count: venuesCount, error: venuesError } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });
      
      if (venuesError) throw venuesError;

      // Calculate satisfaction rate from venue ratings
      const { data: venuesData, error: venuesRatingError } = await supabase
        .from('venues')
        .select('rating');
      
      if (venuesRatingError) throw venuesRatingError;
      
      // Calculate average rating and convert to satisfaction percentage
      let satisfactionRate = 0;
      if (venuesData && venuesData.length > 0) {
        const totalRating = venuesData.reduce((sum, v) => sum + (v.rating || 0), 0);
        const avgRating = totalRating / venuesData.length;
        // Convert 5-star rating to percentage (e.g., 4.5 → 90%)
        satisfactionRate = Math.round((avgRating / 5) * 100 * 10) / 10;
      }

      setStats({
        verifiedMembers: profilesCount || 0,
        totalVenues: venuesCount || 0,
        satisfactionRate: satisfactionRate || 0,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    refresh: fetchStats
  };
}