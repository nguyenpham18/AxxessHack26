// ─── COLORS ───────────────────────────────────────────────
export const Colors = {
  // Primary
  red:      '#c61e3a',
  redDark:  '#C0102C',
  redSoft:  '#FF6B84',
  redPale:  '#FFF0F2',
  redMid:   '#FFBDC7',

  // Accent
  yellow:      '#FFD166',
  yellowPale:  '#FFF8E1',
  green:       '#06D6A0',
  greenPale:   '#E0FBF4',

  // Neutrals
  cream:    '#FFFBF4',
  cream2:   '#FFF5E6',
  gray100:  '#F9F3F4',
  gray200:  '#F0E8EA',
  gray300:  '#DDD0D3',
  gray500:  '#B09098',
  gray700:  '#7A5560',
  gray900:  '#3D1F27',

  // Base
  white:   '#FFFFFF',
  outline: '#3D1F27',
};

// ─── FONTS ────────────────────────────────────────────────
// All Nunito — sans-serif, warm, rounded
export const FontFamily = {
  display:    'Nunito_900Black',      // big headings
  displayBold:'Nunito_800ExtraBold',  // sub-headings
  body:       'Nunito_700Bold',       // body text
  bodyBold:   'Nunito_800ExtraBold',  // emphasis
  bodyBlack:  'Nunito_900Black',      // labels / caps
};

// ─── SHADOWS (cartoon style: hard offset, no blur) ────────
export const Shadow = {
  sm: {
    shadowColor: '#3D1F27',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  md: {
    shadowColor: '#3D1F27',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  lg: {
    shadowColor: '#3D1F27',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
};

// ─── BORDER RADIUS ────────────────────────────────────────
export const Radius = {
  pill: 999,
  xl:   28,
  lg:   22,
  md:   16,
  sm:   12,
};