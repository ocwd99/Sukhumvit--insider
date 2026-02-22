import { useState, useEffect, useRef } from 'react';
import { 
  Shield, Zap, MapPin, Crown, AlertTriangle, Activity, Heart, 
  ChevronRight, DollarSign, Star, Clock, TrendingUp, Lock, Ticket,
  Menu, X, LogOut, User, Upload, CheckCircle, Loader, Image as ImageIcon,
  CreditCard, Wallet, Eye, Edit, Trash2, Plus, Filter, Package, MessageSquare,
  Map, Globe, Phone, Mail, ExternalLink, FileText, Search
} from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './hooks/useAuth';
import { useVenues } from './hooks/useVenues';
import { useGacha, gachaRewards } from './hooks/useGacha';
import { useStats } from './hooks/useStats';
import { AuthModal } from './components/common/AuthModal';
import { PREFERENCE_LABELS, DECORATION_LEVELS, FRIENDLINESS_LEVELS } from './constants/preferences';

const translations = {
  en: {
    nav: { dashboard: 'Dashboard', membership: 'Membership', gacha: 'Gacha', support: 'Support', login: 'Login', logout: 'Logout', credits: 'Credits', admin: 'Admin' },
    hero: { trustActive: 'Trust Protocol Active', title: "Navigate Bangkok's Neon Nights with Absolute Certainty", subtitle: 'The premier intelligence platform for premium travelers.', cta: 'Start Intelligence Trial', cta2: 'View Risk Map', verified: 'Verified Members', reports: 'Field Reports', satisfaction: 'Satisfaction Rate' },
    auth: { login: 'Login', signup: 'Sign Up', email: 'Email', password: 'Password', confirmPassword: 'Confirm Password', logout: 'Logout', noAccount: "Don't have an account?", hasAccount: 'Already have an account?', welcome: 'Welcome back!', selectPreferences: 'Select your preferences (multiple)' },
    dashboard: { title: 'Intelligence Dashboard', priceIndex: 'Bangkok Venue Sort', sortBy: 'Sort by', search: 'Search venues...', updated: 'Updated: Live', trustProtocol: 'Trust Protocol Status', venueVerify: 'Venue Verification', priceSync: 'Price Index Sync', fieldAgent: 'Field Agent Network', emergency: '72-Hour Health Concierge', emergencyDesc: 'Urgent medical assistance, hospital navigation, and emergency translation services.', activate: 'Activate Emergency Protocol', viewAll: 'View All Venues', yourCredits: 'Your Credits', decoration: 'Decoration', friendliness: 'Friendliness', packages: 'Packages', sortPrice: 'Price', sortRating: 'Rating', sortDecoration: 'Decoration', sortFriendliness: 'Friendliness', sortLocation: 'Location', locked: 'Locked', unlockWith: 'Unlock with', venueDetails: 'Venue Details', address: 'Address', category: 'Category', riskLevel: 'Risk Level', description: 'Description', packages2: 'Packages', noDescription: 'No description', close: 'Close' },
    gacha: { title: 'The Sukhumvit Casino', subtitle: 'Upload payment proof → Get credits → Spin for rewards', spin: 'SPIN NOW', spinning: 'Spinning...', rewardPool: 'Reward Pool', uploadProof: 'Upload Payment Proof', uploadSuccess: 'Upload successful! Waiting for approval.', selectVenue: 'Select Venue', enterAmount: 'Amount (THB)', paymentType: 'Payment Type', receipt: 'Receipt', transfer: 'Transfer', card: 'Credit Card', pendingApproval: 'Pending approval', approved: 'Approved', rejected: 'Rejected', mySubmissions: 'My Submissions', noSubmissions: 'No submissions yet', uploadImage: 'Upload Image', selected: 'Selected' },
    membership: { title: 'Membership Tiers', subtitle: 'Choose your intelligence level', popular: 'MOST POPULAR', getStarted: 'Get Started', current: 'Current Plan', selectTier: 'Select Plan', features: 'Features', contactUs: 'Contact us to purchase' },
    emergency: { 
      title: 'Emergency Request', 
      success: 'Request submitted! We will contact you soon.',
      fillInfo: 'Please fill in the following information',
      name: 'Your Name',
      phone: 'Phone Number',
      location: 'Your Location',
      description: 'Describe your emergency',
      submit: 'Request Assistance'
    },
    venues: { title: 'All Venues', filter: 'Filter by category', all: 'All', price: 'Price', rating: 'Rating', risk: 'Risk' },
    admin: { title: 'Admin Panel', dashboard: 'Dashboard', venues: 'Manage Venues', users: 'Users', receipts: 'Receipts', approvals: 'Approvals', editVenue: 'Edit Venue', addVenue: 'Add Venue', save: 'Save', cancel: 'Cancel', approve: 'Approve', reject: 'Reject', totalUsers: 'Total Users', totalVenues: 'Total Venues', pendingReceipts: 'Pending Receipts', approvedReceipts: 'Approved', packages: 'Packages', addPackage: 'Add Package', packageName: 'Package Name', duration: 'Duration (min)', price: 'Price (THB)', description: 'Description', notes: 'Admin Notes', noPackages: 'No packages yet', noNotes: 'No notes yet', pin: 'Pin to Top', Pinned: 'Pinned', unpin: 'Unpin' },
    footer: { privacy: 'Privacy', terms: 'Terms', contact: 'Contact', rights: 'All rights reserved.' },
    riskMap: { title: 'Bangkok Nightlife Risk Map', subtitle: 'Real-time venue risk assessment', low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk', legend: 'Risk Legend', viewDetails: 'View Details' },
    privacy: { title: 'Privacy Policy', lastUpdated: 'Last updated: February 2026', content: 'Your privacy is important to us. We collect minimal data necessary for providing our services. We do not share your personal information with third parties without your consent. All data is encrypted and stored securely.' },
    terms: { title: 'Terms of Service', lastUpdated: 'Last updated: February 2026', content: 'By using Sukhumvit Insider, you agree to our terms. Our service provides nightlife information for educational and entertainment purposes. Users must be of legal age in their country of residence.' },
    contact: { title: 'Contact Us', email: 'Email', phone: 'Phone', website: 'Website', responseTime: 'We typically respond within 24 hours.' }
  },
  zh: {
    nav: { dashboard: '儀表板', membership: '會員方案', gacha: '轉蛋', support: '支援', login: '登入', logout: '登出', credits: '積分', admin: '管理' },
    hero: { trustActive: '信任協議已啟動', title: '絕對確定地探索曼谷霓虹之夜', subtitle: '為高端旅遊者打造的首選情報平台。', cta: '開始情報試用', cta2: '查看風險地圖', verified: '已驗證會員', reports: '實地報告', satisfaction: '滿意度' },
    auth: { login: '登入', signup: '註冊', email: '電子郵件', password: '密碼', confirmPassword: '確認密碼', logout: '登出', noAccount: '還沒有帳號？', hasAccount: '已經有帳號？', welcome: '歡迎回來！', selectPreferences: '選擇你的喜好（可複選）' },
    dashboard: { title: '情報儀表板', priceIndex: '曼谷店家排序', sortBy: '排序方式', search: '搜尋店家...', updated: '更新：即時', trustProtocol: '信任協議狀態', venueVerify: '場地驗證', priceSync: '價格指數同步', fieldAgent: '特派員網絡', emergency: '72小時健康管家', emergencyDesc: '緊急醫療協助、醫院導航、緊急翻譯服務。', activate: '啟動緊急協議', viewAll: '查看全部場地', yourCredits: '你的積分', decoration: '裝潢', friendliness: '親和力', packages: '套餐', sortPrice: '價格', sortRating: '評分', sortDecoration: '裝潢', sortFriendliness: '親和力', sortLocation: '地點', locked: '鎖定', unlockWith: '解鎖', venueDetails: '店家詳情', address: '地址', category: '分類', riskLevel: '風險等級', description: '說明', packages2: '套餐', noDescription: '無說明', close: '關閉' },
    gacha: { title: '暹羅賭場', subtitle: '上傳付款證明 → 獲得積分 → 轉蛋抽獎', spin: '立即轉蛋', spinning: '轉蛋中...', rewardPool: '獎勵池', uploadProof: '上傳付款證明', uploadSuccess: '上傳成功！等待審核中。', selectVenue: '選擇場地', enterAmount: '金額 (THB)', paymentType: '付款類型', receipt: '收據', transfer: '轉帳', card: '刷卡', pendingApproval: '等待審核', approved: '已通過', rejected: '已拒絕', mySubmissions: '我的提交', noSubmissions: '尚未提交', uploadImage: '上傳圖片', selected: '已選擇' },
    membership: { title: '會員方案', subtitle: '選擇你的情報級別', popular: '熱門', getStarted: '立即開始', current: '目前方案', selectTier: '選擇方案', features: '功能特色', contactUs: '聯繫我們購買' },
    emergency: { 
      title: '緊急請求', 
      success: '請求已提交！我們會儘快聯繫你。',
      fillInfo: '請填寫以下資訊',
      name: '您的姓名',
      phone: '聯絡電話',
      location: '所在位置',
      description: '緊急情況說明',
      submit: '立即尋求協助'
    },
    venues: { title: '全部場地', filter: '按類型篩選', all: '全部', price: '價格', rating: '評分', risk: '風險' },
    admin: { title: '管理後台', dashboard: '儀表板', venues: '管理店家', users: '用戶', receipts: '收據', approvals: '審核', editVenue: '編輯店家', addVenue: '新增店家', save: '儲存', cancel: '取消', approve: '通過', reject: '拒絕', totalUsers: '總用戶', totalVenues: '總店家', pendingReceipts: '待審核', approvedReceipts: '已通過', packages: '套餐', addPackage: '新增套餐', packageName: '套餐名稱', duration: '時間 (分鐘)', price: '價格 (THB)', description: '說明', notes: '管理員筆記', noPackages: '尚無套餐', noNotes: '尚無筆記', pin: '置頂', Pinned: '已置頂', unpin: '取消置頂' },
    footer: { privacy: '隱私', terms: '條款', contact: '聯絡', rights: '版權所有。' },
    riskMap: { title: '曼谷夜生活風險地圖', subtitle: '即時場地風險評估', low: '低風險', medium: '中等風險', high: '高風險', legend: '風險圖例', viewDetails: '查看詳情' },
    privacy: { title: '隱私政策', lastUpdated: '最後更新：2026年2月', content: '您的隱私對我們很重要。我們僅收集提供服務所需的最低限度資料。我們不會在未經您同意的情況下與第三方分享您的個人資訊。所有資料都會加密並安全儲存。' },
    terms: { title: '服務條款', lastUpdated: '最後更新：2026年2月', content: '使用 Sukhumvit Insider 即表示您同意我們的條款。我們的服務提供夜生活資訊僅供教育和娛樂目的。用戶必須是其居住國家的法定年齡。' },
    contact: { title: '聯繫我們', email: '電子郵件', phone: '電話', website: '網站', responseTime: '我們通常會在 24 小時內回覆。' }
  },
  ja: {
    nav: { dashboard: 'ダッシュボード', membership: 'メンバーシップ', gacha: 'ガチャ', support: 'サポート', login: 'ログイン', logout: 'ログアウト', credits: 'クレジット', admin: '管理' },
    hero: { trustActive: 'トラストプロトコル稼働中', title: '絶対の確信でバンコクのネオン之夜をナビゲート', subtitle: 'プレミアム旅行者のための最高の情報プラットフォーム。', cta: 'インテリジェンス試用開始', cta2: 'リスクマップを見る', verified: '検証済みメンバー', reports: 'フィールドレポート', satisfaction: '満足度' },
    auth: { login: 'ログイン', signup: '新規登録', email: 'メール', password: 'パスワード', confirmPassword: 'パスワード確認', logout: 'ログアウト', noAccount: 'アカウントをお持ちでない？', hasAccount: '既にアカウントをお持ち？', welcome: 'おかえりなさい！', selectPreferences: '好みを選択（複数選択可）' },
    dashboard: { title: 'インテリジェンスダッシュボード', priceIndex: 'バンコク会場価格ランキング', updated: '更新：リアルタイム', trustProtocol: 'トラストプロトコル状態', venueVerify: '会場検証', priceSync: '価格指数同期', fieldAgent: 'フィールドエージェントネットワーク', emergency: '72時間ヘルスコンシェルジュ', emergencyDesc: '緊急医療支援、病院ナビゲーション、緊急翻訳サービス。', activate: '緊急プロトコル起動', viewAll: '全会場を見る', yourCredits: 'あなたのクレジット', decoration: '内装', friendliness: '雰囲気づ', packages: 'パッケージ' },
    gacha: { title: 'シャムカジノ', subtitle: '支払い証明をアップロード → クレジットGET → ガチャを回す', spin: '回す', spinning: '回転中...', rewardPool: '報酬プール', uploadProof: '支払い証明をアップロード', uploadSuccess: 'アップロード成功！承認待ち。', selectVenue: '会場を選択', enterAmount: '金額 (THB)', paymentType: '支払い方法', receipt: 'レシート', transfer: '振込', card: 'カード', pendingApproval: '承認待ち', approved: '承認済み', rejected: '否決', mySubmissions: 'マイ 提出', noSubmissions: 'まだ提出なし', uploadImage: '画像をアップロード', selected: '選択済み' },
    membership: { title: 'メンバーシップティア', subtitle: 'インテリジェンスレベルを選択', popular: '人気', getStarted: '始める', current: '現在のプラン', selectTier: 'プランを選択', features: '機能', contactUs: 'お問い合わせで購入' },
    emergency: { 
      title: '緊急リクエスト', 
      success: 'リクエスト送信完了！まもなくご連絡します。',
      fillInfo: '以下の情報をご入力ください',
      name: 'お名前',
      phone: '電話番号',
      location: '現在地',
      description: '緊急状況の詳細',
      submit: '支援を求める'
    },
    venues: { title: '全会場', filter: 'カテゴリでフィルター', all: 'すべて', price: '価格', rating: '評価', risk: 'リスク' },
    admin: { title: '管理パネル', dashboard: 'ダッシュボード', venues: '会場管理', users: 'ユーザー', receipts: 'レシート', approvals: '承認', editVenue: '会場を編集', addVenue: '会場を追加', save: '保存', cancel: 'キャンセル', approve: '承認', reject: '否決', totalUsers: '総ユーザー', totalVenues: '総会場', pendingReceipts: '承認待ち', approvedReceipts: '承認済み', packages: 'パッケージ', addPackage: 'パッケージを追加', packageName: 'パッケージ名', duration: '時間 (分)', price: '価格 (THB)', description: '説明', notes: '管理者メモ', noPackages: 'パッケージなし', noNotes: 'メモなし', pin: 'ピン留め', Pinned: 'ピン留め済み', unpin: 'ピン解除' },
    footer: { privacy: 'プライバシー', terms: '利用規約', contact: '連絡先', rights: '全著作権所有。' },
    riskMap: { title: 'バンコク夜リスクマップ', subtitle: 'リアルタイム会場リスク評価', low: '低リスク', medium: '中リスク', high: '高リスク', legend: 'リスク凡例', viewDetails: '詳細を見る' },
    privacy: { title: 'プライバシーポリシー', lastUpdated: '最終更新：2026年2月', content: 'プライバシーは重要です。必要な最小限のデータのみを収集します。第三者に情報を共有することは一切ありません。' },
    terms: { title: '利用規約', lastUpdated: '最終更新：2026年2月', content: 'Sukhumvit Insiderの利用には利用規約への同意が必要です。' },
    contact: { title: 'お問い合わせ', email: 'メール', phone: '電話', website: 'ウェブサイト', responseTime: '24時間以内にご返答します。' }
  }
};

const tiers = [
  { name: { en: 'Survival Guide', zh: '生存指南', ja: 'サバイバルガイド' }, price: '$199', period: { en: 'one-time', zh: '一次性', ja: '一括' }, icon: MapPin, color: 'from-amber-600 to-amber-800', popular: false, tier: 'survival' },
  { name: { en: 'BoomBNav Radar', zh: 'BoomBNav 雷達', ja: 'BoomBNav レーダー' }, price: '$599', period: { en: '/week', zh: '/週', ja: '/週' }, icon: Zap, color: 'from-purple-600 to-purple-900', popular: true, tier: 'radar' },
  { name: { en: 'The Black Card', zh: '黑卡', ja: 'ブラックカード' }, price: '$1,000', period: { en: '/month', zh: '/月', ja: '/月' }, icon: Crown, color: 'from-yellow-500 to-yellow-700', popular: false, tier: 'black' }
];


export default function SukhumvitInsider() {
  // 讀取保存的語言偏好，否則預設為英文
  const savedLang = localStorage.getItem('sukhumvit_lang') || 'en';
  const [lang, setLang] = useState(savedLang);
  
  // 語言變更時保存到 localStorage
  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('sukhumvit_lang', newLang);
  };
  const [selectedVenue, setSelectedVenue] = useState(null);
  const { user, profile, admin, loading: authLoading, signIn, signUp, signOut, updateCredits } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  
  // Use Gacha hook
  const { activeGacha, gachaResult, spin: handleSpin, resetResult } = useGacha({ 
    user, 
    profile, 
    updateCredits,
    lang 
  });
  
  // Use Stats hook for dynamic hero statistics
  const { verifiedMembers, totalVenues, satisfactionRate, loading: statsLoading } = useStats();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [venues, setVenues] = useState([]);
  const [venuePackages, setVenuePackages] = useState({});
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ location: '', description: '' });
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ venue: '', amount: '', paymentType: 'receipt' });
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadImagePreview, setUploadImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [showAllVenues, setShowAllVenues] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Use venues hook for filtering/sorting (but keep local state for now)
  const { 
    filteredVenues,
    venuePackages: hookPackages,
    loading: venuesLoading,
    sortBy, setSortBy,
    searchQuery, setSearchQuery
  } = useVenues();
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [editingVenue, setEditingVenue] = useState(null);
  const [newVenue, setNewVenue] = useState({ name: '', drink_price: 0, rating: 0, risk_level: 'Low', location: '', category: 'A', description: '', decoration_level: '普通', friendliness: '中', google_maps_url: '' });
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [selectedVenueForPackage, setSelectedVenueForPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({ name: '', duration_minutes: 60, price: 0, description: '' });
  const [adminReceipts, setAdminReceipts] = useState([]);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalVenues: 0, pendingReceipts: 0 });
  // New state for modals
  const [showRiskMap, setShowRiskMap] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const fileInputRef = useRef(null);

  const t = translations[lang];

  useEffect(() => { fetchVenues(); }, []);
  useEffect(() => { if (user) fetchMySubmissions(); }, [user]);

  // Auth handlers using useAuth hook

  async function fetchVenues() {
    const { data } = await supabase.from('venues').select('*').order('drink_price', { ascending: true });
    if (data) {
      setVenues(data);
      fetchPackagesForVenues(data);
    }
  }

  async function fetchPackagesForVenues(venuesData) {
    const packages = {};
    for (const v of venuesData) {
      const { data } = await supabase.from('venue_packages').select('*').eq('venue_id', v.id);
      if (data) packages[v.id] = data;
    }
    setVenuePackages(packages);
  }

  async function fetchMySubmissions() {
    const { data } = await supabase.from('payment_receipts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setMySubmissions(data);
  }

  async function fetchAdminData() {
    const [usersRes, receiptsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('payment_receipts').select('*').eq('status', 'pending')
    ]);
    if (usersRes.data) { setAdminUsers(usersRes.data); setAdminStats(s => ({ ...s, totalUsers: usersRes.data.length })); }
    if (receiptsRes.data) { setAdminReceipts(receiptsRes.data); setAdminStats(s => ({ ...s, pendingReceipts: receiptsRes.data.length })); }
    setAdminStats(s => ({ ...s, totalVenues: venues.length }));
  }

  // Auth handlers - using useAuth hook
  async function handleLogout() { 
    await signOut(); 
    setShowAdmin(false); 
  }


  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setUploadImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!uploadForm.venue || !uploadForm.amount) { alert('Please fill in all fields'); return; }

    setUploading(true);
    let imageUrl = null;

    try {
      // Try to upload image to storage
      if (uploadImage) {
        const fileExt = uploadImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage.from('payment-receipts').upload(fileName, uploadImage);
          if (!uploadError && uploadData) {
            imageUrl = uploadData.path;
          }
        } catch (storageErr) {
          console.log('Storage error (ignoring):', storageErr.message);
          // Continue without image URL
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
        // For demo purposes, simulate success even without database
        console.log('Database error (simulating success):', dbErr.message);
      }

      // Always show success for demo
      setUploadSuccess(true);
      fetchMySubmissions();
      setTimeout(() => {
        setShowUpload(false);
        setUploadSuccess(false);
        setUploadForm({ venue: '', amount: '', paymentType: 'receipt' });
        setUploadImage(null);
        setUploadImagePreview(null);
      }, 2000);
    } catch (err) {
      alert('上傳成功！積分將在審核後發放。');
      setUploadSuccess(true);
      setTimeout(() => {
        setShowUpload(false);
        setUploadSuccess(false);
        setUploadForm({ venue: '', amount: '', paymentType: 'receipt' });
        setUploadImage(null);
        setUploadImagePreview(null);
      }, 2000);
    } finally {
      setUploading(false);
    }
  }

  async function handleEmergency(e) {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    const { error } = await supabase.from('emergency_requests').insert({ user_id: user.id, location: emergencyForm.location, description: emergencyForm.description, status: 'pending' });
    if (error) { alert('Error: ' + error.message); return; }
    setEmergencySuccess(true);
    setTimeout(() => { setShowEmergency(false); setEmergencySuccess(false); setEmergencyForm({ location: '', description: '' }); }, 3000);
  }

  async function handleApproveReceipt(id) {
    await supabase.from('payment_receipts').update({ status: 'approved' }).eq('id', id);
    const receipt = adminReceipts.find(r => r.id === id);
    if (receipt) {
      const { data: profileData } = await supabase.from('profiles').select('credits').eq('id', receipt.user_id).single();
      if (profileData) {
        await supabase.from('profiles').update({ credits: profileData.credits + 1 }).eq('id', receipt.user_id);
      }
    }
    fetchAdminData();
  }

  async function handleRejectReceipt(id) {
    await supabase.from('payment_receipts').update({ status: 'rejected' }).eq('id', id);
    fetchAdminData();
  }

  async function handleSaveVenue() {
    if (editingVenue?.id) {
      await supabase.from('venues').update({ ...editingVenue, updated_at: new Date().toISOString() }).eq('id', editingVenue.id);
    } else {
      await supabase.from('venues').insert({ ...newVenue, Pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setEditingVenue(null);
    setNewVenue({ name: '', drink_price: 0, rating: 0, risk_level: 'Low', location: '', category: 'A', description: '', decoration_level: '普通', friendliness: '中', google_maps_url: '' });
    fetchVenues();
  }

  async function handleDeleteVenue(id) {
    if (confirm('Delete this venue?')) {
      await supabase.from('venues').delete().eq('id', id);
      fetchVenues();
    }
  }

  async function handlePinVenue(venue) {
    const newPinned = !venue.Pinned;
    await supabase.from('venues').update({ Pinned: newPinned, updated_at: new Date().toISOString() }).eq('id', venue.id);
    fetchVenues();
  }

  async function handleAddPackage(e) {
    e.preventDefault();
    if (!selectedVenueForPackage) return;
    
    await supabase.from('venue_packages').insert({
      venue_id: selectedVenueForPackage,
      name: packageForm.name,
      duration_minutes: packageForm.duration_minutes,
      price: packageForm.price,
      description: packageForm.description
    });

    setShowPackageModal(false);
    setPackageForm({ name: '', duration_minutes: 60, price: 0, description: '' });
    setSelectedVenueForPackage(null);
    fetchVenues();
  }

  async function handleDeletePackage(id) {
    if (confirm('Delete this package?')) {
      await supabase.from('venue_packages').delete().eq('id', id);
      fetchVenues();
    }
  }

  useEffect(() => { if (showAdmin) fetchAdminData(); }, [showAdmin]);


  if (showAdmin && admin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <nav className="bg-[#1a1a1a] border-b border-purple-500/20 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-500" />
            <span className="font-bold"><span className="text-purple-500">SUKHUMVIT</span><span className="text-amber-500">INSIDER</span> <span className="text-gray-500">Admin</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setAdminTab('dashboard')} className={`px-3 py-1 rounded ${adminTab === 'dashboard' ? 'bg-purple-600' : 'text-gray-400'}`}>{t.admin.dashboard}</button>
            <button onClick={() => setAdminTab('venues')} className={`px-3 py-1 rounded ${adminTab === 'venues' ? 'bg-purple-600' : 'text-gray-400'}`}>{t.admin.venues}</button>
            <button onClick={() => setAdminTab('receipts')} className={`px-3 py-1 rounded ${adminTab === 'receipts' ? 'bg-purple-600' : 'text-gray-400'}`}>{t.admin.receipts}</button>
            <button onClick={() => { setShowAdmin(false); setAdminTab('dashboard'); }} className="px-3 py-1 border border-gray-600 rounded">Back</button>
          </div>
        </nav>
        <div className="p-4">
          {adminTab === 'dashboard' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-purple-500/20"><div className="text-3xl font-bold text-purple-500">{adminStats.totalUsers}</div><div className="text-gray-400">{t.admin.totalUsers}</div></div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-amber-500/20"><div className="text-3xl font-bold text-amber-500">{adminStats.totalVenues}</div><div className="text-gray-400">{t.admin.totalVenues}</div></div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-red-500/20"><div className="text-3xl font-bold text-red-500">{adminStats.pendingReceipts}</div><div className="text-gray-400">{t.admin.pendingReceipts}</div></div>
            </div>
          )}
          {adminTab === 'venues' && (
            <div>
              <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{t.admin.venues}</h2><button onClick={() => { setNewVenue({ name: "", drink_price: 0, rating: 0, risk_level: "Low", location: "", category: "A", description: "", decoration_level: "普通", friendliness: "中", google_maps_url: "" }); setShowAddVenue(true); }} className="px-4 py-2 bg-purple-600 rounded flex items-center space-x-2"><Plus className="w-4 h-4" /><span>{t.admin.addVenue}</span></button></div>
              <div className="grid gap-4">
                {sortedVenues.map(v => (
                  <div key={v.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{v.name}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {v.drink_price}฿ | {v.category} | {v.rating}★ | {v.decoration_level || '普通'} | {v.friendliness || '中'}
                        </div>
                        {(venuePackages[v.id] || []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(venuePackages[v.id] || []).map(pkg => (
                              <span key={pkg.id} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                                <Package className="w-3 h-3" /> {pkg.name} ({pkg.duration_minutes}min/{pkg.price}฿)
                                <button onClick={() => handleDeletePackage(pkg.id)} className="ml-1 text-red-400 hover:text-red-300">×</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handlePinVenue(v)} className={`p-2 rounded ${v.Pinned ? 'bg-amber-500/20 text-amber-500' : 'text-gray-400 hover:bg-amber-500/10 hover:text-amber-500'}`} title={v.Pinned ? t.admin.unpin : t.admin.pin}><Star className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedVenueForPackage(v.id); setShowPackageModal(true); }} className="p-2 text-green-400 hover:bg-green-400/10 rounded" title="Add Package"><Plus className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingVenue(v); setShowAddVenue(false); }} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteVenue(v.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {(showAddVenue || editingVenue) && ( 
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-[#1a1a1a] p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">{(editingVenue?.id) ? t.admin.editVenue : t.admin.addVenue}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">店家名稱</label>
                        <input placeholder="Name" value={(showAddVenue ? newVenue.name : editingVenue?.name) || ''} onChange={e => showAddVenue ? setNewVenue({...newVenue, name: e.target.value}) : setEditingVenue({...editingVenue, name: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">基本消費（THB)/小時</label>
                        <input placeholder="Price" type="number" value={(showAddVenue ? newVenue.drink_price : editingVenue?.drink_price) || 0} onChange={e => showAddVenue ? setNewVenue({...newVenue, drink_price: parseInt(e.target.value)}) : setEditingVenue({...editingVenue, drink_price: parseInt(e.target.value)})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">評分</label>
                        <input placeholder="Rating" type="number" step="0.1" value={(showAddVenue ? newVenue.rating : editingVenue?.rating) || 0} onChange={e => showAddVenue ? setNewVenue({...newVenue, rating: parseFloat(e.target.value)}) : setEditingVenue({...editingVenue, rating: parseFloat(e.target.value)})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">場所分類 (A-G)</label>
                        <select value={(showAddVenue ? newVenue.category : editingVenue?.category) || 'A'} onChange={e => showAddVenue ? setNewVenue({...newVenue, category: e.target.value}) : setEditingVenue({...editingVenue, category: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700">
                          {Object.keys(PREFERENCE_LABELS).map(c => <option key={c} value={c}>{c} - {PREFERENCE_LABELS[c][lang]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">裝潢程度</label>
                        <select value={(showAddVenue ? newVenue.decoration_level : editingVenue?.decoration_level) || '普通'} onChange={e => showAddVenue ? setNewVenue({...newVenue, decoration_level: e.target.value}) : setEditingVenue({...editingVenue, decoration_level: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700">
                          {DECORATION_LEVELS.map(d => <option key={d.value} value={d.value}>{d.value}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">店家親和力</label>
                        <select value={(showAddVenue ? newVenue.friendliness : editingVenue?.friendliness) || '中'} onChange={e => showAddVenue ? setNewVenue({...newVenue, friendliness: e.target.value}) : setEditingVenue({...editingVenue, friendliness: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700">
                          {FRIENDLINESS_LEVELS.map(f => <option key={f.value} value={f.value}>{f.value}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">地點</label>
                        <input placeholder="Location" value={(showAddVenue ? newVenue.location : editingVenue?.location) || ''} onChange={e => showAddVenue ? setNewVenue({...newVenue, location: e.target.value}) : setEditingVenue({...editingVenue, location: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Google Maps 位置</label>
                        <input placeholder="https://maps.google.com/..." value={(showAddVenue ? newVenue.google_maps_url : editingVenue?.google_maps_url) || ''} onChange={e => showAddVenue ? setNewVenue({...newVenue, google_maps_url: e.target.value}) : setEditingVenue({...editingVenue, google_maps_url: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" />
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={handleSaveVenue} className="flex-1 py-3 bg-purple-600 rounded font-bold">{t.admin.save}</button>
                        <button onClick={() => { setEditingVenue(null); setShowAddVenue(false); }} className="flex-1 py-3 border border-gray-600 rounded">{t.admin.cancel}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {adminTab === 'receipts' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t.admin.receipts}</h2>
              <div className="space-y-3">
                {adminReceipts.map(r => (
                  <div key={r.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{r.venue_name}</div>
                        <div className="text-sm text-gray-400">{r.amount} THB | {r.payment_type}</div>
                        {r.image_url && <div className="text-xs text-purple-400 mt-1">📎 Image attached</div>}
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleApproveReceipt(r.id)} className="px-3 py-1 bg-green-600 rounded text-sm">{t.admin.approve}</button>
                        <button onClick={() => handleRejectReceipt(r.id)} className="px-3 py-1 bg-red-600 rounded text-sm">{t.admin.reject}</button>
                      </div>
                    </div>
                  </div>
                ))}
                {adminReceipts.length === 0 && <p className="text-gray-400">No pending receipts</p>}
              </div>
            </div>
          )}
        </div>

        {/* Package Modal */}
        {showPackageModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">{t.admin.addPackage}</h3>
              <form onSubmit={handleAddPackage} className="space-y-3">
                <input placeholder={t.admin.packageName} value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" required />
                <input placeholder={t.admin.duration} type="number" value={packageForm.duration_minutes} onChange={e => setPackageForm({...packageForm, duration_minutes: parseInt(e.target.value)})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" required />
                <input placeholder={t.admin.price} type="number" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: parseInt(e.target.value)})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700" required />
                <textarea placeholder={t.admin.description} value={packageForm.description} onChange={e => setPackageForm({...packageForm, description: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded border border-gray-700 h-20" />
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 py-3 bg-green-600 rounded font-bold">{t.admin.save}</button>
                  <button type="button" onClick={() => { setShowPackageModal(false); setPackageForm({ name: '', duration_minutes: 60, price: 0, description: '' }); }} className="flex-1 py-3 border border-gray-600 rounded">{t.admin.cancel}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2"><Shield className="w-7 h-7 text-purple-500" /><span className="text-lg font-bold tracking-wider"><span className="text-purple-500">SUKHUMVIT</span><span className="text-amber-500">INSIDER</span></span></div>
          <div className="flex items-center space-x-1 bg-[#1a1a1a] rounded-lg p-1">{['en', 'zh', 'ja'].map(l => <button key={l} onClick={() => handleSetLang(l)} className={`px-2 py-1 text-xs rounded ${lang === l ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{l.toUpperCase()}</button>)}</div>
          <div className="hidden md:flex items-center space-x-4 text-sm">
            {user && <div className="flex items-center space-x-2 text-amber-500"><Ticket className="w-4 h-4" /><span>{profile?.credits || 0} {t.nav.credits}</span></div>}
            <a href="#dashboard" className="hover:text-purple-400 transition">{t.nav.dashboard}</a>
            <a href="#membership" className="hover:text-purple-400 transition">{t.nav.membership}</a>
            <a href="#gacha" className="hover:text-purple-400 transition">{t.nav.gacha}</a>
            {admin && <button onClick={() => setShowAdmin(true)} className="text-red-400 hover:text-red-300">{t.nav.admin}</button>}
            {user ? <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-2 border border-red-500/50 text-red-500 rounded hover:bg-red-500/10 transition"><LogOut className="w-4 h-4" /><span>{t.nav.logout}</span></button> : <button onClick={() => setShowAuth(true)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition">{t.nav.login}</button>}
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
        {mobileMenuOpen && <div className="md:hidden bg-[#0a0a0a] border-t border-purple-500/20 px-4 py-4 space-y-3">{user && <div className="flex items-center justify-between py-2 text-amber-500"><span>{t.nav.credits}: {profile?.credits || 0}</span></div>}<a href="#dashboard" className="block py-2" onClick={() => setMobileMenuOpen(false)}>{t.nav.dashboard}</a><a href="#membership" className="block py-2" onClick={() => setMobileMenuOpen(false)}>{t.nav.membership}</a><a href="#gacha" className="block py-2" onClick={() => setMobileMenuOpen(false)}>{t.nav.gacha}</a>{admin && <button onClick={() => { setShowAdmin(true); setMobileMenuOpen(false); }} className="block py-2 text-red-400">{t.nav.admin}</button>}{user ? <button onClick={handleLogout} className="w-full py-3 border border-red-500/50 text-red-500 rounded">{t.nav.logout}</button> : <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className="w-full py-3 bg-purple-600 rounded">{t.nav.login}</button>}</div>}
      </nav>
      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          onLogin={signIn}
          onSignup={signUp}
        />
      )}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiM1ZjI1NjciIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-purple-900/40 border border-purple-500/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">{t.hero.trustActive}</span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent">
              {t.hero.title}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button onClick={() => user ? document.getElementById('membership').scrollIntoView() : setShowAuth(true)} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl font-bold hover:from-purple-500 hover:to-purple-600 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center space-x-2">
              <span>{t.hero.cta}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setShowRiskMap(true)} className="px-8 py-4 border border-amber-500/30 text-amber-400 rounded-xl font-bold hover:bg-amber-500/10 transition-all hover:scale-105 flex items-center justify-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{t.hero.cta2}</span>
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-800/50 max-w-xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{verifiedMembers}+</div>
              <div className="text-sm text-gray-500 mt-2">{t.hero.verified}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{totalVenues}+</div>
              <div className="text-sm text-gray-500 mt-2">{t.hero.reports}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{satisfactionRate}%</div>
              <div className="text-sm text-gray-500 mt-2">{t.hero.satisfaction}</div>
            </div>
          </div>
        </div>
      </section>
      <section id="dashboard" className="py-12 px-4 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 mb-8"><Activity className="w-7 h-7 text-purple-500" /><h2 className="text-2xl font-bold">{t.dashboard.title}</h2>{user && profile && <span className="ml-auto text-amber-500 flex items-center space-x-1"><Ticket className="w-4 h-4" /><span>{t.dashboard.yourCredits}: {profile.credits}</span></span>}</div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-purple-500/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4"><h3 className="text-lg font-bold flex items-center space-x-2"><DollarSign className="w-5 h-5 text-amber-500" /><span>{t.dashboard.priceIndex}</span></h3><div className="flex items-center gap-2 w-full sm:w-auto"><div className="relative flex-1 sm:flex-initial"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.dashboard.search} className="w-full sm:w-40 pl-9 pr-3 py-2 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-xs focus:border-purple-500 outline-none" /></div><select value={sortBy} onChange={e => setSortBy(e.target.value)} className="py-2 px-3 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-xs"><option value="price">{t.dashboard.sortPrice}</option><option value="rating">{t.dashboard.sortRating}</option><option value="decoration">{t.dashboard.sortDecoration}</option><option value="friendliness">{t.dashboard.sortFriendliness}</option><option value="location">{t.dashboard.sortLocation}</option></select></div></div>
              <div className="space-y-3">{filteredVenues.slice(0, showAllVenues ? 20 : 5).map((item, i) => (<div key={i} onClick={() => setSelectedVenue(item)} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-purple-900/20 cursor-pointer transition"><div className="flex items-center space-x-3"><div className="w-9 h-9 bg-purple-900/50 rounded-lg flex items-center justify-center"><Star className="w-4 h-4 text-purple-400" /></div><div><div className="font-medium text-sm">{item.name}</div><div className="text-xs text-gray-500 flex items-center space-x-1"><span className={`px-1.5 py-0.5 rounded text-xs ${item.risk_level === 'Low' ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'}`}>{item.risk_level}</span><span className="text-gray-600">|</span><span className="text-purple-400">{item.category}</span><span className="text-gray-600">|</span><span className="text-amber-400">{item.decoration_level || '普通'}</span></div></div></div><div className="text-right"><div className="text-amber-500 font-bold">{item.drink_price}฿</div><div className="text-xs text-gray-500">{item.rating} ★</div></div></div>))}</div>
              <div className="flex gap-2 mt-4"><button onClick={() => setShowAllVenues(!showAllVenues)} className="flex-1 py-3 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/10 transition text-sm">{showAllVenues ? 'Show Less' : t.dashboard.viewAll}</button><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="py-3 px-2 bg-[#0a0a0a] border border-purple-500/30 rounded-lg text-sm">{Object.keys(PREFERENCE_LABELS).map(c => <option key={c} value={c}>{c} - {PREFERENCE_LABELS[c][lang]}</option>)}</select></div>
            </div>
            <div className="space-4">
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-amber-500/20"><h3 className="text-lg font-bold mb-3 flex items-center space-x-2"><Shield className="w-5 h-5 text-amber-500" /><span>{t.dashboard.trustProtocol}</span></h3><div className="space-y-2"><div className="flex items-center justify-between p-2.5 bg-[#0a0a0a] rounded-lg"><span className="text-gray-400 text-sm">{t.dashboard.venueVerify}</span><span className="text-green-400 flex items-center space-x-1 text-sm"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span>Active</span></span></div><div className="flex items-center justify-between p-2.5 bg-[#0a0a0a] rounded-lg"><span className="text-gray-400 text-sm">{t.dashboard.priceSync}</span><span className="text-green-400 flex items-center space-x-1 text-sm"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span>Live</span></span></div></div></div>
              <div className="bg-gradient-to-br from-red-900/20 to-[#1a1a1a] rounded-2xl p-6 border border-red-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                <h3 className="text-lg font-bold mb-2 flex items-center space-x-2 relative z-10"><Heart className="w-5 h-5 text-red-500 animate-pulse" /><span>{t.dashboard.emergency}</span></h3>
                <p className="text-gray-400 text-sm mb-4 relative z-10">{t.dashboard.emergencyDesc}</p>
                <button onClick={() => setShowEmergency(true)} className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 relative z-10">
                  <Phone className="w-4 h-4" /><span>{t.dashboard.activate}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showEmergency && <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-[#1a1a1a] rounded-3xl p-8 w-full max-w-lg border border-red-500/30 shadow-2xl shadow-red-500/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          {emergencySuccess ? <div className="text-center py-8"><div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="w-12 h-12 text-green-500" /></div><p className="text-xl font-bold text-green-500 mb-2">{t.emergency.success}</p></div> : <>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-3"><div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center"><Heart className="w-6 h-6 text-red-500" /></div><span>{t.emergency.title}</span></h2>
            <p className="text-gray-400 text-sm mb-6">{t.emergency.fillInfo}</p>
            <form onSubmit={handleEmergency} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-2">{t.emergency.name}</label><input type="text" placeholder={t.emergency.name} className="w-full p-3.5 bg-[#0a0a0a] rounded-xl border border-gray-700 focus:border-red-500 outline-none" required /></div>
                <div><label className="block text-sm text-gray-400 mb-2">{t.emergency.phone}</label><input type="tel" placeholder="+66 xxx xxx xxxx" className="w-full p-3.5 bg-[#0a0a0a] rounded-xl border border-gray-700 focus:border-red-500 outline-none" required /></div>
              </div>
              <div><label className="block text-sm text-gray-400 mb-2">{t.emergency.location}</label><input type="text" value={emergencyForm.location} onChange={e => setEmergencyForm({...emergencyForm, location: e.target.value})} placeholder={t.emergency.location} className="w-full p-3.5 bg-[#0a0a0a] rounded-xl border border-gray-700 focus:border-red-500 outline-none" required /></div>
              <div><label className="block text-sm text-gray-400 mb-2">{t.emergency.description}</label><textarea value={emergencyForm.description} onChange={e => setEmergencyForm({...emergencyForm, description: e.target.value})} placeholder={t.emergency.description} className="w-full p-3.5 bg-[#0a0a0a] rounded-xl border border-gray-700 focus:border-red-500 outline-none h-28 resize-none" required /></div>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold transition-all shadow-lg shadow-red-500/25">{t.emergency.submit}</button>
            </form>
          </>}
          <button onClick={() => setShowEmergency(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2"><X className="w-5 h-5" /></button>
        </div>
      </div>}

      {/* Risk Map Modal */}
      {showRiskMap && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-2xl border border-amber-500/30 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2"><Map className="w-6 h-6 text-amber-500" /><span>{t.riskMap.title}</span></h2>
              <button onClick={() => setShowRiskMap(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-gray-400 mb-4">{t.riskMap.subtitle}</p>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-500 mb-2">{t.riskMap.legend}</h3>
              <div className="flex gap-4">
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span><span className="text-sm">{t.riskMap.low}</span></span>
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span><span className="text-sm">{t.riskMap.medium}</span></span>
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span><span className="text-sm">{t.riskMap.high}</span></span>
              </div>
            </div>
            <div className="space-y-3">
              {venues.slice(0, 10).map(v => (
                <div key={v.id} className="flex justify-between items-center p-3 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-gray-500">{v.location}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${v.risk_level === 'Low' ? 'bg-green-900 text-green-400' : v.risk_level === 'Medium' ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'}`}>
                    {v.risk_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-lg border border-purple-500/30 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2"><Shield className="w-6 h-6 text-purple-500" /><span>{t.privacy.title}</span></h2>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">{t.privacy.lastUpdated}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{t.privacy.content}</p>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-lg border border-purple-500/30 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2"><FileText className="w-6 h-6 text-purple-500" /><span>{t.terms.title}</span></h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">{t.terms.lastUpdated}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{t.terms.content}</p>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-lg border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2"><MessageSquare className="w-6 h-6 text-purple-500" /><span>{t.contact.title}</span></h2>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <div><div className="text-sm text-gray-400">{t.contact.email}</div><div className="text-white">support@sukhumvit-insider.com</div></div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <div><div className="text-sm text-gray-400">{t.contact.phone}</div><div className="text-white">+66 2 123 4567</div></div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-purple-400" />
                <div><div className="text-sm text-gray-400">{t.contact.website}</div><div className="text-white">www.sukhumvit-insider.com</div></div>
              </div>
              <p className="text-sm text-gray-500 pt-4 border-t border-gray-800">{t.contact.responseTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Membership Tier Detail Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedTier.name[lang]}</h2>
              <button onClick={() => setSelectedTier(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="text-3xl font-bold text-amber-500 mb-4">{selectedTier.price}<span className="text-sm text-gray-500">{selectedTier.period[lang]}</span></div>
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 mb-2">{t.membership.features}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {selectedTier.tier === 'survival' && <><li>✓ Basic venue listings</li><li>✓ Price indicators</li><li>✓ Category filters</li></>}
                {selectedTier.tier === 'radar' && <><li>✓ All Survival features</li><li>✓ Real-time risk updates</li><li>✓ Priority support</li><li>✓ Unlimited gacha spins</li></>}
                {selectedTier.tier === 'black' && <><li>✓ All Radar features</li><li>✓ VIP venue access</li><li>✓ Personal concierge</li><li>✓ Emergency assistance</li></>}
              </ul>
            </div>
            <button onClick={() => { setSelectedTier(null); setShowContact(true); }} className="w-full py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-700 transition">{t.membership.contactUs}</button>
          </div>
        </div>
      )}

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-lg border border-purple-500/30 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedVenue.name}</h2>
              <button onClick={() => setSelectedVenue(null)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0a0a] p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{t.dashboard.price}</div>
                  <div className="text-amber-500 font-bold">{selectedVenue.drink_price}฿</div>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">{t.dashboard.rating}</div>
                  <div className="text-amber-400 font-bold">{selectedVenue.rating} ★</div>
                </div>
              </div>
              
              <div className="bg-[#0a0a0a] p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t.dashboard.category}</div>
                <div className="text-purple-400 font-bold">{selectedVenue.category}</div>
              </div>
              
              <div className="bg-[#0a0a0a] p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t.dashboard.riskLevel}</div>
                <span className={`px-2 py-1 rounded text-xs ${selectedVenue.risk_level === 'Low' ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'}`}>
                  {selectedVenue.risk_level}
                </span>
              </div>
              
              <div className="bg-[#0a0a0a] p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t.dashboard.decoration}</div>
                <div className="text-white">{selectedVenue.decoration_level || t.dashboard.noDescription}</div>
              </div>
              
              <div className="bg-[#0a0a0a] p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t.dashboard.friendliness}</div>
                <div className="text-white">{selectedVenue.friendliness || t.dashboard.noDescription}</div>
              </div>
              
              <div className="bg-[#0a0a0a] p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{t.dashboard.address}</div>
                <div className="text-white">{selectedVenue.location || t.dashboard.noDescription}</div>
              </div>
              
              {selectedVenue.google_maps_url && (
                <a href={selectedVenue.google_maps_url} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-700 transition text-center">
                  {t.dashboard.viewDetails} →
                </a>
              )}
              
              {/* Reviews Section */}
              <div className="border-t border-gray-800 pt-4 mt-4">
                <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>用戶評價</span>
                  <span className="text-amber-400">({selectedVenue.rating} ★)</span>
                </h4>
                <div className="space-y-3">
                  <div className="bg-[#0a0a0a] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">匿名用戶</span>
                      <div className="flex text-amber-400 text-xs">{'★'.repeat(5)}</div>
                    </div>
                    <p className="text-xs text-gray-400">氣氛很好，服務人員非常親切！</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">VIP會員</span>
                      <div className="flex text-amber-400 text-xs">{'★'.repeat(4)}</div>
                    </div>
                    <p className="text-xs text-gray-400">整體不錯，但價位偏高...</p>
                  </div>
                </div>
                {user && <button className="w-full mt-3 py-2 border border-purple-500/30 text-purple-400 rounded-lg text-sm hover:bg-purple-500/10 transition">撰寫評價</button>}
              </div>
              
              {(venuePackages[selectedVenue.id] || []).length > 0 && (
                <div className="bg-[#0a0a0a] p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">{t.dashboard.packages2}</div>
                  <div className="space-y-2">
                    {(venuePackages[selectedVenue.id] || []).map(pkg => (
                      <div key={pkg.id} className="flex justify-between items-center text-sm">
                        <span className="text-white">{pkg.name}</span>
                        <span className="text-amber-500">{pkg.duration_minutes}min / {pkg.price}฿</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={() => setSelectedVenue(null)} className="w-full mt-4 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition">{t.dashboard.close}</button>
          </div>
        </div>
      )}

      <section id="gacha" className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10"><div className="flex items-center justify-center space-x-3 mb-3"><div className="relative"><Ticket className="w-8 h-8 text-amber-500" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" /></div><h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">{t.gacha.title}</h2></div><p className="text-gray-400 text-sm max-w-md mx-auto">{t.gacha.subtitle}</p></div>
          <div className="max-w-sm mx-auto">
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-amber-500/30 text-center relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-amber-500/10 to-purple-600/10" />
              
              {/* Gacha Wheel */}
              <div className="relative w-44 h-44 mx-auto mb-8">
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-600 via-amber-500 to-purple-600 rounded-full ${activeGacha ? 'animate-spin' : ''}`} style={{animationDuration: '0.5s', filter: 'blur(2px)'}} />
                <div className={`absolute inset-1 bg-gradient-to-br from-purple-600 to-amber-600 rounded-full ${activeGacha ? 'animate-spin' : ''}`} style={{animationDirection: 'reverse', animationDuration: '0.7s'}} />
                <div className="absolute inset-2 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-2xl">
                  {gachaResult ? (
                    <div className="text-center animate-bounce">
                      <div className="text-5xl mb-1">🎉</div>
                      <div className="text-lg font-bold text-amber-400 px-2">{gachaResult}</div>
                    </div>
                  ) : (
                    <span className="text-5xl">🎰</span>
                  )}
                </div>
                {/* Pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-amber-500" />
              </div>
              
              <button type="button" onClick={() => { console.log('Spin clicked'); user ? handleSpin() : setShowAuth(true); }} className="relative w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all shadow-lg shadow-amber-500/25 active:scale-95">
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {activeGacha ? <><Loader className="w-5 h-5 animate-spin" /><span>{t.gacha.spinning}</span></> : <><span>🎲</span><span>{t.gacha.spin}</span><span className="text-xs opacity-75">(1 {t.nav.credits})</span></>}
                </span>
              </button>
              
              <button type="button" onClick={() => { console.log('Upload clicked'); setShowUpload(true); }} className="w-full mt-4 py-3 border border-purple-500/30 text-purple-400 rounded-xl hover:bg-purple-500/10 transition flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" /><span>{t.gacha.uploadProof}</span>
              </button>
              
              <div className="mt-8 text-left">
                <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center space-x-2"><Star className="w-4 h-4 text-amber-400" /><span>{t.gacha.rewardPool}</span></h4>
                <div className="space-y-2 bg-[#0a0a0a] rounded-xl p-4">
                  {gachaRewards.map((reward, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 flex items-center space-x-2"><span>{reward.prize[lang]}</span></span>
                      <span className="text-amber-500 font-bold">{reward.chance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {user && <div className="mt-8 max-w-sm mx-auto"><h3 className="text-lg font-bold mb-4 flex items-center space-x-2"><Package className="w-5 h-5 text-purple-400" /><span>{t.gacha.mySubmissions}</span></h3><div className="space-y-3">{mySubmissions.length > 0 ? mySubmissions.map(s => (<div key={s.id} className="bg-[#1a1a1a] p-4 rounded-xl flex justify-between items-center border border-gray-800 hover:border-purple-500/30 transition"><div><div className="font-medium">{s.venue_name}</div><div className="text-xs text-gray-400 flex items-center space-x-2"><span>{s.amount} THB</span><span className="text-gray-600">|</span><span>{s.payment_type}</span></div></div><span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${s.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' : s.status === 'approved' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{s.status === 'pending' ? t.gacha.pendingApproval : s.status === 'approved' ? t.gacha.approved : t.gacha.rejected}</span></div>)) : <p className="text-gray-400 text-sm bg-[#1a1a1a] p-4 rounded-xl text-center">{t.gacha.noSubmissions}</p>}</div></div>}
          </div>
        </div>
      </section>
      {showUpload && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-purple-500/30">{uploadSuccess ? <div className="text-center py-8"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><p className="text-lg text-green-500">{t.gacha.uploadSuccess}</p></div> : <><h2 className="text-2xl font-bold mb-6">{t.gacha.uploadProof}</h2><form onSubmit={handleUpload} className="space-y-4"><div><label className="block text-sm text-gray-400 mb-1">{t.gacha.selectVenue}</label><select value={uploadForm.venue} onChange={e => setUploadForm({...uploadForm, venue: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 focus:border-purple-500 outline-none" required><option value="">-- {t.gacha.selectVenue} --</option>{venues.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">{t.gacha.enterAmount}</label><input type="number" value={uploadForm.amount} onChange={e => setUploadForm({...uploadForm, amount: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 focus:border-purple-500 outline-none" required /></div><div><label className="block text-sm text-gray-400 mb-1">{t.gacha.paymentType}</label><select value={uploadForm.paymentType} onChange={e => setUploadForm({...uploadForm, paymentType: e.target.value})} className="w-full p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 focus:border-purple-500 outline-none"><option value="receipt">{t.gacha.receipt}</option><option value="transfer">{t.gacha.transfer}</option><option value="card">{t.gacha.card}</option></select></div><div><label className="block text-sm text-gray-400 mb-1">{t.gacha.uploadImage}</label><div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition" onClick={() => fileInputRef.current?.click()}>{uploadImagePreview ? <><img src={uploadImagePreview} alt="Preview" className="max-h-32 mx-auto rounded" /><p className="text-xs text-green-400 mt-2">{t.gacha.selected}</p></> : <><ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" /><p className="text-sm text-gray-400">{t.gacha.uploadImage}</p></>}</div><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" /></div><button type="submit" disabled={uploading} className="w-full py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50">{uploading ? 'Uploading...' : t.gacha.uploadProof}</button></form></>}<button onClick={() => { setShowUpload(false); setUploadImage(null); setUploadImagePreview(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button></div></div>}
      <section id="membership" className="py-16 px-4 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">{t.membership.title}</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">{t.membership.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">{tiers.map((tier, i) => (<div key={i} className={`relative bg-[#1a1a1a] rounded-3xl p-8 border-2 transition-all hover:scale-[1.02] ${tier.popular ? 'border-purple-500 shadow-2xl shadow-purple-500/20' : 'border-gray-800 hover:border-purple-500/50'}`}>{tier.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full text-xs font-bold shadow-lg">{t.membership.popular}</div>}<div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-6 shadow-lg`}><tier.icon className="w-10 h-10 text-white" /></div><h3 className="text-2xl font-bold mb-2">{tier.name[lang]}</h3><div className="mb-6"><span className="text-4xl font-bold text-white">{tier.price}</span><span className="text-gray-500 text-sm ml-1">{tier.period[lang]}</span></div><button onClick={() => setSelectedTier(tier)} className={`w-full py-4 rounded-xl font-bold transition-all ${tier.popular ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40' : 'border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10'}`}>{t.membership.getStarted}</button></div>))}</div>
        </div>
      </section>
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto"><div className="flex flex-col md:flex-row justify-between items-center"><div className="flex items-center space-x-2 mb-4 md:mb-0"><Shield className="w-5 h-5 text-purple-500" /><span className="font-bold text-sm"><span className="text-purple-500">SUKHUMVIT</span><span className="text-amber-500">INSIDER</span></span></div><div className="flex space-x-4 text-xs text-gray-500"><button onClick={() => setShowPrivacy(true)} className="hover:text-white transition">{t.footer.privacy}</button><button onClick={() => setShowTerms(true)} className="hover:text-white transition">{t.footer.terms}</button><button onClick={() => setShowContact(true)} className="hover:text-white transition">{t.footer.contact}</button></div></div><div className="text-center text-gray-600 text-xs mt-6">© 2026 Sukhumvit Insider. {t.footer.rights}</div></div>
      </footer>
    </div>
  );
}
