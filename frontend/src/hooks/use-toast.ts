import { toast as hotToast } from 'react-hot-toast';

export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant }: Toast) => {
    const message = description || title || '';
    
    if (variant === 'destructive') {
      hotToast.error(message);
    } else {
      hotToast.success(message);
    }
  };

  return { toast };
}
