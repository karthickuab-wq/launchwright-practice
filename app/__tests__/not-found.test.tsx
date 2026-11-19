import { fireEvent, render, screen } from '@testing-library/react-native';

import NotFound from '../src/app/+not-found';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ router: { navigate: jest.fn(), replace: (...args: unknown[]) => mockReplace(...args) } }));

it('the not-found page shows the way back to Home', async () => {
  await render(<NotFound />);
  expect(screen.getByText("This page isn't here")).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Go to Home' }));
  expect(mockReplace).toHaveBeenCalledWith('/');
});
