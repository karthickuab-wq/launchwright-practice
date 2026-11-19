import { WIDE, tabBarPositionFor } from '../src/layout';

describe('the web layout', () => {
  it('puts the tabs along the bottom in a phone-sized window', () => {
    expect(tabBarPositionFor(390)).toBe('bottom');
    expect(tabBarPositionFor(WIDE - 1)).toBe('bottom');
  });

  it('puts the tabs down the left side in a wide window', () => {
    expect(tabBarPositionFor(WIDE)).toBe('left');
    expect(tabBarPositionFor(1280)).toBe('left');
  });
});
