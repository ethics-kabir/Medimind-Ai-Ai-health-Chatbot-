import React from 'react';

export default function EmergencyCallLink({ number, children, className }) {
  return (
    <a
      href={`tel:${number}`}
      className={className}
      aria-label={`Open phone dialer for ${number}`}
    >
      {children}
    </a>
  );
}
