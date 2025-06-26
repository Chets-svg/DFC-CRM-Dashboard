export type ThemeName = 'canberra' | 'wisteria' | 'apricot' | 'blue-smoke' | 'green-smoke' | 
                'tradewind' | 'dark' | 'sunrise' | 'ocean' | 'lava' | 
                'coral-teal' | 'orange-blue' | 'blue-pink' | 
                'green-purple' | 'teal-orange' | 'dark-neon' | 'blue' | 'green' | 'purple';

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

export const themes: Record<ThemeName, ThemeColors> = {
 'canberra': {
    bgColor: 'bg-[#fff0f0]',          // Light coral background
    textColor: 'text-[#1a1a2e]',      // Dark navy text
    cardBg: 'bg-white',               // Pure white cards
    borderColor: 'border-[#ffb3b3]',  // Light coral border
    inputBg: 'bg-white',
    mutedText: 'text-[#6b7280]',
    highlightBg: 'bg-[#ffd6d6]',      // Light coral highlight
    selectedBg: 'bg-[#ff9999]',       // Medium coral selection
    buttonBg: 'bg-[#ff5e62]',         // VIBRANT CORAL (primary)
    buttonHover: 'hover:bg-[#ff3c41]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1a1a2e]',      // Dark navy background
    darkTextColor: 'text-[#e6f7ff]',  // Light teal text
    darkCardBg: 'bg-[#16213e]',       // Darker navy cards
    darkBorderColor: 'border-[#4cc9f0]', // Teal border
    darkHighlightBg: 'bg-[#4cc9f0]',  // Teal highlight
  },

  // Vibrant Purple + Gold
  'wisteria': {
    bgColor: 'bg-[#f8f0ff]',          // Light purple background
    textColor: 'text-[#2a0a4a]',      // Deep purple text
    cardBg: 'bg-white',
    borderColor: 'border-[#e0b0ff]',  // Light purple border
    inputBg: 'bg-white',
    mutedText: 'text-[#6b46c1]',
    highlightBg: 'bg-[#e9d5ff]',
    selectedBg: 'bg-[#d8b4fe]',
    buttonBg: 'bg-[#8a2be2]',         // VIBRANT PURPLE (primary)
    buttonHover: 'hover:bg-[#7b1fa2]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#2a0a4a]',      // Deep purple background
    darkTextColor: 'text-[#ffd700]',  // Gold text
    darkCardBg: 'bg-[#3a0a5f]',
    darkBorderColor: 'border-[#ffd700]', // Gold border
    darkHighlightBg: 'bg-[#ffd700]',  // Gold highlight
  },

  // Vibrant Orange + Blue
  'apricot': {
    bgColor: 'bg-[#fff4e6]',          // Light orange background
    textColor: 'text-[#333333]',      // Dark gray text
    cardBg: 'bg-white',
    borderColor: 'border-[#ffcc99]',  // Light orange border
    inputBg: 'bg-white',
    mutedText: 'text-[#e67e22]',
    highlightBg: 'bg-[#ffe0b3]',
    selectedBg: 'bg-[#ffb366]',
    buttonBg: 'bg-[#ff7f50]',         // VIBRANT CORAL (primary)
    buttonHover: 'hover:bg-[#e67347]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1e3a8a]',      // Navy blue background
    darkTextColor: 'text-[#ffa500]',  // Orange text
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ffa500]', // Orange border
    darkHighlightBg: 'bg-[#ffa500]',  // Orange highlight
  },

  // Vibrant Blue + Pink
  'blue-smoke': {
    bgColor: 'bg-[#7DA0C4]',          // Light blue background
    textColor: 'text-[#0d3b66]',      // Dark blue text
    cardBg: 'bg-white',
    borderColor: 'border-[#b3e0ff]',  // Light blue border
    inputBg: 'bg-white',
    mutedText: 'text-[#3b82f6]',
    highlightBg: 'bg-[#cce6ff]',
    selectedBg: 'bg-[#99ccff]',
    buttonBg: 'bg-[#3b82f6]',         // VIBRANT BLUE (primary)
    buttonHover: 'hover:bg-[#2563eb]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#0d3b66]',      // Dark blue background
    darkTextColor: 'text-[#ff6b6b]',  // Pink text
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ff6b6b]', // Pink border
    darkHighlightBg: 'bg-[#ff6b6b]',  // Pink highlight
  },

  // Vibrant Green + Purple
  'green-smoke': {
    bgColor: 'bg-[#7bae37]',          // Light green background
    textColor: 'text-[#14532d]',      // Dark green text
    cardBg: 'bg-white',
    borderColor: 'border-[#b3ffc2]',  // Light green border
    inputBg: 'bg-white',
    mutedText: 'text-[#22c55e]',
    highlightBg: 'bg-[#ccffdd]',
    selectedBg: 'bg-[#99ffbb]',
    buttonBg: 'bg-[#22c55e]',         // VIBRANT GREEN (primary)
    buttonHover: 'hover:bg-[#16a34a]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#14532d]',      // Dark green background
    darkTextColor: 'text-[#d8b4fe]',  // Light purple text
    darkCardBg: 'bg-[#166534]',
    darkBorderColor: 'border-[#d8b4fe]', // Purple border
    darkHighlightBg: 'bg-[#d8b4fe]',  // Purple highlight
  },

  // Vibrant Teal + Orange
  'tradewind': {
    bgColor: 'bg-[#e6fffa]',          // Light teal background
    textColor: 'text-[#134e4a]',      // Dark teal text
    cardBg: 'bg-white',
    borderColor: 'border-[#b8fff0]',  // Light teal border
    inputBg: 'bg-white',
    mutedText: 'text-[#0d9488]',
    highlightBg: 'bg-[#ccfff5]',
    selectedBg: 'bg-[#99ffeb]',
    buttonBg: 'bg-[#0d9488]',         // VIBRANT TEAL (primary)
    buttonHover: 'hover:bg-[#0f766e]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#134e4a]',      // Dark teal background
    darkTextColor: 'text-[#ffa500]',  // Orange text
    darkCardBg: 'bg-[#115e59]',
    darkBorderColor: 'border-[#ffa500]', // Orange border
    darkHighlightBg: 'bg-[#ffa500]',  // Orange highlight
  },

  // High Contrast Dark + Neon Green
  'dark Green Neon': {
    bgColor: 'bg-[#0a0a0a]',          // Near-black background
    textColor: 'text-[#f0f0f0]',      // Light gray text
    cardBg: 'bg-[#1a1a1a]',           // Dark gray cards
    borderColor: 'border-[#333333]',   // Medium gray border
    inputBg: 'bg-[#1a1a1a]',
    mutedText: 'text-[#a0a0a0]',
    highlightBg: 'bg-[#333333]',
    selectedBg: 'bg-[#00ff00]',       // NEON GREEN selection
    buttonBg: 'bg-[#00ff00]',         // NEON GREEN (primary)
    buttonHover: 'hover:bg-[#00cc00]',
    buttonText: 'text-black',
    darkBgColor: 'bg-[#0a0a0a]',
    darkTextColor: 'text-[#f0f0f0]',
    darkCardBg: 'bg-[#1a1a1a]',
    darkBorderColor: 'border-[#333333]',
    darkHighlightBg: 'bg-[#333333]'
  },

  // Additional vibrant themes
  'sunrise': {
    bgColor: 'bg-[#fff5f5]',          // Soft pink background
    textColor: 'text-[#2a2a2a]',      // Dark gray text
    cardBg: 'bg-white',               // Pure white cards
    borderColor: 'border-[#ffcdb2]',  // Peach border
    inputBg: 'bg-white',
    mutedText: 'text-[#6b7280]',
    highlightBg: 'bg-[#ffcdb2]',      // Peach highlight
    selectedBg: 'bg-[#ffb4a2]',       // Coral selection
    buttonBg: 'bg-[#ff6b6b]',         // VIBRANT CORAL (primary)
    buttonHover: 'hover:bg-[#ff5252]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#2a2a2a]',
    darkTextColor: 'text-[#ffcdb2]',
    darkCardBg: 'bg-[#333333]',
    darkBorderColor: 'border-[#ff6b6b]',
    darkHighlightBg: 'bg-[#ff6b6b]'
  },

  'ocean': {
    bgColor: 'bg-[#04BADE]',          // Light sky blue
    textColor: 'text-[#1e3a8a]',      // Navy text
    cardBg: 'bg-white',
    borderColor: 'border-[#bfdbfe]',  // Light blue border
    inputBg: 'bg-white',
    mutedText: 'text-[#4b5563]',
    highlightBg: 'bg-[#bfdbfe]',
    selectedBg: 'bg-[#93c5fd]',
    buttonBg: 'bg-[#3b82f6]',         // VIBRANT BLUE (primary)
    buttonHover: 'hover:bg-[#2563eb]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1e3a8a]',
    darkTextColor: 'text-[#bfdbfe]',
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#3b82f6]',
    darkHighlightBg: 'bg-[#3b82f6]'
  },

    'lava': {
    bgColor: 'bg-[#fef2f2]',          // Light red
    textColor: 'text-[#5c1a1a]',      // Dark red text
    cardBg: 'bg-white',
    borderColor: 'border-[#fecaca]',  // Light red border
    inputBg: 'bg-white',
    mutedText: 'text-[#b91c1c]',
    highlightBg: 'bg-[#fecaca]',
    selectedBg: 'bg-[#fca5a5]',
    buttonBg: 'bg-[#ef4444]',         // VIBRANT RED (primary)
    buttonHover: 'hover:bg-[#dc2626]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#5c1a1a]',
    darkTextColor: 'text-[#fecaca]',
    darkCardBg: 'bg-[#7f1d1d]',
    darkBorderColor: 'border-[#ef4444]',
    darkHighlightBg: 'bg-[#ef4444]'
  },
'coral-teal': {
    name: 'Coral Teal',
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
    darkButtonBg: 'bg-[#4cc9f0]',
    darkButtonHover: 'hover:bg-[#3aa8d8]'
  },
  
  'orange-blue': {
    name: 'Orange Blue',
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
    darkButtonBg: 'bg-[#ffa500]',
    darkButtonHover: 'hover:bg-[#e69500]'
  },
  'blue-pink': {
    name: 'Blue Pink',
    bgColor: 'bg-[#1da2d8]',
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
    darkButtonBg: 'bg-[#ff6b6b]',
    darkButtonHover: 'hover:bg-[#e65050]'
  },
  'green-purple': {
    name: 'Green Purple',
    bgColor: 'bg-[#e6ffec]',
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
    darkButtonBg: 'bg-[#d8b4fe]',
    darkButtonHover: 'hover:bg-[#c49af7]'
  },
  'teal-orange': {
    name: 'Teal Orange',
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
    darkButtonBg: 'bg-[#ffa500]',
    darkButtonHover: 'hover:bg-[#e69500]'
  },
  dark: {
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