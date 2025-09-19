'use client';

import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';
import {
  // Navegação
  Home,
  Dashboard,
  Menu,
  ArrowBack,
  ArrowForward,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
  
  // Ações
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Check,
  Close,
  Search,
  FilterList,
  Refresh,
  Download,
  Upload,
  Share,
  
  // Status
  CheckCircle,
  Error,
  Warning,
  Info,
  Schedule,
  Pending,
  
  // Usuário
  Person,
  PersonAdd,
  Group,
  AccountCircle,
  Settings,
  Logout,
  
  // Negócio
  ContentCut,
  Event,
  Payment,
  Receipt,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CreditCard,
  
  // Comunicação
  Email,
  Phone,
  Message,
  Notifications,
  NotificationsOff,
  
  // Interface
  Visibility,
  VisibilityOff,
  MoreVert,
  MoreHoriz,
  DragHandle,
  
  // Arquivos
  Folder,
  InsertDriveFile,
  PictureAsPdf,
  Image,
} from '@mui/icons-material';

type IconName = 
  // Navegação
  | 'home' | 'dashboard' | 'menu' | 'arrow-back' | 'arrow-forward'
  | 'expand-more' | 'expand-less' | 'chevron-left' | 'chevron-right'
  
  // Ações
  | 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'check' | 'close'
  | 'search' | 'filter' | 'refresh' | 'download' | 'upload' | 'share'
  
  // Status
  | 'success' | 'error' | 'warning' | 'info' | 'schedule' | 'pending'
  
  // Usuário
  | 'person' | 'person-add' | 'group' | 'account' | 'settings' | 'logout'
  
  // Negócio
  | 'cut' | 'event' | 'payment' | 'receipt' | 'trending-up' | 'trending-down'
  | 'money' | 'credit-card'
  
  // Comunicação
  | 'email' | 'phone' | 'message' | 'notifications' | 'notifications-off'
  
  // Interface
  | 'visibility' | 'visibility-off' | 'more-vert' | 'more-horiz' | 'drag'
  
  // Arquivos
  | 'folder' | 'file' | 'pdf' | 'image';

interface DSIconProps extends Omit<SvgIconProps, 'children'> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const iconMap: Record<IconName, React.ComponentType<SvgIconProps>> = {
  // Navegação
  'home': Home,
  'dashboard': Dashboard,
  'menu': Menu,
  'arrow-back': ArrowBack,
  'arrow-forward': ArrowForward,
  'expand-more': ExpandMore,
  'expand-less': ExpandLess,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  
  // Ações
  'add': Add,
  'edit': Edit,
  'delete': Delete,
  'save': Save,
  'cancel': Cancel,
  'check': Check,
  'close': Close,
  'search': Search,
  'filter': FilterList,
  'refresh': Refresh,
  'download': Download,
  'upload': Upload,
  'share': Share,
  
  // Status
  'success': CheckCircle,
  'error': Error,
  'warning': Warning,
  'info': Info,
  'schedule': Schedule,
  'pending': Pending,
  
  // Usuário
  'person': Person,
  'person-add': PersonAdd,
  'group': Group,
  'account': AccountCircle,
  'settings': Settings,
  'logout': Logout,
  
  // Negócio
  'cut': ContentCut,
  'event': Event,
  'payment': Payment,
  'receipt': Receipt,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'money': AttachMoney,
  'credit-card': CreditCard,
  
  // Comunicação
  'email': Email,
  'phone': Phone,
  'message': Message,
  'notifications': Notifications,
  'notifications-off': NotificationsOff,
  
  // Interface
  'visibility': Visibility,
  'visibility-off': VisibilityOff,
  'more-vert': MoreVert,
  'more-horiz': MoreHoriz,
  'drag': DragHandle,
  
  // Arquivos
  'folder': Folder,
  'file': InsertDriveFile,
  'pdf': PictureAsPdf,
  'image': Image,
};

const getSizeValue = (size: DSIconProps['size']) => {
  switch (size) {
    case 'xs':
      return 'inherit'; // 16px
    case 'sm':
      return 'small';   // 20px
    case 'md':
      return 'medium';  // 24px
    case 'lg':
      return 'large';   // 32px
    case 'xl':
      return undefined; // 40px (custom)
    default:
      return 'small';
  }
};

export default function DSIcon({
  name,
  size = 'sm',
  sx,
  ...props
}: DSIconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Ícone "${name}" não encontrado no DSIcon`);
    return null;
  }

  const fontSize = getSizeValue(size);
  const customSize = size === 'xl' ? { fontSize: '2.5rem' } : {};

  return (
    <IconComponent
      fontSize={fontSize}
      sx={{
        ...customSize,
        ...sx,
      }}
      {...props}
    />
  );
}

// Componentes específicos para contextos comuns
export function DSStatusIcon({ 
  status, 
  ...props 
}: { 
  status: 'success' | 'error' | 'warning' | 'info' | 'pending' 
} & Omit<DSIconProps, 'name'>) {
  const colorMap = {
    success: 'success.main',
    error: 'error.main',
    warning: 'warning.main',
    info: 'info.main',
    pending: 'text.secondary',
  };

  return (
    <DSIcon
      name={status === 'pending' ? 'schedule' : status}
      sx={{ color: colorMap[status] }}
      {...props}
    />
  );
}

export function DSActionIcon({ 
  action, 
  ...props 
}: { 
  action: 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'search' | 'filter' | 'refresh'
} & Omit<DSIconProps, 'name'>) {
  return <DSIcon name={action} {...props} />;
}

export function DSNavigationIcon({ 
  direction, 
  ...props 
}: { 
  direction: 'back' | 'forward' | 'up' | 'down' | 'left' | 'right'
} & Omit<DSIconProps, 'name'>) {
  const iconMap = {
    back: 'arrow-back',
    forward: 'arrow-forward',
    up: 'expand-less',
    down: 'expand-more',
    left: 'chevron-left',
    right: 'chevron-right',
  } as const;

  return <DSIcon name={iconMap[direction]} {...props} />;
}

// Hook para usar ícones programaticamente
export function useIcons() {
  return {
    getIcon: (name: IconName) => iconMap[name],
    iconNames: Object.keys(iconMap) as IconName[],
  };
}