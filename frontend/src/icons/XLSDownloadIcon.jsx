import React from 'react';
import { classNames } from '../utilities';

export const XLSDownloadIcon = ({ fill = '', className, onClick }) => {
  return (
    <svg
      className={classNames('cursor-pointer', className)}
      onClick={onClick}
      fill="none"
      width="17"
      height="19"
      viewBox="0 0 21 22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.44434 2.1111C1.44434 1.49746 1.9418 1 2.55543 1H12.5553H13.2062C13.5009 1 13.7835 1.11707 13.9919 1.32543L18.8965 6.23006C19.1048 6.43842 19.2219 6.72104 19.2219 7.01572V19.8887C19.2219 20.5023 18.7245 20.9998 18.1108 20.9998H2.55543C1.9418 20.9998 1.44434 20.5023 1.44434 19.8887V2.1111Z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
<path d="M19.2215 6.55549H13.666V1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M9.77734 12.1108V16.5552H11.444" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M15.3327 12.1108H14.7771C14.1635 12.1108 13.666 12.6083 13.666 13.2219C13.666 13.8356 14.1635 14.333 14.7771 14.333C15.3908 14.333 15.8882 14.8305 15.8882 15.4441C15.8882 16.0578 15.3908 16.5552 14.7771 16.5552H13.666" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M7.55509 12.1108L4.77734 16.5552" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M4.77734 12.1108L7.55509 16.5552" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
