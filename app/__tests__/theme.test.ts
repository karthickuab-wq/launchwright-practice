import { colors, radius, space, tapTarget, type } from '../src/theme';

const channel = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('the theme', () => {
  it('has every colour the design guide names, each a # colour', () => {
    const names = ['bg', 'surface', 'ink', 'muted', 'line', 'accent', 'accentInk', 'accentSoft', 'warn', 'warnSoft', 'amber', 'amberSoft', 'good', 'goodSoft'];
    for (const name of names) expect(colors[name as keyof typeof colors]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it.each([
    ['ink', 'bg'],
    ['ink', 'surface'],
    ['muted', 'bg'],
    ['muted', 'surface'],
    ['accent', 'bg'],
    ['accentInk', 'accent'],
    ['warn', 'warnSoft'],
    ['amber', 'amberSoft'],
    ['good', 'goodSoft'],
  ] as const)('%s on %s is easy to read (at least 4.5 to 1)', (text, background) => {
    expect(contrast(colors[text], colors[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps taps at least 44 and text at least 13', () => {
    expect(tapTarget).toBeGreaterThanOrEqual(44);
    for (const style of Object.values(type)) expect(style.size).toBeGreaterThanOrEqual(13);
    expect(radius).toBeGreaterThan(0);
  });

  it('picks spacing from the guide steps and stays inside them', () => {
    expect(space(1)).toBe(4);
    expect(space(99)).toBe(24);
  });
});
