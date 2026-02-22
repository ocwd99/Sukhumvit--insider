// src/constants/preferences.js
export const PREFERENCE_LABELS = {
  A: { en: 'Nightclub', zh: '夜店', ja: 'クラブ' },
  B: { en: 'Bar', zh: '酒吧', ja: 'バー' },
  C: { en: 'Lounge', zh: 'Lounge', ja: 'ラウンジ' },
  D: { en: 'Pub', zh: '酒吧', ja: 'パブ' },
  E: { en: 'Karaoke', zh: '卡拉OK', ja: 'カラオケ' },
  F: { en: 'Rooftop', zh: '高空酒吧', ja: 'ルーフトップ' },
  G: { en: 'Club', zh: '會員制酒吧', ja: '会員制クラブ' }
};

export const DECORATION_LEVELS = [
  { value: '老舊', label: { en: 'Aged', zh: '老舊', ja: '古い' } },
  { value: '普通', label: { en: 'Standard', zh: '普通', ja: '普通' } },
  { value: '中上', label: { en: 'Good', zh: '中上', ja: '良い' } },
  { value: '奢華', label: { en: 'Luxury', zh: '奢華', ja: '豪華' } }
];

export const FRIENDLINESS_LEVELS = [
  { value: '低', label: { en: 'Low', zh: '低', ja: '低' } },
  { value: '中', label: { en: 'Medium', zh: '中', ja: '中' } },
  { value: '高', label: { en: 'High', zh: '高', ja: '高' } }
];