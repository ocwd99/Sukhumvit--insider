// src/components/common/AuthModal.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { PREFERENCE_LABELS } from '../../constants/preferences';

export function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onSignup, 
  initialMode = 'login' 
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    preferences: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const t = {
    login: { 
      en: 'Login', 
      zh: '登入', 
      ja: 'ログイン' 
    },
    signup: { 
      en: 'Sign Up', 
      zh: '註冊', 
      ja: '新規登録' 
    },
    email: { 
      en: 'Email', 
      zh: '電子郵件', 
      ja: 'メール' 
    },
    password: { 
      en: 'Password', 
      zh: '密碼', 
      ja: 'パスワード' 
    },
    confirmPassword: { 
      en: 'Confirm Password', 
      zh: '確認密碼', 
      ja: 'パスワード確認' 
    },
    selectPreferences: { 
      en: 'Select your preferences (multiple)', 
      zh: '選擇你的喜好（可複選）', 
      ja: '好みを選択（複数選択可）' 
    },
    noAccount: { 
      en: "Don't have an account?", 
      zh: '還沒有帳號？', 
      ja: 'アカウントをお持ちでない？' 
    },
    hasAccount: { 
      en: 'Already have an account?', 
      zh: '已經有帳號？', 
      ja: '既にアカウントをお持ち？' 
    }
  };

  // Get current language from localStorage or default to 'en'
  const lang = localStorage.getItem('sukhumvit_lang') || 'en';
  const translations = t[lang] || t.en;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Validation
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (mode === 'signup' && form.preferences.length === 0) {
      setError('Please select at least one preference');
      return;
    }

    setLoading(true);
    
    try {
      if (mode === 'signup') {
        await onSignup(form.email, form.password, form.preferences);
        alert('Check your email for confirmation!');
      } else {
        await onLogin(form.email, form.password);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-purple-500/30 relative">
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'login' ? translations.login : translations.signup}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {translations.email}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {translations.password}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              required
            />
          </div>
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {translations.confirmPassword}
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full p-3 bg-[#0a0a0a] rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {translations.selectPreferences}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PREFERENCE_LABELS).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        preferences: form.preferences.includes(p)
                          ? form.preferences.filter(x => x !== p)
                          : [...form.preferences, p]
                      })}
                      className={`px-3 py-1 rounded border ${
                        form.preferences.includes(p)
                          ? 'bg-purple-600 border-purple-500'
                          : 'border-gray-700'
                      }`}
                    >
                      {p} - {PREFERENCE_LABELS[p][lang]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading 
              ? (lang === 'zh' ? '載入中...' : lang === 'ja' ? '読み込み中...' : 'Loading...')
              : (mode === 'login' ? translations.login : translations.signup)
            }
          </button>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          {mode === 'login' ? translations.noAccount : translations.hasAccount}
          <button 
            onClick={toggleMode}
            className="text-purple-400 ml-1"
          >
            {mode === 'login' ? translations.signup : translations.login}
          </button>
        </p>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}