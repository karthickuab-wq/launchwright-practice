// The app's look, in one place. The values live in tokens.json, which `npm run design` fills in
// from the design guide (project/design.md). Screens and components read this file and never
// write a colour, size or corner of their own.
import tokens from './tokens.json';

export type Weight = '400' | '500' | '600' | '700' | '800';
export type TextStyleName = keyof typeof tokens.type;

export const colors = tokens.colors;
export const radius = tokens.radius;
export const tapTarget = tokens.tapTarget;
export const spacing = tokens.spacing;

export const type = tokens.type as Record<TextStyleName, { size: number; weight: Weight }>;

// A space from the guide's steps: space(3) is the third step.
export const space = (step: number): number => spacing[Math.min(Math.max(step, 1), spacing.length) - 1];
