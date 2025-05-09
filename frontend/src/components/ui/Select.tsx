import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => <select ref={ref} {...props} />
);

Select.displayName = "Select";
