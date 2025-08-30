import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme';
import ErrorView from '../ErrorView';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ErrorView', () => {
  it('renders with default props', () => {
    renderWithTheme(<ErrorView />);

    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    const customTitle = 'Erro personalizado';
    const customMessage = 'Mensagem personalizada';

    renderWithTheme(<ErrorView title={customTitle} message={customMessage} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockRetry = jest.fn();

    renderWithTheme(<ErrorView onRetry={mockRetry} />);

    const retryButton = screen.getByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('renders home button when onHome is provided', () => {
    const mockHome = jest.fn();

    renderWithTheme(<ErrorView onHome={mockHome} />);

    const homeButton = screen.getByText('Ir para início');
    expect(homeButton).toBeInTheDocument();

    fireEvent.click(homeButton);
    expect(mockHome).toHaveBeenCalledTimes(1);
  });

  it('renders error details when error is provided', () => {
    const error = new Error('Test error message');

    renderWithTheme(<ErrorView error={error} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders error details with string error', () => {
    const errorMessage = 'String error message';

    renderWithTheme(<ErrorView error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders inline variant correctly', () => {
    renderWithTheme(<ErrorView variant="inline" />);

    const title = screen.getByText('Ops! Algo deu errado');
    expect(title).toBeInTheDocument();
  });

  it('renders card variant correctly', () => {
    const { container } = renderWithTheme(<ErrorView variant="card" />);

    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders with warning severity', () => {
    const error = 'Warning message';

    renderWithTheme(<ErrorView error={error} severity="warning" />);

    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('creates snapshot for page variant', () => {
    const { container } = renderWithTheme(<ErrorView />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
