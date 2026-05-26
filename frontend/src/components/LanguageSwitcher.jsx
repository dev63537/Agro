import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी',    flag: '🟠' },
];

/**
 * LanguageSwitcher — dropdown to change app language.
 * #13 Multi-language Support
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('agro-lang', code);
  };

  return (
    <div className="relative group flex items-center">
      <button
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-secondary-600 hover:bg-surface-100 transition-colors"
        title="Change Language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.label}</span>
        <svg className="w-3 h-3 text-secondary-400" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.5 6l3.5 4 3.5-4H4.5z" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute bottom-full left-0 mb-1 bg-white border border-surface-200 rounded-xl shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLang(lang.code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 transition-colors ${
              i18n.language === lang.code ? 'text-primary-700 font-semibold bg-primary-50' : 'text-secondary-700'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {i18n.language === lang.code && <span className="ml-auto text-primary-600 text-xs">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
