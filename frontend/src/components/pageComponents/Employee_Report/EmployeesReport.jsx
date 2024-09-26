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
import { getAllDepartmentAction, getAllEmployeeNameAction, getAllLocationAction, getFilterEmployee } from "../../../store/actions/employee.action";

const EmployeesReports = () => {
  const [tableData, setTableData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [tableLoader, setTableLoader] = useState(false);
  const [isStatus, setStatus] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeeActive, setEmployeeActive] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationOptions, setLocationOptions] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const dispatch = useDispatch();

  const { moduleLoader } = useSelector((state) => state?.moduleState);

  const { allLocation, allDepartment, allemployeedata, allemployeename } = useSelector((state) => state?.employeeState);

  const hasActiveFilters = () => {
    return (selectedDepartment || selectedLocation || selectedEmployee || isStatus);
  };

  useEffect(() => {
    if (allemployeedata && Array.isArray(allemployeedata)) {
      const formattedData = allemployeedata.map((item, index) => ({

        key: `${item.id}-${index}`, 
        empname:  `${item.employee_name} (${item.staff_id ?? 'N/A'})` || 'N/A',
        department: item.department_name || "N/A",
        temperature: item.temperature || "N/A",
        role: item.role || "N/A",
        campus: item.campus || "N/A",
        school: item.school || "N/A",
        status: item.status === "inactive" ? "Inactive" : "Active",
        location: item.location || "N/A"
      }));

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [allemployeedata]);

  useEffect(() => {
    if (allLocation && Array.isArray(allLocation)) {
      const options = allLocation.map((location, index) => ({
        value: location, 
        label: location, 
        key: index,   
      }));
      setLocationOptions(options);
    }
  }, [allLocation]);

  useEffect(() => {
    if (allDepartment && Array.isArray(allDepartment)) {
      const options = allDepartment.map((departments, index) => ({
        value: departments, 
        label: departments, 
        key: index,   
      }));
      setDepartmentOptions(options);
    }
  }, [allDepartment]);

  const employeeStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
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
    const payload = {
      location: selectedLocation ? selectedLocation : "",
      department_name: selectedDepartment ? selectedDepartment : "",
      employee_name: selectedEmployee ? selectedEmployee  : "",
      status: isStatus ? isStatus : ""
    };

    setCurrentPage(1);
    dispatch(getFilterEmployee(payload));
    setIsFiltered(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset state function
  const resetState = () => {
    setSelectedDepartment(null);
    setSelectedLocation(null);
    setEmployeeActive(null);
    setIsFiltered(false);
    setStatus(null);
    setSelectedEmployee(null);
    setEmployeeOptions([]);
    setCurrentPage(1);

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
    departments: false,
    locations: false,
    employees: false,
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
        handleLoadingState("departments", true);
    await dispatch(getAllLocationAction());
    handleLoadingState("departments", false);

    handleLoadingState("locations", true);
    await dispatch(getAllDepartmentAction());
    handleLoadingState("locations", false);

    handleLoadingState("employees", true);
    await dispatch(getAllEmployeeNameAction());
    handleLoadingState("employees", false);
  } catch (error) {
    handleLoadingState("departments", false);
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
      title: <span className="font-[700]">Emp Name/ID</span>,
      dataIndex: "empname",
      key: "empname",
      width: 180,
    },
    {
      title: <span className="font-[700]">Department</span>,
      dataIndex: "department",
      key: "department",
      width: 180,
    },
    {
      title: <span className="font-[700]">Temperature</span>,
      dataIndex: "temperature",
      key: "temperature",
      width: 180,
    },
    {
      title: <span className="font-[700]">Role</span>,
      dataIndex: "role",
      key: "role",
      width: 140,
    },
    {
      title: <span className="font-[700]">Campus</span>,
      dataIndex: "campus",
      key: "campus",
      width: 140,
    },
    {
      title: <span className="font-[700]">School</span>,
      dataIndex: "school",
      key: "school",
      width: 240,
    },
    {
      title: <span className="font-[700]">Location</span>,
      dataIndex: "location",
      key: "location",
      width: 300,
    },
    {
      title: <span className="font-[700]">Status</span>,
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (employeestatus) => (
        <span
          style={{
            color: employeestatus === "Active" ? "#1D6F42" : "#be123c"
          }}
        >
          {employeestatus}
        </span>
      ),
    },
  ];



  return (
    <div>
      <div className="text-center text-3xl font-bold">
        Employees Report
      </div>
      <div className="flex justify-between my-4">
        <div className="border-2 border-slate-300 p-3 w-10/12 grid grid-cols-4 gap-4 rounded-lg ">

        <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.departments ? "Loading..." : "Select department"}
              showSearch
              options={departmentOptions}
              value={selectedDepartment}
              onChange={(value) => setSelectedDepartment(value)}
              disabled={moduleLoader || loadingStates.departments}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.locations ? "Loading..." : "Select location"}
              showSearch
              dropdownStyle={{ width: '650px' }}
              options={locationOptions}
              value={selectedLocation}
              onChange={(value) => setSelectedLocation(value)}
              disabled={moduleLoader || loadingStates.locations}
            ></Select>
          </div>

          <div className="bg-white shadow-md rounded-xl flex items-center w-full">
            <div className="w-full">
              <AutoComplete
                style={{ placeholder: { fontFamily: "", color: "black" } }}
                bordered={false}
                className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
                optionFilterProp="label"
                options={employeeOptions}
                disabled={moduleLoader || loadingStates.employees}
                onSelect={(value, option) => {
                  setSelectedEmployee(value);
                  setEmployeeActive(value);
                }}
                onSearch={(value) => {
                  setEmployeeActive(value);

                  if (value) {
                    const filteredOptions = allemployeename
                      .filter((employees) => {
                        return (
                          (employees.employee_name &&
                            employees.employee_name.toLowerCase()
                              .includes(value.toLowerCase())) ||
                          (employees.email &&
                            employees.email
                              .toLowerCase()
                              .includes(value.toLowerCase())) || 
                              (employees.staff_id &&
                                employees.staff_id
                                  .toLowerCase()
                                  .includes(value.toLowerCase()))
                        );
                      })
                      .map((visitors, index) => ({
                        value: visitors.employee_name,
                        label: visitors.employee_name,
                        key: `${index}_${visitors.staff_id}`,
                      }));

                    if (filteredOptions.length === 0) {
                      setEmployeeOptions([
                        {
                          value: "no_data",
                          label: "No data",
                          disabled: true,
                        },
                      ]);
                    } else {
                      setEmployeeOptions(filteredOptions);
                    }
                  } else {
                    setEmployeeOptions([]);
                    setSelectedEmployee(null);
                  }
                }}
                placeholder={loadingStates.employees ? "Loading..." : "Search by Name, Email & ID"}
                suffixIcon={
                  employeeActive && !(moduleLoader || loadingStates.employees) ? (
                    <CloseOutlined
                      onClick={() => {
                        setEmployeeActive(null);
                        setSelectedEmployee(null);
                      }}
                      style={{
                        cursor: "pointer",
                      }}
                      className="hover:text-gray-700 transition-colors duration-200"
                    />
                  ) : (<SearchIcon />)}
                value={employeeActive || undefined}
              >
              </AutoComplete>
            </div>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select type"
              options={employeeStatusOptions}
              disabled={moduleLoader}
              value={isStatus}
              showSearch
              onChange={(value) => setStatus(value)}
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

export default EmployeesReports;
