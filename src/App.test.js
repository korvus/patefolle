import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the balance section title', () => {
  render(<App />);
  expect(screen.getByText(/Balance/i)).toBeInTheDocument();
});
