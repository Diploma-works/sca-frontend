import { render, screen } from '@testing-library/react';

jest.mock('overlayscrollbars/overlayscrollbars.css', () => ({}), { virtual: true });

jest.mock('./components/Navbar', () => () => <div>Navbar Mock</div>);
jest.mock('./routes', () => () => <div>Routes Mock</div>);

import App from './App';

test('renders application shell', () => {
  render(<App />);
  expect(screen.getByText('Navbar Mock')).toBeInTheDocument();
  expect(screen.getByText('Routes Mock')).toBeInTheDocument();
});
