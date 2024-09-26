import React, { useEffect, useState } from "react";
import { AutoComplete, DatePicker, Pagination, Tooltip } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../baseComponents/Table";
import { Select } from "antd";
import "../Module_Report/modulereport.scss";
import { SearchIcon } from "../../../icons/SearchIcon";
import dayjs from "dayjs";
import { getAllVisitorsAction, getFilterVisitors } from "../../../store/actions/visitor.action";


const VisitorReports = () => {
  const [tableData, setTableData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [tableLoader, setTableLoader] = useState(false);
  const [isStatus, setStatus] = useState(null);
  const [selectedVisitors, setSelectedVisitors] = useState(null);
  const [visitorOptions, setVisitorOptions] = useState([]);
  const [visitorActive, setVisitorActive] = useState(null);

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const [selectedDateFrom, setSelectedDateFrom] = useState(null);
  const [selectedDateTo, setSelectedDateTo] = useState(null);

  const dispatch = useDispatch();

  const { moduleLoader } = useSelector((state) => state?.moduleState);

  const { allVisitors, allVisitorsData
  } = useSelector((state) => state?.visitorState);

  const hasActiveFilters = () => {
    return (selectedDateFrom || selectedDateTo || selectedVisitors || isStatus);
  };



  useEffect(() => {
    if (allVisitorsData && Array.isArray(allVisitorsData)) {
      const formattedData = allVisitorsData.map((item, index) => ({
        key: `${item.personName}-${index}`,
        visitorName: item.person_name || "N/A",
        visitorEmail: item.employee_email || "N/A",
        fromdate: item.check_in_time || "N/A",
        todate: item.check_out_time || "N/A",
        location: item.location || "N/A",
        employee_status: item.employee_status === "inactive" ? "Disabled" : "Approved",
        purpose: "N/A",
        singleuse: "N/A"
      }));

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [allVisitorsData]);

  const visitorStatusOptions = [
    { label: "Approved", value: "active" },
    { label: "Disabled", value: "inactive" },
  ];

  const ActiveFilterSearch = () => {
    return "";
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = tableData ? tableData.slice(startIndex, endIndex) : [];


  const handleSearch = () => {
    const errorMessage = ActiveFilterSearch();

    if (errorMessage) {
      setTooltipMessage(errorMessage);
      setShowTooltip(true);
      return;
    }
    setShowTooltip(false);

    const formattedDateFrom = selectedDateFrom ? dayjs(selectedDateFrom).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : "";
    const formattedDateTo = selectedDateTo ? dayjs(selectedDateTo).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : "";

    const payload = {
      from_date: formattedDateFrom || "",
      to_date: formattedDateTo || "",
      person_name: selectedVisitors || "",
      employee_status: isStatus || "",
    };

    setCurrentPage(1);
    dispatch(getFilterVisitors(payload));
    setIsFiltered(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset state function
  const resetState = () => {
    setSelectedDateFrom(null);
    setSelectedDateTo(null);
    setVisitorActive(null);
    setIsFiltered(false);
    setStatus(null);
    setSelectedVisitors(null);
    setVisitorOptions([]);
    setCurrentPage(1);
    setSelectedDateFrom(null);
    setSelectedDateTo(null);

    setTableData([]);
  };
  // Reset state when the component mounts
  useEffect(() => {
    resetState();
  }, []);

  const handleClear = () => {
    resetState();
  };
  const [loadingStates, setLoadingStates] = useState({
    visitors: false,
  });
  
  const handleLoadingState = (key, value) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        handleLoadingState("visitors", true);
       await dispatch(getAllVisitorsAction());
       handleLoadingState("visitors", false);
  } catch (error) {
    handleLoadingState("visitors", false);
    console.error("Error fetching data:", error);
  }
};

fetchData();
}, [dispatch]);


  useEffect(() => {
    setTableLoader(moduleLoader);
  }, [moduleLoader]);

  const columns = [
    {
      title: <span className="font-[700]">Name</span>,
      dataIndex: "visitorName",
      key: "visitorName",
      width: 200,
    },
    {
      title: <span className="font-[700]">Email</span>,
      dataIndex: "visitorEmail",
      key: "visitorEmail",
      width: 280,
    },
    {
      title: <span className="font-[700]">From</span>,
      dataIndex: "fromdate",
      key: "fromdate",
      width: 260,
    },
    {
      title: <span className="font-[700]">To</span>,
      dataIndex: "todate",
      key: "todate",
      width: 260,
    },
    // {
    //   title: <span className="font-[700]">Purpose</span>,
    //   dataIndex: "purpose",
    //   key: "purpose",
    //   width: 220,
    // },
    {
      title: <span className="font-[700]">Location</span>,
      dataIndex: "location",
      key: "location",
      width: 280,
    },
    // {
    //   title: <span className="font-[700]">Single Day Use</span>,
    //   dataIndex: "singleuse",
    //   key: "singleuse",
    //   width: 180,
    // },
    {
      title: <span className="font-[700]">Status</span>,
      dataIndex: "employee_status",
      key: "employee_status",
      width: 150,
      render: (status) => (
        <span
          style={{
            color: status === "Approved" ? "#1D6F42" : "#be123c",
          }}
        >
          {status}
        </span>
      ),
    },
  ];

  const disabledDate = (current) => {
    if (!current) return false;
    return current.isAfter(dayjs(), 'day');
  };


  // Disable dates in the "To Date" picker that are before the "From Date"
  const disabledToDate = (current) => {
    if (!current || !selectedDateFrom) return disabledDate(current);
    const isBeforeFromDate = current.isBefore(selectedDateFrom, 'day');
    return disabledDate(current) || isBeforeFromDate;
  };

  const handleDateChange = (date, dateString, isFromDate) => {
    if (isFromDate) {
      setSelectedDateFrom(date);
      setSelectedDateTo(null);
      // Reset "To Date" if it's before the newly selected "From Date"
      if (selectedDateTo && dayjs(selectedDateTo).isBefore(date, 'millisecond')) {
        setSelectedDateTo(null);
      }
    } else {
      setSelectedDateTo(date);
    }
  };


  return (
    <div>
      <div className="text-center text-3xl font-bold">
        Visitors Report
      </div>
      <div className="flex justify-between my-4">
        <div className="border-2 border-slate-300 p-3 w-10/12 grid grid-cols-4 gap-4 rounded-lg ">
          <div className="ant-dropdown font-sans text-base font-medium bg-white shadow-md rounded-xl flex items-center w-full">
            <DatePicker
              showTime={{ format: 'HH:mm:ss' }}
              value={selectedDateFrom}
              onChange={(date, dateString) => handleDateChange(date, dateString, true)}
              format="YYYY-MM-DD HH:mm:ss.SSS"
              placeholder="Select from date"
              className="custom-placeholder font-sans rounded-xl flex items-center border-none h-10 focus:outline-none focus:border-none focus:ring-0 w-full"
              disabledDate={disabledDate}
              disabled={moduleLoader}
            />
          </div>

          <div className="ant-dropdown font-sans text-base font-medium bg-white shadow-md rounded-xl flex items-center w-full">
            <DatePicker
              showTime={{ format: 'HH:mm:ss' }}
              value={selectedDateTo}
              onChange={(date, dateString) => handleDateChange(date, dateString, false)}
              format="YYYY-MM-DD HH:mm:ss.SSS"
              placeholder="Select to date"
              className="custom-placeholder font-sans rounded-xl flex items-center border-none h-10 focus:outline-none focus:border-none focus:ring-0 w-full"
              disabled={moduleLoader || !selectedDateFrom}
              disabledDate={disabledToDate}
            />
          </div>

          <div className="bg-white shadow-md rounded-xl flex items-center w-full">
            <div className="w-full">
              <AutoComplete
                style={{ placeholder: { fontFamily: "", color: "black" } }}
                bordered={false}
                className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
                optionFilterProp="label"
                options={visitorOptions}
                disabled={moduleLoader || loadingStates.visitors}
                onSelect={(value, option) => {
                  setSelectedVisitors(value);
                  setVisitorActive(value);
                }}
                onSearch={(value) => {
                  setVisitorActive(value);

                  if (value) {
                    const filteredOptions = allVisitors
                      .filter((visitors) => {
                        return (
                          (visitors.person_name &&
                            visitors.person_name.toLowerCase()
                              .includes(value.toLowerCase())) ||
                          (visitors.email &&
                            visitors.email
                              .toLowerCase()
                              .includes(value.toLowerCase()))
                        );
                      })
                      .map((visitors, index) => ({
                        value: visitors.person_name,
                        label: visitors.person_name,
                        key: `${index}_${visitors.person_name}`,
                      }));

                    if (filteredOptions.length === 0) {
                      setVisitorOptions([
                        {
                          value: "no_data",
                          label: "No data",
                          disabled: true,
                        },
                      ]);
                    } else {
                      setVisitorOptions(filteredOptions);
                    }
                  } else {
                    setVisitorOptions([]);
                    setSelectedVisitors(null);
                  }
                }}
                placeholder={loadingStates.visitors ? "Loading..." : "Search by Name, Email"}
                suffixIcon={
                  visitorActive && !(moduleLoader || loadingStates.visitors) ? (
                    <CloseOutlined
                      onClick={() => {
                        setVisitorActive(null);
                        setSelectedVisitors(null);
                      }}
                      style={{
                        cursor: "pointer",
                      }}
                      className="hover:text-gray-700 transition-colors duration-200"
                    />
                  ) : (<SearchIcon />)}
                value={visitorActive || undefined}
              >
              </AutoComplete>
            </div>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select status"
              options={visitorStatusOptions}
              value={isStatus}
              showSearch
              onChange={(value) => setStatus(value)}
              disabled={moduleLoader}
            ></Select>
          </div>
        </div>

        <div className="flex justify-center items-center">
          {hasActiveFilters() && (
            <button
              type="button"
              onClick={handleClear}
              className="font-medium text-rose-800"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex justify-center items-center">
          <div>
            <Tooltip
              title={tooltipMessage}
              visible={showTooltip}
              placement="topLeft"
              onVisibleChange={(visible) => setShowTooltip(visible)}
              trigger="click"
            >
              <button
                className="bg-rose-800 text-white font-medium tracking-wider py-2 px-10 rounded-lg shadow-md hover:bg-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:ring-opacity-50"
                onClick={handleSearch}
                disabled={moduleLoader}
              >
                Search
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mt-5 ant-table  rounded-xl shadow-xl">
        {tableData ? (
          <Table
            data={currentData}
            columns={columns}
            loading={tableLoader}
            isFiltered={isFiltered}
          />
        ) : (
          <div></div>
        )}
      </div>
      <div className=" font-sans flex justify-end mt-5 ">
        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={tableData.length}
            onChange={handlePageChange}
            hideOnSinglePage={true}
            showSizeChanger={false}
            className="table-pagination custom-pagination-font"
          />
        </div>
      </div>
    </div>
  );
};

export default VisitorReports;
