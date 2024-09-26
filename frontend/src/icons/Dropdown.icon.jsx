import React from 'react';
import { classNames } from '../utilities';


export const DropdownIcon = ({ className, onClick }) => {
  return (
    <svg
      className={classNames(
        'add-icon cursor-pointer',
        className ? className : ''
      )}
      onClick={onClick ? onClick : () => null}
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 1L8 8L15 1" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
