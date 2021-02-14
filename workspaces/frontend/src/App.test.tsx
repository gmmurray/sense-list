import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('runs', () => {
  render(<App />);
  expect(true).toBeTruthy();
});
