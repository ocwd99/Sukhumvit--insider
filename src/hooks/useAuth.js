// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current user session on mount
  useEffect(() => {
    checkUser();
  }, []);

  // Check user session
  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id);
      await checkAdmin(session.user.id);
    }
    setLoading(false);
  }

  // Fetch user profile
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }

  // Check if user is admin
  async function checkAdmin(userId) {
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setAdmin(data);
  }

  // Sign up new user
  async function signUp(email, password, preferences = []) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        credits: 50,
        preferences
      });
    }
    
    return data;
  }

  // Sign in existing user
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Give 50 credits on login (bonus)
    if (data.user) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', data.user.id)
          .single();
        
        const newCredits = (existingProfile?.credits || 0) + 50;
        await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', data.user.id);
        
        // Refresh profile
        await fetchProfile(data.user.id);
      } catch (e) {
        console.log('Credit update error:', e.message);
      }
      
      setUser(data.user);
      await checkAdmin(data.user.id);
    }
    
    return data;
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAdmin(null);
  }

  // Update credits
  async function updateCredits(newCredits) {
    if (!user) return;
    
    setProfile(prev => ({ ...prev, credits: newCredits }));
    
    try {
      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);
    } catch (err) {
      console.log('Credits update error:', err.message);
    }
  }

  return {
    user,
    profile,
    admin,
    loading,
    signUp,
    signIn,
    signOut,
    updateCredits,
    refreshProfile: fetchProfile
  };
}