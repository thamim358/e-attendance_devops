import React, { useState } from 'react';
import { classNames } from '../utilities';

export const ActionMenuIcon = ({ className, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <svg
      className={classNames(
        'ActionMenu-icon cursor-pointer',
        className ? className : ''
      )}
      onClick={onClick ? onClick : () => null}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      width="25"
      height="30"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={
          isHovered
            ? 'M7.5 4.5L3.75 9H11.25L7.5 4.5Z'
            : 'M7.5 10.5L11.25 6H3.75L7.5 10.5Z'
        }
        fill="#be123c"
      />
      <path
        d="M7.5 0C3.3645 0 0 3.3645 0 7.5C0 11.6355 3.3645 15 7.5 15C11.6355 15 15 11.6355 15 7.5C15 3.3645 11.6355 0 7.5 0ZM7.5 13.5C4.19175 13.5 1.5 10.8082 1.5 7.5C1.5 4.19175 4.19175 1.5 7.5 1.5C10.8082 1.5 13.5 4.19175 13.5 7.5C13.5 10.8082 10.8082 13.5 7.5 13.5Z"
        fill="#be123c"
      />
    </svg>
  );
};
