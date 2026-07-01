import React, { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function GlobalLoader() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const isActive = fetching > 0 || mutating > 0;

  useEffect(() => {
    let growTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    if (isActive) {
      setVisible(true);
      setWidth(20);
      growTimer = setTimeout(() => setWidth(70), 100);
    } else {
      setWidth(100);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 400);
    }

    return () => {
      clearTimeout(growTimer);
      clearTimeout(hideTimer);
    };
  }, [isActive]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #3831c4, #6c63ff)',
        zIndex: 9999,
        transition: width === 100 ? 'width 0.2s ease' : 'width 0.8s ease',
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 8px rgba(56, 49, 196, 0.6)',
      }}
    />
  );
}
