/**
 * Google Material Design 3 (Material You) Dynamic Color Generator
 * Converts any seed color into an accessible, luminous tonal palette.
 */

interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): HSL {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface MaterialDynamicPalette {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  outline: string;
  outlineVariant: string;
}

/**
 * Generate full Material 3 tonal palette from primary hex
 */
export function generateMaterialDynamicPalette(primaryHex: string, isDark: boolean = false): MaterialDynamicPalette {
  const { h, s } = hexToHsl(primaryHex);

  // Normalize saturation for harmonious palette
  const sat = Math.max(40, Math.min(s, 85));
  const secHue = (h + 25) % 360;

  if (isDark) {
    // Material 3 Dark Mode (Deep Midnight Court atmosphere, never dull pitch-black)
    return {
      primary: hslToHex(h, sat, 70),
      onPrimary: hslToHex(h, sat, 10),
      primaryContainer: hslToHex(h, sat, 26),
      onPrimaryContainer: hslToHex(h, sat, 88),
      secondary: hslToHex(secHue, sat - 15, 65),
      onSecondary: hslToHex(secHue, sat - 15, 12),
      secondaryContainer: hslToHex(secHue, sat - 20, 24),
      onSecondaryContainer: hslToHex(secHue, sat - 20, 85),
      background: hslToHex(h, 25, 9),         // Rich deep atmospheric background
      onBackground: hslToHex(h, 10, 93),
      surface: hslToHex(h, 20, 13),            // Elegant elevated surface
      onSurface: hslToHex(h, 10, 93),
      surfaceVariant: hslToHex(h, 18, 18),
      onSurfaceVariant: hslToHex(h, 12, 75),
      surfaceContainerLow: hslToHex(h, 22, 11),
      surfaceContainer: hslToHex(h, 20, 15),
      surfaceContainerHigh: hslToHex(h, 18, 19),
      outline: hslToHex(h, 15, 32),
      outlineVariant: hslToHex(h, 15, 22),
    };
  }

  // Material 3 Light Mode (Luminous, friendly, clean tennis atmosphere)
  return {
    primary: hslToHex(h, sat, 42),
    onPrimary: '#FFFFFF',
    primaryContainer: hslToHex(h, sat, 92),
    onPrimaryContainer: hslToHex(h, sat, 14),
    secondary: hslToHex(secHue, Math.max(35, sat - 20), 40),
    onSecondary: '#FFFFFF',
    secondaryContainer: hslToHex(secHue, 45, 93),
    onSecondaryContainer: hslToHex(secHue, 50, 16),
    background: hslToHex(h, 30, 97),          // Friendly warm tinted canvas
    onBackground: '#1A1C1E',
    surface: '#FFFFFF',                       // Pure clean white card surface
    onSurface: '#191C1E',
    surfaceVariant: hslToHex(h, 25, 95),       // Soft primary tint
    onSurfaceVariant: '#44474E',
    surfaceContainerLow: hslToHex(h, 30, 97),
    surfaceContainer: hslToHex(h, 25, 94),
    surfaceContainerHigh: hslToHex(h, 25, 92),
    outline: hslToHex(h, 20, 84),
    outlineVariant: hslToHex(h, 25, 90),
  };
}
