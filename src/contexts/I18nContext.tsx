import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { zhCN } from '../locales/zh-CN';
import { enUS } from '../locales/en-US';
import { jaJP } from '../locales/ja-JP';
import { useAuth } from './AuthContext';

export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

export const languageNames: Record<Language, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
};

const translations = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  canChangeLanguage: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // 检查用户是否有 multilingual 计划
  const canChangeLanguage = user?.user_plan === 'multilingual';
  
  const [language, setLanguageState] = useState<Language>(() => {
    // 从 localStorage 获取保存的语言设置，默认为简体中文
    const saved = localStorage.getItem('storycraft-language') as Language;
    return saved && translations[saved] ? saved : 'zh-CN';
  });

  const setLanguage = (lang: Language) => {
    // 只有 multilingual 计划的用户才能切换语言
    if (canChangeLanguage) {
      setLanguageState(lang);
      localStorage.setItem('storycraft-language', lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回 key 本身
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, canChangeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
