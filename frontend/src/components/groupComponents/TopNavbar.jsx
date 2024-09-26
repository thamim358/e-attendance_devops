import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DropdownIcon, NotifyIcon } from '../../icons';
import './TopNavbar.scss';
import { batchDataSlice } from '../../store/slices/batchjob.slice';
import { useDispatch } from 'react-redux';

const TopNavbar = () => {
  const location = useLocation();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const subMenuRef = useRef(null);
  const dispatch = useDispatch()

  // Toggle submenu visibility
  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  useEffect(() => {
    location.pathname !== "batch_job" && dispatch(batchDataSlice(null))
  }, [location])

  // Close the submenu if clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target)) {
        setIsSubMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [subMenuRef]);

  const isAttendanceReportActive = () => {
    const subMenuPaths = ["/module-report", "/student-report", "/international-report", "/module-group"];
    return subMenuPaths.includes(location.pathname) || location.pathname === "/attendance-report";
  };

  const getLinkClass = (path) => {
    return path === "/attendance-report"
      ? (isAttendanceReportActive() ? "relative text-white font-black pb-1 underline-animation active" : "relative text-white pb-1 underline-animation")
      : (location.pathname === path ? "relative text-white font-black pb-1 underline-animation active" : "relative text-white pb-1 underline-animation");
  };

  const getLinkClassname = (path) => {
    return path === "/attendance-report"
      ? (isAttendanceReportActive() ? "relative text-rose-800 font-semibold pb-1 active-animation active" : "relative text-black font-medium pb-1 active-animation")
      : (location.pathname === path ? "relative text-rose-800 font-semibold pb-1 active-animation active" : "relative text-black font-medium  pb-1 active-animation");
  };

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center p-3 bg-rose-800 shadow-md">
      <div className="flex items-center px-16">
        <img src="/psb_white.png" alt="logo" className='h-12' />
      </div>

      <div className="flex items-center space-x-12 px-16 text-md">
        {/* Attendance Report with submenus */}
        <div className="relative" ref={subMenuRef}>
          <button
            onClick={toggleSubMenu}
            className={getLinkClass("/attendance-report")}
          >
            Attendance Report
          </button>
          {isSubMenuOpen && (
            <div className="absolute bg-[#fff] text-black mt-4  p-2 text-sm rounded shadow-xl">
              <Link to="/module-report" className={getLinkClassname("/module-report")} onClick={() => setIsSubMenuOpen(false)}>
                Module Report
              </Link>
              <Link to="/student-report" className={getLinkClassname("/student-report")} onClick={() => setIsSubMenuOpen(false)}>
                Student Report
              </Link>
              <Link to="/international-report" className={getLinkClassname("/international-report")} onClick={() => setIsSubMenuOpen(false)}>
                International Student Report
              </Link>
              <Link to="/module-group" className={getLinkClassname("/module-group")} onClick={() => setIsSubMenuOpen(false)}>
                Upload Module Group Assignment
              </Link>
            </div>
          )}
        </div>

        {/* Other main menu items */}
        <div>
          <Link to="/visitors-report" className={getLinkClass("/visitors-report")} onClick={() => setIsSubMenuOpen(false)}>
            Visitors Report
          </Link>
        </div>
        {/* <div>
          <Link to="/employee-report" className={getLinkClass("/employee-report")} onClick={() => setIsSubMenuOpen(false)}>
            Employees Report
          </Link>
        </div> */}
        <div>
          <Link to="/batch-job" className={getLinkClass("/batch-job")} onClick={() => setIsSubMenuOpen(false)}>
            Batch Job
          </Link>
        </div>
      </div>

      <div className="flex items-center px-16">
        {/* <div className="flex items-center px-4">
          <NotifyIcon />
        </div>
        <div className="flex items-center">
          <DropdownIcon />
        </div> */}
      </div>
    </nav>
  );
};

export default TopNavbar;
