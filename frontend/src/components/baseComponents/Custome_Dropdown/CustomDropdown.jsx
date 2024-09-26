import React, { useEffect, useRef } from 'react';
import './CustomDropdown.scss';

const CustomDropdown = ({ overlay, visible, onVisibleChange, children }) => {
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      onVisibleChange(false);
    }
  };

  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div
        className="dropdown-trigger"
        onClick={() => onVisibleChange(!visible)}
      >
        {children}
      </div>
      {visible && <div className="dropdown-menu">{overlay}</div>}
    </div>
  );
};

export default CustomDropdown;
