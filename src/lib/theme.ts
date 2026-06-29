export type ThemeName = 'canberra' | 'wisteria' | 'apricot' | 'blue-smoke' | 
                'dark' | 'blue' | 'indigo'|'neon';

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
  'dark': '#374151',
  'blue': '#3b82f6',
  'indigo': '#6366f1',
  'neon': '#22d3ee'
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

'neon': {
    bgColor: 'bg-slate-950',
    textColor: 'text-cyan-100',
    cardBg: 'bg-slate-900',
    borderColor: 'border-cyan-500/20',
    inputBg: 'bg-slate-800',
    mutedText: 'text-slate-400',
    highlightBg: 'bg-cyan-500/10',
    selectedBg: 'bg-cyan-500/20',
    buttonBg: 'bg-cyan-500',
    buttonHover: 'hover:bg-cyan-400',
    buttonText: 'text-slate-950',
  }
};

export const getButtonClasses = (theme: ThemeName, variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link' = 'primary') => {
  const themeObj = themes[theme];

  

   // Handle neon theme separately for glow effects
  if (theme === 'neon') {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(248,113,113,0.3)] hover:shadow-[0_0_25px_rgba(248,113,113,0.5)]';
      case 'success':
        return 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.5)]';
      case 'secondary':
        return 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(232,121,249,0.3)] hover:shadow-[0_0_25px_rgba(232,121,249,0.5)]';
      case 'outline':
        return 'border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]';
      case 'ghost':
        return 'text-cyan-300 hover:bg-cyan-500/10 hover:shadow-[0_0_10px_rgba(0,255,255,0.15)]';
      case 'link':
        return 'text-cyan-400 hover:text-cyan-300 hover:underline drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]';
      default: // primary
        return 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]';
    }
  }
  
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
export const isNeon = (theme: ThemeName): boolean => {
  return theme === 'neon';
};

