import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const AnimatedOutlet = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial>
      {element && React.cloneElement(element, { key: pathname })}
    </AnimatePresence>
  );
};
