import React from 'react';
import { classNames } from '../utilities';

export const DropdownarrowIcon = ({ fill = '', className, onClick }) => {
  return (
    <svg
      className={classNames('cursor-pointer', className)}
      onClick={onClick}
      fill="none"
      width="13"
      height="8"
      viewBox="0 0 13 8"
      xmlns="http://www.w3.org/2000/svg"
    >
<path d="M12 6.00049L6.66667 0.667154L1.33333 6.00049" stroke="black" stroke-width="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
