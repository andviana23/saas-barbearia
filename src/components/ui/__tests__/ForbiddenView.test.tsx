import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme';
import ForbiddenView from '../ForbiddenView';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ForbiddenView', () => {
  it('renders with default props', () => {
    renderWithTheme(<ForbiddenView />);

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
    expect(screen.getByText(/Você não tem permissão/)).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    const customTitle = 'Área Restrita';
    const customMessage = 'Esta funcionalidade está em desenvolvimento';

    renderWithTheme(<ForbiddenView title={customTitle} message={customMessage} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders back button when onBack is provided', () => {
    const mockBack = jest.fn();

    renderWithTheme(<ForbiddenView onBack={mockBack} />);

    const backButton = screen.getByText('Voltar');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('renders home button when onHome is provided', () => {
    const mockHome = jest.fn();

    renderWithTheme(<ForbiddenView onHome={mockHome} />);

    const homeButton = screen.getByText('Ir para início');
    expect(homeButton).toBeInTheDocument();

    fireEvent.click(homeButton);
    expect(mockHome).toHaveBeenCalledTimes(1);
  });

  it('does not render actions when showActions is false', () => {
    renderWithTheme(<ForbiddenView showActions={false} onHome={() => {}} onBack={() => {}} />);

    expect(screen.queryByText('Voltar')).not.toBeInTheDocument();
    expect(screen.queryByText('Ir para início')).not.toBeInTheDocument();
  });

  it('renders inline variant correctly', () => {
    renderWithTheme(<ForbiddenView variant="inline" />);

    const title = screen.getByText('Acesso Negado');
    expect(title).toBeInTheDocument();
  });

  it('renders card variant correctly', () => {
    const { container } = renderWithTheme(<ForbiddenView variant="card" />);

    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    const childText = 'Custom child content';

    renderWithTheme(
      <ForbiddenView>
        <div>{childText}</div>
      </ForbiddenView>,
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('creates snapshot for page variant', () => {
    const { container } = renderWithTheme(<ForbiddenView />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('creates snapshot for card variant', () => {
    const { container } = renderWithTheme(<ForbiddenView variant="card" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
