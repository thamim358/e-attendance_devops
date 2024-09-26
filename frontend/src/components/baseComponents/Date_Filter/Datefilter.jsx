import React, { useMemo, useState } from "react";
import CustomDropdown from "./CustomDropdown";
import { CalendarIcon } from "../../../icons/Calendar.icon";
import "./Datefilter.scss";

const Datefilter = ({
  currentDate,
  selectDates,
  setSelectDates,
  handleMonthChange,
  handleYearChange,
  renderCalendar,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const monthNames = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const handleDateRangeSelect = (startDate, endDate) => {
  
  };

  const handleDateFilter = (value) => {
   
  };
  const currentMonth = useMemo(() => {
    const month = new Date(currentDate);
    month.setMonth(month.getMonth());
    return month;
  }, [currentDate]);

  const nextMonth = useMemo(() => {
    const month = new Date(currentDate);
    month.setMonth(month.getMonth() + 1);
    return month;
  }, [currentDate]);

  const handlePrevMonthClick = (e) => {
    e.preventDefault();
    handleMonthChange(-1);
  };

  const handleNextMonthClick = (e) => {
    e.preventDefault();
    handleMonthChange(1);
  };

  const handlePrevYearClick = (e) => {
    e.preventDefault();
    handleYearChange(-1);
  };

  const handleNextYearClick = (e) => {
    e.preventDefault();
    handleYearChange(1);
  };

  const filterButtons = useMemo(() => ["Today", "Yesterday"], []);

  const menu = useMemo(
    () => (
      <div className="custom-date-range-picker">
        <div className="buttons">
          <div className="button-row">
            {filterButtons.map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => handleDateFilter(filter)}
                className={
                  localStorage.getItem("selectedFilters") &&
                  localStorage.getItem("selectedFilters") === filter
                    ? "selected"
                    : ""
                }
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="calendars">
          <div className="calendar top-calendar">
            <div className="month-year">
              <div className="btn-first">
                <button type="button" onClick={handlePrevYearClick}>
                  &lt;&lt;
                </button>
                <button type="button" onClick={handlePrevMonthClick}>
                  &lt;
                </button>
              </div>
              <span>
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </span>
            </div>
            <div className="mt-4">
              {renderCalendar(currentMonth, handleDateRangeSelect, selectDates)}
            </div>
          </div>
          <div className="calendar bottom-calendar">
            <div className="secmonth-year">
              <span>
                {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
              </span>
              <div className="btn-datefilter">
                <button type="button" onClick={handleNextMonthClick}>
                  &gt;
                </button>
                <button type="button" onClick={handleNextYearClick}>
                  &gt;&gt;
                </button>
              </div>
            </div>
            <div className="mt-4">
              {renderCalendar(nextMonth, handleDateRangeSelect, selectDates)}
            </div>
          </div>
        </div>
      </div>
    ),
    [
      currentDate,
      handlePrevYearClick,
      handlePrevMonthClick,
      handleNextMonthClick,
      handleNextYearClick,
      currentMonth,
      nextMonth,
      renderCalendar,
    ]
  );

  let hideTimeout = null;

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => {
      setDropdownVisible(false);
    }, 250);
  };

  return (
    <div>
      <CustomDropdown
        overlay={menu}
        visible={dropdownVisible}
        onVisibleChange={setDropdownVisible}
      >
        <button
          type="button"
          className="ml-1 btn-text flex items-center gap-2 whitespace-nowrap"
        >
          <div className="Calendericon flex text-sm">
            <CalendarIcon className={"ml-2 mr-6"} />
            <div className="font-medium">Select date</div>
          </div>
        </button>
      </CustomDropdown>
    </div>
  );
};

export default Datefilter;
