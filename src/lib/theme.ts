export type ThemeName = 'canberra' | 'wisteria' | 'apricot' | 'blue-smoke' | 'green-smoke' | 
                'tradewind' | 'dark' | 'blue' | 'indigo' | 'pink' | 
                'amber' | 'emerald' | 'ocean-breeze' | 'sunset' | 'forest' | 'berry';

export interface ThemeColors {
  bgColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  inputBg: string;
  mutedText: string;
  highlightBg: string;
  selectedBg: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  // Optional dark mode properties
  darkBgColor?: string;
  darkTextColor?: string;
  darkCardBg?: string;
  darkBorderColor?: string;
  darkHighlightBg?: string;
  darkButtonBg?: string;
  darkButtonHover?: string;
}

// Color circle mapping for theme dropdown
export const themeColorCircles: Record<ThemeName, string> = {
  'canberra': '#ff5e62',
  'wisteria': '#8a2be2',
  'apricot': '#ff7f50',
  'blue-smoke': '#3b82f6',
  'green-smoke': '#22c55e',
  'tradewind': '#0d9488',
  'dark': '#374151',
  'blue': '#3b82f6',
  'indigo': '#6366f1',
  'pink': '#ec4899',
  'amber': '#f59e0b',
  'emerald': '#10b981',
  'ocean-breeze': '#0ea5e9',
  'sunset': '#fb923c',
  'forest': '#16a34a',
  'berry': '#c026d3'
};

export const themes: Record<ThemeName, ThemeColors> = {
  'canberra': {
    bgColor: 'bg-[#fff0f0]',
    textColor: 'text-[#1a1a2e]',
    cardBg: 'bg-white',
    borderColor: 'border-[#ffb3b3]',
    inputBg: 'bg-white',
    mutedText: 'text-[#6b7280]',
    highlightBg: 'bg-[#ffd6d6]',
    selectedBg: 'bg-[#ff9999]',
    buttonBg: 'bg-[#ff5e62]',
    buttonHover: 'hover:bg-[#ff3c41]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1a1a2e]',
    darkTextColor: 'text-[#e6f7ff]',
    darkCardBg: 'bg-[#16213e]',
    darkBorderColor: 'border-[#4cc9f0]',
    darkHighlightBg: 'bg-[#4cc9f0]',
  },

  'wisteria': {
    bgColor: 'bg-[#f8f0ff]',
    textColor: 'text-[#2a0a4a]',
    cardBg: 'bg-white',
    borderColor: 'border-[#e0b0ff]',
    inputBg: 'bg-white',
    mutedText: 'text-[#6b46c1]',
    highlightBg: 'bg-[#e9d5ff]',
    selectedBg: 'bg-[#d8b4fe]',
    buttonBg: 'bg-[#8a2be2]',
    buttonHover: 'hover:bg-[#7b1fa2]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#2a0a4a]',
    darkTextColor: 'text-[#ffd700]',
    darkCardBg: 'bg-[#3a0a5f]',
    darkBorderColor: 'border-[#ffd700]',
    darkHighlightBg: 'bg-[#ffd700]',
  },

  'apricot': {
    bgColor: 'bg-[#fff4e6]',
    textColor: 'text-[#333333]',
    cardBg: 'bg-white',
    borderColor: 'border-[#ffcc99]',
    inputBg: 'bg-white',
    mutedText: 'text-[#e67e22]',
    highlightBg: 'bg-[#ffe0b3]',
    selectedBg: 'bg-[#ffb366]',
    buttonBg: 'bg-[#ff7f50]',
    buttonHover: 'hover:bg-[#e67347]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1e3a8a]',
    darkTextColor: 'text-[#ffa500]',
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ffa500]',
    darkHighlightBg: 'bg-[#ffa500]',
  },

  'blue-smoke': {
    bgColor: 'bg-[#F5FAFD]',
    textColor: 'text-[#0d3b66]',
    cardBg: 'bg-white',
    borderColor: 'border-[#b3e0ff]',
    inputBg: 'bg-white',
    mutedText: 'text-[#3b82f6]',
    highlightBg: 'bg-[#cce6ff]',
    selectedBg: 'bg-[#99ccff]',
    buttonBg: 'bg-[#3b82f6]',
    buttonHover: 'hover:bg-[#2563eb]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#0d3b66]',
    darkTextColor: 'text-[#ff6b6b]',
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ff6b6b]',
    darkHighlightBg: 'bg-[#ff6b6b]',
  },

  'green-smoke': {
    bgColor: 'bg-[#D3EFC1]',
    textColor: 'text-[#14532d]',
    cardBg: 'bg-white',
    borderColor: 'border-[#b3ffc2]',
    inputBg: 'bg-white',
    mutedText: 'text-[#22c55e]',
    highlightBg: 'bg-[#ccffdd]',
    selectedBg: 'bg-[#99ffbb]',
    buttonBg: 'bg-[#22c55e]',
    buttonHover: 'hover:bg-[#16a34a]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#14532d]',
    darkTextColor: 'text-[#d8b4fe]',
    darkCardBg: 'bg-[#166534]',
    darkBorderColor: 'border-[#d8b4fe]',
    darkHighlightBg: 'bg-[#d8b4fe]',
  },

  'tradewind': {
    bgColor: 'bg-[#e6fffa]',
    textColor: 'text-[#134e4a]',
    cardBg: 'bg-white',
    borderColor: 'border-[#b8fff0]',
    inputBg: 'bg-white',
    mutedText: 'text-[#0d9488]',
    highlightBg: 'bg-[#ccfff5]',
    selectedBg: 'bg-[#99ffeb]',
    buttonBg: 'bg-[#0d9488]',
    buttonHover: 'hover:bg-[#0f766e]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#134e4a]',
    darkTextColor: 'text-[#ffa500]',
    darkCardBg: 'bg-[#115e59]',
    darkBorderColor: 'border-[#ffa500]',
    darkHighlightBg: 'bg-[#ffa500]',
  },

  // Solid color themes
  'blue': {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    cardBg: 'bg-white',
    borderColor: 'border-blue-200',
    inputBg: 'bg-white',
    mutedText: 'text-blue-500',
    highlightBg: 'bg-blue-100',
    selectedBg: 'bg-blue-200',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    buttonText: 'text-white',
    darkBgColor: 'bg-blue-900',
    darkTextColor: 'text-blue-100',
    darkCardBg: 'bg-blue-800',
    darkBorderColor: 'border-blue-700',
    darkHighlightBg: 'bg-blue-700',
  },

  'indigo': {
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-900',
    cardBg: 'bg-white',
    borderColor: 'border-indigo-200',
    inputBg: 'bg-white',
    mutedText: 'text-indigo-500',
    highlightBg: 'bg-indigo-100',
    selectedBg: 'bg-indigo-200',
    buttonBg: 'bg-indigo-600',
    buttonHover: 'hover:bg-indigo-700',
    buttonText: 'text-white',
    darkBgColor: 'bg-indigo-900',
    darkTextColor: 'text-indigo-100',
    darkCardBg: 'bg-indigo-800',
    darkBorderColor: 'border-indigo-700',
    darkHighlightBg: 'bg-indigo-700',
  },

  'pink': {
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-900',
    cardBg: 'bg-white',
    borderColor: 'border-pink-200',
    inputBg: 'bg-white',
    mutedText: 'text-pink-500',
    highlightBg: 'bg-pink-100',
    selectedBg: 'bg-pink-200',
    buttonBg: 'bg-pink-600',
    buttonHover: 'hover:bg-pink-700',
    buttonText: 'text-white',
    darkBgColor: 'bg-pink-900',
    darkTextColor: 'text-pink-100',
    darkCardBg: 'bg-pink-800',
    darkBorderColor: 'border-pink-700',
    darkHighlightBg: 'bg-pink-700',
  },

  'amber': {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    cardBg: 'bg-white',
    borderColor: 'border-amber-200',
    inputBg: 'bg-white',
    mutedText: 'text-amber-600',
    highlightBg: 'bg-amber-100',
    selectedBg: 'bg-amber-200',
    buttonBg: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
    buttonText: 'text-white',
    darkBgColor: 'bg-amber-900',
    darkTextColor: 'text-amber-100',
    darkCardBg: 'bg-amber-800',
    darkBorderColor: 'border-amber-700',
    darkHighlightBg: 'bg-amber-700',
  },

  'emerald': {
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    cardBg: 'bg-white',
    borderColor: 'border-emerald-200',
    inputBg: 'bg-white',
    mutedText: 'text-emerald-500',
    highlightBg: 'bg-emerald-100',
    selectedBg: 'bg-emerald-200',
    buttonBg: 'bg-emerald-600',
    buttonHover: 'hover:bg-emerald-700',
    buttonText: 'text-white',
    darkBgColor: 'bg-emerald-900',
    darkTextColor: 'text-emerald-100',
    darkCardBg: 'bg-emerald-800',
    darkBorderColor: 'border-emerald-700',
    darkHighlightBg: 'bg-emerald-700',
  },

  'dark': {
    bgColor: 'bg-gray-900',
    textColor: 'text-gray-100',
    cardBg: 'bg-gray-800',
    borderColor: 'border-gray-700',
    inputBg: 'bg-gray-700',
    mutedText: 'text-gray-400',
    highlightBg: 'bg-gray-700',
    selectedBg: 'bg-gray-600',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    buttonText: 'text-white'
  },

  // Dual-tone themes
  'ocean-breeze': {
    bgColor: 'bg-gradient-to-br from-sky-50 to-cyan-50',
    textColor: 'text-sky-900',
    cardBg: 'bg-white',
    borderColor: 'border-sky-200',
    inputBg: 'bg-white',
    mutedText: 'text-sky-500',
    highlightBg: 'bg-sky-100',
    selectedBg: 'bg-sky-200',
    buttonBg: 'bg-gradient-to-r from-sky-500 to-cyan-500',
    buttonHover: 'hover:from-sky-600 hover:to-cyan-600',
    buttonText: 'text-white',
    darkBgColor: 'bg-gradient-to-br from-sky-900 to-cyan-900',
    darkTextColor: 'text-sky-100',
    darkCardBg: 'bg-sky-800',
    darkBorderColor: 'border-sky-700',
    darkHighlightBg: 'bg-sky-700',
    darkButtonBg: 'bg-gradient-to-r from-sky-600 to-cyan-600',
    darkButtonHover: 'hover:from-sky-700 hover:to-cyan-700'
  },

  'sunset': {
    bgColor: 'bg-gradient-to-br from-orange-50 to-rose-50',
    textColor: 'text-orange-900',
    cardBg: 'bg-white',
    borderColor: 'border-orange-200',
    inputBg: 'bg-white',
    mutedText: 'text-orange-600',
    highlightBg: 'bg-orange-100',
    selectedBg: 'bg-orange-200',
    buttonBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
    buttonHover: 'hover:from-orange-600 hover:to-rose-600',
    buttonText: 'text-white',
    darkBgColor: 'bg-gradient-to-br from-orange-900 to-rose-900',
    darkTextColor: 'text-orange-100',
    darkCardBg: 'bg-orange-800',
    darkBorderColor: 'border-orange-700',
    darkHighlightBg: 'bg-orange-700',
    darkButtonBg: 'bg-gradient-to-r from-orange-600 to-rose-600',
    darkButtonHover: 'hover:from-orange-700 hover:to-rose-700'
  },

  'forest': {
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    textColor: 'text-green-900',
    cardBg: 'bg-white',
    borderColor: 'border-green-200',
    inputBg: 'bg-white',
    mutedText: 'text-green-600',
    highlightBg: 'bg-green-100',
    selectedBg: 'bg-green-200',
    buttonBg: 'bg-gradient-to-r from-green-600 to-emerald-600',
    buttonHover: 'hover:from-green-700 hover:to-emerald-700',
    buttonText: 'text-white',
    darkBgColor: 'bg-gradient-to-br from-green-900 to-emerald-900',
    darkTextColor: 'text-green-100',
    darkCardBg: 'bg-green-800',
    darkBorderColor: 'border-green-700',
    darkHighlightBg: 'bg-green-700',
    darkButtonBg: 'bg-gradient-to-r from-green-700 to-emerald-700',
    darkButtonHover: 'hover:from-green-800 hover:to-emerald-800'
  },

  'berry': {
    bgColor: 'bg-gradient-to-br from-pink-50 to-fuchsia-50',
    textColor: 'text-pink-900',
    cardBg: 'bg-white',
    borderColor: 'border-pink-200',
    inputBg: 'bg-white',
    mutedText: 'text-pink-500',
    highlightBg: 'bg-pink-100',
    selectedBg: 'bg-pink-200',
    buttonBg: 'bg-gradient-to-r from-pink-500 to-fuchsia-500',
    buttonHover: 'hover:from-pink-600 hover:to-fuchsia-600',
    buttonText: 'text-white',
    darkBgColor: 'bg-gradient-to-br from-pink-900 to-fuchsia-900',
    darkTextColor: 'text-pink-100',
    darkCardBg: 'bg-pink-800',
    darkBorderColor: 'border-pink-700',
    darkHighlightBg: 'bg-pink-700',
    darkButtonBg: 'bg-gradient-to-r from-pink-600 to-fuchsia-600',
    darkButtonHover: 'hover:from-pink-700 hover:to-fuchsia-700'
  }
};

export const getButtonClasses = (theme: ThemeName, variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link' = 'primary') => {
  const themeObj = themes[theme];
  
  switch (variant) {
    case 'danger':
      return `${theme === 'dark' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white`;
    case 'success':
      return `${theme === 'dark' ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white`;
    case 'secondary':
      return `${themeObj.buttonBg} hover:${themeObj.buttonHover} ${themeObj.buttonText}`;
    case 'outline':
      return `border ${themeObj.borderColor} hover:${themeObj.highlightBg} ${themeObj.textColor}`;
    case 'ghost':
      return `hover:${themeObj.highlightBg} ${themeObj.textColor}`;
    case 'link':
      return `hover:underline ${themeObj.textColor}`;
    default: // primary
      return `${themeObj.buttonBg} hover:${themeObj.buttonHover} ${themeObj.buttonText}`;
  }
};