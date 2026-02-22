// src/hooks/useEmergency.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

export function useEmergency({ user }) {
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ location: '', description: '' });
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitRequest = useCallback(async (e) => {
    e.preventDefault();
    
    if (!user) {
      return { success: false, error: 'Please login first' };
    }

    if (!emergencyForm.location || !emergencyForm.description) {
      return { success: false, error: 'Please fill in all fields' };
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.from('emergency_requests').insert({
        user_id: user.id,
        location: emergencyForm.location,
        description: emergencyForm.description,
        status: 'pending'
      });

      if (error) throw error;

      setEmergencySuccess(true);
      setEmergencyForm({ location: '', description: '' });
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setEmergencySuccess(false);
        setShowEmergency(false);
      }, 5000);
      
      return { success: true };
    } catch (err) {
      console.error('Emergency request error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, emergencyForm]);

  const openModal = useCallback(() => {
    setShowEmergency(true);
    setEmergencySuccess(false);
  }, []);

  const closeModal = useCallback(() => {
    setShowEmergency(false);
    setEmergencySuccess(false);
    setEmergencyForm({ location: '', description: '' });
  }, []);

  const updateForm = useCallback((field, value) => {
    setEmergencyForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    // State
    showEmergency,
    emergencyForm,
    emergencySuccess,
    loading,
    
    // Actions
    submitRequest,
    openModal,
    closeModal,
    updateForm
  };
}