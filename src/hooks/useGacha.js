// src/hooks/useGacha.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

export const gachaRewards = [
  { prize: { en: 'Free Drink Coupon', zh: '免費飲料券', ja: '無料ドリンク券' }, chance: '35%' },
  { prize: { en: 'VIP Upgrade', zh: 'VIP升級', ja: 'VIPアップグレード' }, chance: '15%' },
  { prize: { en: '500 THB Credit', zh: '500泰銖積分', ja: '500THBクレジット' }, chance: '10%' },
  { prize: { en: 'Private Tour', zh: '私人導覽', ja: 'プライベートツアー' }, chance: '5%' },
  { prize: { en: 'Mystery Box', zh: '神秘寶箱', ja: '謎のボックス' }, chance: '35%' },
];

export function useGacha({ user, profile, updateCredits, lang }) {
  const [activeGacha, setActiveGacha] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const spin = useCallback(async () => {
    // Check if user is logged in - let caller handle auth modal
    if (!user || !profile) {
      return false;
    }

    // Check if user has credits
    if (profile.credits < 1) {
      alert('No credits left! Please upload receipt to get more credits.');
      return false;
    }

    // Deduct credit locally
    const newCredits = profile.credits - 1;
    updateCredits(newCredits);
    setActiveGacha(true);
    setGachaResult(null);

    // Try to update credits in database
    try {
      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);
    } catch (err) {
      console.log('Credits update error (continuing):', err.message);
    }

    // Spin animation delay
    setTimeout(async () => {
      const rand = Math.random();
      let cumulative = 0;
      let result = '';

      for (const reward of gachaRewards) {
        cumulative += parseFloat(reward.chance) / 100;
        if (rand < cumulative) {
          result = reward.prize[lang] || reward.prize.en;
          break;
        }
      }

      // Fallback to first reward
      if (!result) result = gachaRewards[0].prize[lang] || gachaRewards[0].prize.en;

      setGachaResult(result);
      setActiveGacha(false);

      // Try to save result to database
      try {
        await supabase.from('gacha_results').insert({
          user_id: user.id,
          reward: result
        });
      } catch (err) {
        console.log('Gacha result save error:', err.message);
      }
    }, 2000);
  }, [user, profile, updateCredits, lang]);

  const resetResult = useCallback(() => {
    setGachaResult(null);
  }, []);

  return {
    activeGacha,
    gachaResult,
    loading,
    spin,
    resetResult,
    rewards: gachaRewards
  };
}