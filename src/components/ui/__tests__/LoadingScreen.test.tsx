import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme';
import LoadingScreen from '../LoadingScreen';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('LoadingScreen', () => {
  it('renders with default props', () => {
    renderWithTheme(<LoadingScreen />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Processando dados...';
    renderWithTheme(<LoadingScreen message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders overlay variant correctly', () => {
    const { container } = renderWithTheme(<LoadingScreen variant="overlay" />);

    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });

  it('renders inline variant correctly', () => {
    renderWithTheme(<LoadingScreen variant="inline" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders with large size', () => {
    renderWithTheme(<LoadingScreen size="large" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('renders with small size', () => {
    renderWithTheme(<LoadingScreen size="small" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('creates snapshot for page variant', () => {
    const { container } = renderWithTheme(<LoadingScreen variant="page" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for overlay variant', () => {
    const { container } = renderWithTheme(<LoadingScreen variant="overlay" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for inline variant', () => {
    const { container } = renderWithTheme(<LoadingScreen variant="inline" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
