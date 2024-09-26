import React from 'react';
import { classNames } from '../utilities';


export const NotifyIcon = ({ className, onClick }) => {
  return (
    <svg
      className={classNames(
        'add-icon cursor-pointer',
        className ? className : ''
      )}
      onClick={onClick ? onClick : () => null}
      width="23"
      height="25"
      viewBox="0 0 23 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.9677 8.3871C17.9677 6.69313 17.2948 5.06855 16.097 3.87074C14.8992 2.67292 13.2746 2 11.5806 2C9.88668 2 8.2621 2.67292 7.06429 3.87074C5.86647 5.06855 5.19355 6.69313 5.19355 8.3871C5.19355 15.8387 2 17.9677 2 17.9677H21.1613C21.1613 17.9677 17.9677 15.8387 17.9677 8.3871Z" stroke="#F4F4F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.4225 22.2258C13.2353 22.5485 12.9667 22.8163 12.6435 23.0024C12.3203 23.1886 11.9539 23.2866 11.5809 23.2866C11.2079 23.2866 10.8414 23.1886 10.5182 23.0024C10.195 22.8163 9.92641 22.5485 9.73926 22.2258" stroke="#F4F4F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
