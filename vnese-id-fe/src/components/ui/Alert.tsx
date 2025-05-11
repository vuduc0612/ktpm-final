import { ReactNode } from 'react';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = ''
}: AlertProps) => {
  const icons = {
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />,
    error: <XCircleIcon className="h-5 w-5 text-red-400" />
  };

  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };

  return (
    <div className={`rounded-md border p-4 ${styles[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${type === 'info' ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600' : ''}
                  ${type === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' : ''}
                  ${type === 'warning' ? 'text-amber-500 hover:bg-amber-100 focus:ring-amber-600' : ''}
                  ${type === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' : ''}
                `}
              >
                <span className="sr-only">Đóng</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 