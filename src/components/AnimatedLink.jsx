import React from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

export const AnimatedLink = ({ to, children, animation, inlineStyles, elementToAnimate }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    if (document.startViewTransition) {
      flushSync(() => {
        const transition = document.startViewTransition(() => {
          navigate(to);
        });

        transition.ready.then(() => {
          if (elementToAnimate) {
            elementToAnimate.animate(...animation);
          } else {
            document.documentElement.animate(...animation);
          }
        });
      });
    } else {
      navigate(to);
    }
  };
  return (
    <Link
      to={to}
      onClick={handleClick}
      style={{
        textDecoration: 'none',
        ...inlineStyles,
      }}
    >
      {children}
    </Link>
  );
};
