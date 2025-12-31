// Design tokens matching the Deep Nebula theme from design.html
export const colors = {
  // Primary (Violet)
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',

  // Secondary (Pink)
  secondary: '#EC4899',
  secondaryDark: '#DB2777',

  // Accent (Amber)
  accent: '#F59E0B',

  // Background (Deep Nebula Purple)
  background: '#0F0720',

  // Glassmorphism
  cardBg: 'rgba(30, 20, 50, 0.4)',
  cardBgHover: 'rgba(255, 255, 255, 0.1)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  navBg: 'rgba(15, 7, 32, 0.85)',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',  // gray-300
  textMuted: '#9CA3AF',      // gray-400
  textTertiary: 'rgba(255, 255, 255, 0.5)',

  // Danger
  danger: '#EF4444',         // red-500

  // Category colors (matched to design gradients where possible)
  categoryFear: '#EF4444',
  categoryRelationship: '#EC4899',
  categoryWork: '#8B5CF6', // Changed to violet
  categoryFamily: '#F59E0B',
  categoryPast: '#06B6D4', // Cyan
  categoryFuture: '#10B981',
  categoryOther: '#6366F1',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32, // Added for larger rounded corners
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  }
};
