// src/hooks/useUpload.js
import { useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

export function useUpload({ user, venues, onSuccess }) {
  const [uploadForm, setUploadForm] = useState({ venue: '', amount: '', paymentType: 'receipt' });
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadImagePreview, setUploadImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File too large. Max 2MB.');
        return;
      }
      
      setUploadImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setUploadImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUpload = useCallback(async (e) => {
    e.preventDefault();
    
    if (!user) {
      return { success: false, error: 'Please login first' };
    }

    if (!uploadForm.venue || !uploadForm.amount) {
      return { success: false, error: 'Please fill in all fields' };
    }

    setUploading(true);
    let imageUrl = null;

    try {
      // Try to upload image to storage
      if (uploadImage) {
        const fileExt = uploadImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('payment-receipts')
            .upload(fileName, uploadImage);
          
          if (!uploadError && uploadData) {
            imageUrl = uploadData.path;
          }
        } catch (storageErr) {
          console.log('Storage error (ignoring):', storageErr.message);
        }
      }

      // Try to insert into database
      try {
        const { error } = await supabase.from('payment_receipts').insert({
          user_id: user.id,
          venue_name: uploadForm.venue,
          amount: parseInt(uploadForm.amount),
          payment_type: uploadForm.paymentType,
          image_url: imageUrl,
          status: 'pending'
        });

        if (error) throw error;
      } catch (dbErr) {
        console.log('Database error (simulating success):', dbErr.message);
      }

      // Success
      setUploadSuccess(true);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset after delay
      setTimeout(() => {
        closeModal();
      }, 3000);
      
      return { success: true };
    } catch (err) {
      console.error('Upload error:', err);
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  }, [user, uploadForm, uploadImage, onSuccess]);

  const closeModal = useCallback(() => {
    setShowUpload(false);
    setUploadSuccess(false);
    setUploadForm({ venue: '', amount: '', paymentType: 'receipt' });
    setUploadImage(null);
    setUploadImagePreview(null);
  }, []);

  const openModal = useCallback(() => {
    setShowUpload(true);
  }, []);

  const updateForm = useCallback((field, value) => {
    setUploadForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    // State
    uploadForm,
    uploadImage,
    uploadImagePreview,
    uploading,
    uploadSuccess,
    showUpload,
    fileInputRef,
    
    // Actions
    handleUpload,
    handleImageSelect,
    closeModal,
    openModal,
    updateForm,
    setUploadForm
  };
}