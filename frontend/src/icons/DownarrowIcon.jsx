import React from 'react';
import { classNames } from '../utilities';

export const DownarrowIcon = ({ fill = '', className, onClick }) => {
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
<path d="M1.3335 1.66699L6.66683 7.00033L12.0002 1.66699" stroke="#BE123C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
