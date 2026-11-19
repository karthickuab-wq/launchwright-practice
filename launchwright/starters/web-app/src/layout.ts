// Windows this wide (or wider) get the tabs down the left side; narrower ones, such as a phone's
// browser, get them along the bottom.
export const WIDE = 768;

export const tabBarPositionFor = (width: number): 'left' | 'bottom' => (width >= WIDE ? 'left' : 'bottom');
