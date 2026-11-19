import { fireEvent, render, screen } from '@testing-library/react-native';

import Home from '../src/app/(tabs)/index';
import More from '../src/app/(tabs)/more';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({ router: { navigate: (...args: unknown[]) => mockNavigate(...args), replace: jest.fn() } }));

describe('the starter screens', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('Home shows the app name and its one main button', async () => {
    await render(<Home />);
    expect(screen.getByText('Starter Web App')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open More' })).toBeTruthy();
  });

  it('Home opens More when the button is tapped', async () => {
    await render(<Home />);
    await fireEvent.press(screen.getByRole('button', { name: 'Open More' }));
    expect(mockNavigate).toHaveBeenCalledWith('/more');
  });

  it('More changes what is on screen after a tap', async () => {
    await render(<More />);
    expect(screen.getByText('Nothing tapped yet.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tap here' }));
    expect(screen.getByText('Tap received.')).toBeTruthy();
  });
});
