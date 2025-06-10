import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  footer,
  children,
  className = '',
  hoverable = false
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden
        ${hoverable ? 'transition-shadow hover:shadow-md' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;