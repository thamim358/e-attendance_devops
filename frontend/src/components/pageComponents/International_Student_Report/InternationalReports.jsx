import React, { useEffect, useState } from "react";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";
import { AutoComplete, Dropdown, Menu, Modal, Pagination, Tooltip } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../baseComponents/Table";
import { Select } from "antd";
import "../Module_Report/modulereport.scss";
import { SearchIcon } from "../../../icons/SearchIcon";
import { getAllCountriesAction, getAllCourseBySchoolIdAction, getAllIcaStudentsList, getAllModuleByCourseIdAction, getAllSchoolAction, getFilterICAReportAction, getICAStudentDetailsbyID, getICAStudentModuleGroupingAction, getStudentByIdAction, getStudentModuleGroupingAction } from "../../../store/actions/student.action";
import { ActionMenuIcon } from "../../../icons/ActionMenuIcon";
import { useLocation } from "react-router-dom";
import ICAStudentDetails from "./ICAStudentDetails";
import ICAModuleGroupModal from "./ICAStudentModuleGroup";
import { saveAs } from 'file-saver';
import { GroupingIcon, PDFdownloadIcon, StudentDetailsIcon, XLSDownloadIcon } from "../../../icons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const InternationalReport = () => {
  const [tableData, setTableData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [tableLoader, setTableLoader] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [isCourseSelected, setCourseSelected] = useState(false);
  const [courseID, setCourseId] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [cohortOptions, setCohortOptions] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [isCohortSelected, setCohortSelected] = useState(false);
  const [storePercentage, setStorePercentage] = useState("");
  const [storeStudent, setStoreStudent] = useState("");
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentActive, setStudentActive] = useState(null);
  // student module group
  const [isICAModuleGroupModalVisible, setICAModuleGroupModalVisible] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryID, setCountryId] = useState(false);

  const [isModuleSelected, setModuleSelected] = useState(false);
  const [moduleCode, setModuleCode] = useState(null);

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [getLocation, setGetLocation] = useState("");

  const [schoolOptions, setSchoolOptions] = useState([]);
  const [schoolID, setSchoolId] = useState(false);
  const [isSchoolSelected, setSchoolSelected] = useState(false);

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (location?.pathname === "/international-report") {
      setGetLocation("International");
    } else {
      setGetLocation("");
    }
  }, [location]);

  const {
    moduleLoader,
  } = useSelector((state) => state?.moduleState);
  const { schoolDetails, courseDetails, moduleDetails, cohortDetails, countryDetails, icaSTudentNames, icaStudentTableData } = useSelector((state) => state?.studentState);

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const years = [];
  for (let i = currentYear; i >= 2016; i--) {
    years.push({ value: i, label: i.toString() });
  }

  const allMonths = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthOptions, setMonthOptions] = useState(allMonths);
  const [isYearSelected, setYearSelected] = useState(false);
  const [isMonthSelected, setMonthSelected] = useState(false);

  const hasActiveFilters = () => {
    return (
      courseID ||
      selectedModule ||
      selectedCohort ||
      selectedStudent ||
      countryID ||
      selectedYear ||
      selectedMonth ||
      schoolID
    );
  };

  useEffect(() => {
    if (selectedYear === currentYear) {
      setMonthOptions(allMonths.filter((month) => month.value <= currentMonth));
    } else {
      setMonthOptions(allMonths);
    }
  }, [selectedYear, currentYear, currentMonth]);

  useEffect(() => {
    if (countryDetails && Array.isArray(countryDetails)) {
      const options = countryDetails.map((countries) => ({
        value: countries.country_id,
        label: countries.country_name,
      }));
      setCountryOptions(options);
    }
  }, [countryDetails]);

  useEffect(() => {
    if (schoolDetails && Array.isArray(schoolDetails)) {
      const options = schoolDetails.map((schools) => ({
        value: schools.school_code,
        label: schools.school_name,
        key: `${schools.school_code} - ${schools.school_id}`,
      }));
      setSchoolOptions(options);
    }
  }, [schoolDetails]);

  useEffect(() => {
    if (courseDetails && Array.isArray(courseDetails)) {
      const options = courseDetails.map((courses) => ({
        value: courses.course_code,
        label: courses.course_title,
      }));
      setCourseOptions(options);
    }
  }, [courseDetails]);



  useEffect(() => {
    if (moduleDetails && Array.isArray(moduleDetails)) {
      const options = moduleDetails.map((module) => ({
        value: module.module_code,
        label: module.module_name,
      }));
      setModuleOptions(options);
    }
  }, [moduleDetails]);

  useEffect(() => {
    if (cohortDetails && Array.isArray(cohortDetails)) {
      const options = cohortDetails.map((cohort_result) => ({
        value: cohort_result.cohort_id,
        label: cohort_result.course_cohort_batch_name,
      }));
      // Add "All" option if more than one cohort option
      if (options.length > 1) {
        options?.unshift({ label: "All", value: "All" });
      }
      setCohortOptions(options);
    }
  }, [cohortDetails]);

  useEffect(() => {
    if (icaStudentTableData && Array.isArray(icaStudentTableData)) {
      const formattedData = icaStudentTableData.map((item, index) => {
        const percentage =
          courseID && selectedModule
            ? item.attendance_percentage
            : item.course_total_percentage;

        const getDayWithSuffix = (date) => {
          const day = moment(date).date();
          if (day > 3 && day < 21) return day + 'th'; // 11th, 12th, 13th, etc.
          switch (day % 10) {
            case 1: return day + 'st';
            case 2: return day + 'nd';
            case 3: return day + 'rd';
            default: return day + 'th';
          }
        };

        return {
          key: index,
          studentNameId: item.student_name || '',
          email: item.student_email || "N/A",
          course: item.course_code || "N/A",
          moduleTitleId: `${item.module_name} (${item.module_code})` || "N/A",
          attendanceType: item.attendance_type || "N/A",
          country: item.country_name || "N/A",
          cohort: item.course_cohort || "N/A",
          student_id: item.student_id || "N/A",
          course_name: item.course_name || "N/A",
          percentage: item.percentage ? `${item.percentage}` : "N/A",
          dateOfBirth: item.date_of_birth
            ? `${moment(item.date_of_birth).format("MMM")} ${getDayWithSuffix(item.date_of_birth)} ${moment(item.date_of_birth).format("YYYY")}`
            : "N/A",
          nationality: item.country_name || "N/A",
          fin_number: item.fin_number || "N/A",
        };
      });

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [icaStudentTableData]);

  const [loadingStates, setLoadingStates] = useState({
    school: false,
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
        handleLoadingState("school", true);
        await dispatch(getAllSchoolAction());
        handleLoadingState("school", false);
        await dispatch(getAllCountriesAction());
      } catch (error) {
        handleLoadingState("school", false);
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [dispatch]);



  const ActiveFilterSearch = () => {
    if (selectedYear && !selectedMonth) {
      return "Please select month filter to search.";
    }


    if (schoolID && (!selectedYear || !selectedMonth)) {
      return "Please select year & month to search.";
    }

    if (
      schoolID &&
      selectedYear &&
      selectedMonth &&
      !courseID &&
      !selectedModule
    ) {
      return "";
    }
    if (!courseID && !selectedModule) {
      return "Please apply a filter to search.";
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = tableData ? tableData.slice(startIndex, endIndex) : [];

  const handleViewStudent = (student_id, course_id) => {
    const payload = {
      student_id: student_id,
      course_code: course_id || "",
    };
    dispatch(getICAStudentDetailsbyID(payload, setStudentModalOpen));
  };

  // student module group
  const handleOpenModuleGroupModal = (student_id) => {
    const payload = {
      student_id: student_id
    }
    dispatch(getICAStudentModuleGroupingAction(payload, setICAModuleGroupModalVisible));
  };

  const handleSearch = () => {
    const errorMessage = ActiveFilterSearch();

    if (errorMessage) {
      setTooltipMessage(errorMessage);
      setShowTooltip(true);
      return;
    }

    setShowTooltip(false);
    const payload = {
      ...(getLocation ? { student_type: getLocation } : {}),
      ...(schoolID ? { school: schoolID } : {}),
      ...(courseID ? { course_code: courseID } : {}),
      ...(moduleCode ? { module_code: moduleCode } : {}),
      ...(selectedStudent ? { student_name: selectedStudent } : {}),
      ...(selectedCohort && selectedCohort !== "All" ? { cohort_name: selectedCohort } : {}),
      ...(countryID ? { country_name: countryID } : {}),
      ...(selectedMonth ? { month: selectedMonth } : {}),
      ...(selectedYear ? { year: selectedYear } : {})
    };

    // const payload = {
    //   "school": "PSB",
    //   "course_code": "PHD002",
    //   // // "PHD002",
    //   "module_id": "UC-11680",
    //   "cohort_name": "PHD002_2023Jul",
    //   "country_name": "Singapore",
    //   "student_name": "adrian",
    //   // "ADRIAN CHAN MENG CHAT",
    //   "year": "2023",
    //   "month": "Jul"
    // };
    setCurrentPage(1);
    dispatch(getFilterICAReportAction(payload));
    setIsFiltered(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset state function
  const resetState = () => {
    setCourseSelected(false);
    setYearSelected(false);
    setMonthSelected(false);
    setSchoolSelected(false);
    setModuleSelected(false);
    setStudentActive(null);
    setIsFiltered(false);
    setCohortSelected(false);
    setCourseId(null);
    setCountryId(null);
    setSchoolId(null)
    setSelectedModule(null);
    setSelectedCohort(null);
    setCohortOptions([]);
    setSelectedStudent(null);
    setSelectedYear(null);
    setSelectedMonth(null);
    setStudentOptions([]);
    setModuleOptions([]);
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

  useEffect(() => {
    setTableLoader(moduleLoader);
  }, [moduleLoader]);

  const columns = [
    {
      title: <span className="font-[700]">Fin number</span>,
      dataIndex: "fin_number",
      key: "fin_number",
      width: 200,

    },
    {
      title: <span className="font-[700]">Student name</span>,
      dataIndex: "studentNameId",
      key: "studentNameId",
      width: 300,

    },
    {
      title: <span className="font-[700]">Date of birth</span>,
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      width: 300,
    },
    {
      title: <span className="font-[700]">Nationality </span>,
      dataIndex: "nationality",
      key: "nationality",
      width: 200,
      render: (text) => (
        <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
          {text}
        </div>
      ),
    },
    {
      title: <span className="font-[700]">Course</span>,
      dataIndex: "course_name",
      key: "course_name",
      width: 370,
    },
    {
      title: <span className="font-[700]">Attendance%</span>,
      dataIndex: "percentage",
      key: "percentage",
      width: 300,
    },
    {
      title: " ",
      key: "action",
      dataIndex: "action",
      render: (text, record, index) => {
        const menuOptions = (
          <Menu
            onClick={({ key }) => {
              setStorePercentage(record);
              setStoreStudent(record?.studentNameId);
              if (key === "viewstudent") {
                handleViewStudent(record.student_id, record?.course);
              } else if (key === "viewmodulegroup") {
                handleOpenModuleGroupModal(record.student_id);
              }
            }}
          >
            <Menu.Item key="viewstudent">
              <span className="flex items-center space-x-2"><StudentDetailsIcon /> <span>View student details</span></span>
            </Menu.Item>
            <Menu.Item key="viewmodulegroup">
              <span className="flex items-center space-x-2"><GroupingIcon /> <span>View student module group</span></span>
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown className="actionMenu" overlay={menuOptions}>
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              <ActionMenuIcon />
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const selectedSchool = schoolOptions.find(opt => opt.value === schoolID)?.label || 'N/A';
  const selectedCourse = courseOptions.find(opt => opt.value === courseID)?.label || 'N/A';
  const selectedMonthLabel = allMonths.find(month => month.value === selectedMonth)?.label || 'N/A';

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Data');
    worksheet.mergeCells('A1:F1'); // Adjust merge for new column
    const headingCell = worksheet.getCell('A1');
    headingCell.value = 'International Student Attendance Report';
    headingCell.font = { bold: true, size: 16 };
    headingCell.alignment = { horizontal: 'center' };

    headingCell.border = {
      bottom: { style: 'thin' }
    };

    worksheet.mergeCells('A2:F5'); // Adjust merge for new column
    const detailsCell = worksheet.getCell('A2');
    detailsCell.value = `
      School: ${schoolID} (${selectedSchool})
      Month: ${selectedMonthLabel}
      Year: ${selectedYear}
    `;
    detailsCell.alignment = { vertical: 'top', wrapText: true };

    detailsCell.border = {
      bottom: { style: 'thin' }
    };

    worksheet.getRow(2).height = 40;
    worksheet.addRow([]);

    // Add "S.no" column in the header
    const headerRow = worksheet.addRow(['S.no', 'Fin number', 'Student name', 'Date of birth', 'Nationality', 'Course name', 'Percentage']);

    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '9F1239' }
      };
    });

    // Add rows with "S.no"
    tableData.forEach((item, index) => {
      worksheet.addRow([
        index + 1, // S.no column
        item.fin_number,
        item.studentNameId,
        item.dateOfBirth,
        item.nationality,
        item.course_name,
        item.percentage,
      ]);
    });

    // Set column widths and make "S.no" column smaller
    worksheet.columns.forEach((column, i) => {
      if (i === 0) {
        column.width = 5; // Smaller width for "S.no"
      } else {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const length = cell.value ? cell.value.toString().length : 0;
          maxLength = Math.max(maxLength, length);
        });
        column.width = Math.min(maxLength + 2, 30);
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'international_student_attendance_report.xlsx');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    // Add "S.no" column to the PDF table columns
    const PDFcolumns = [
      { header: 'S.no', dataKey: 's_no' },
      { header: 'Fin number', dataKey: 'fin_number' },
      { header: 'Student name', dataKey: 'studentNameId' },
      { header: 'Date of birth', dataKey: 'dateOfBirth' },
      { header: 'Nationality', dataKey: 'nationality' },
      { header: 'Course', dataKey: 'course_name' },
      { header: 'Attendance %', dataKey: 'percentage' },
    ];

    doc.setFont("helvetica", "bold");
    doc.text('International Student Attendance Report', doc.internal.pageSize.width / 2, 22, { align: 'center' });

    const startY = 35;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`School: ${schoolID} (${selectedSchool})`, 14, startY + 6);
    doc.text(`Month: ${selectedMonthLabel}`, 14, startY + 12);
    doc.text(`Year: ${selectedYear}`, 14, startY + 18);

    // Add "S.no" in table data
    const tableDataWithSerial = tableData.map((item, index) => ({
      s_no: index + 1, // Adding S.no
      fin_number: item.fin_number,
      studentNameId: item.studentNameId,
      dateOfBirth: item.dateOfBirth,
      nationality: item.nationality,
      course_name: item.course_name,
      percentage: item.percentage,
    }));

    doc.autoTable({
      columns: PDFcolumns,
      body: tableDataWithSerial,
      headStyles: {
        fillColor: [159, 18, 57],
        textColor: [255, 255, 255],
      },
      startY: 59,
      margin: { top: 30 },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, 190, 290, null, null, 'right');
      },
    });

    doc.save('international_student_attendance_report.pdf');
  };

  return (
    <div>
      <div className="text-center text-3xl font-bold">
        International Student Attendance Report
      </div>
      <div className="flex gap-4 justify-end">
        {currentData.length > 0 && !tableLoader ? (
          <button onClick={handleDownloadPDF} className="btn-download flex items-center shadow-md space-x-2">
            <PDFdownloadIcon className="" />
            <span className="text-white text-xs">PDF</span>
          </button>
        ) : (
          ""
        )}
        {currentData.length > 0 && !tableLoader ? (
          <div className="">
            <button onClick={handleDownloadExcel} className="xls-download flex items-center shadow-md space-x-2">
              <XLSDownloadIcon className="" />
              <span className="text-white text-xs">XLS</span>
            </button>
          </div>
        ) : ""} </div>


      <div className="flex justify-between my-4">
        <div className="border-2 border-slate-300 p-3 w-10/12 grid grid-cols-4 gap-4 rounded-lg ">
          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.school ? "Loading..." : "Select school"}
              options={schoolOptions}
              value={schoolID || undefined}
              disabled={moduleLoader}
              showSearch
              dropdownStyle={{ width: '350px' }}
              onChange={(value) => {
                setSchoolSelected(true);
                setSchoolId(value);
                setSelectedYear(null);
                setYearSelected(false);
                setSelectedMonth(null);
                setStudentOptions([]);
                // setStudentActive(null);
                // setCourseOptions([]);
                setCourseId(null);
                // setSelectedModule([]);
                // setSelectedModule(null);
                // setCohortOptions([]);
                // setSelectedCohort(null);
                // setCountryOptions([]);
                // setCountryId(null);
                const selectedSchool = schoolDetails.find((school) => school.school_code === value);

                if (selectedSchool) {
                  // Pass the selected school_code to the action
                  dispatch(getAllCourseBySchoolIdAction(selectedSchool.school_code));

                }
              }}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select year"
              disabled={moduleLoader || !isSchoolSelected}
              showSearch
              options={years}
              value={selectedYear}
              onChange={(value) => {
                setSelectedYear(value);
                setYearSelected(true);
                setSelectedMonth(null);
                // setMonthSelected(false);
                // setStudentOptions([]);
                // setStudentActive(null);
                // setCourseOptions([]);
                // setCourseId(null);
                // setSelectedModule([]);
                // setSelectedModule(null);
                // setCohortOptions([]);
                // setSelectedCohort(null);

              }}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select month"
              showSearch
              disabled={moduleLoader || !isYearSelected}
              options={monthOptions}
              value={selectedMonth}
              onChange={(value) => {
                setSelectedMonth(value)
                setMonthSelected(true)
              }}
            ></Select>
          </div>



          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Tooltip
              title={!isSchoolSelected || !isYearSelected || !isMonthSelected ? "Select school, year and month filter to search." : ""}
              placement="bottomLeft"
              visible={!isSchoolSelected || !isYearSelected || !isMonthSelected ? undefined : false}
            >
              <div className="w-full">

                <Select
                  bordered={false}
                  className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
                  optionFilterProp="label"
                  placeholder="Select course"
                  showSearch
                  options={courseOptions}
                  dropdownStyle={{ width: '350px' }}
                  value={courseID || undefined}
                  disabled={moduleLoader || !(isSchoolSelected && isYearSelected && isMonthSelected)}
                  // disabled={isSchoolSelected && isYearSelected && isMonthSelected ? false : true}
                  onChange={(value) => {
                    setCourseId(value);
                    setCourseSelected(true);
                    setSelectedModule([]);
                    setSelectedModule(null);
                    setCohortOptions([]);
                    setSelectedCohort(null);
                    const selectedCourse = courseDetails.find((course) => course.course_code === value);

                    if (selectedCourse) {
                      // dispatch(getAllIcaStudentsList(schoolID, selectedCourse.course_code))
                      // dispatch(getAllModuleByCourseIdAction(selectedCourse.course_code));
                    }
                  }}
                />
              </div>
            </Tooltip>
          </div>

          {/* <div className="bg-white shadow-md rounded-xl flex items-center w-full">
            <Tooltip
              title={!isSchoolSelected || !isYearSelected || !isMonthSelected ? "Select school, year and month filter to search." : ""}
              placement="bottomRight"
              visible={!isSchoolSelected || !isYearSelected || !isMonthSelected ? undefined : false}
            >
              <div className="w-full">
                <AutoComplete
                  style={{ placeholder: { fontFamily: "", color: "black" } }}
                  bordered={false}
                  className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
                  optionFilterProp="label"
                  options={studentOptions}
                  disabled={isSchoolSelected && isYearSelected && isMonthSelected ? false : true}
                  onSelect={(value, option) => {
                    setSelectedStudent(value);
                    setStudentActive(value);
                  }}
                  onSearch={(value) => {
                    setStudentActive(value);

                    if (value) {
                      const filteredOptions = icaSTudentNames
                        .filter((student) => {
                          return (
                            (student.full_name &&
                              student.full_name
                                .toLowerCase()
                                .includes(value.toLowerCase())) ||
                            (student.student_code &&
                              student.student_code
                                .toLowerCase()
                                .includes(value.toLowerCase())) ||
                            (student.email &&
                              student.email
                                .toLowerCase()
                                .includes(value.toLowerCase())) ||
                            (student.enrollment_id &&
                              student.enrollment_id.toString()
                                .toLowerCase()
                                .includes(value.toLowerCase()))
                          );
                        })
                        .map((student, index) => ({
                          value: student.full_name,
                          label: student.full_name,
                          key: `${index}_${student.student_code}`,
                        }));

                      if (filteredOptions.length === 0) {
                        setStudentOptions([
                          {
                            value: "no_data",
                            label: "No data",
                            disabled: true,
                          },
                        ]);
                      } else {
                        setStudentOptions(filteredOptions);
                      }
                    } else {
                      setStudentOptions([]);
                      setSelectedStudent(null);
                    }
                  }}
                  placeholder="Search student name"
                  suffixIcon={
                    studentActive ? (
                      <CloseOutlined
                        onClick={() => {
                          setStudentActive(null);
                          setSelectedStudent(null);
                        }}
                        style={{
                          cursor: "pointer",
                        }}
                        className="hover:text-gray-700 transition-colors duration-200"
                      />
                    ) : (
                      <SearchIcon />
                    )
                  }
                  value={studentActive || undefined}
                />
              </div>
            </Tooltip>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select module"
              showSearch
              disabled={!isCourseSelected || !moduleOptions?.length > 0}
              options={moduleOptions}
              value={selectedModule}
              onChange={(value, option) => {
                setModuleSelected(true);
                setSelectedModule(value);
                setModuleCode(option.value);
              }}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select cohort"
              showSearch
              disabled={!isCourseSelected || !cohortOptions?.length > 0}
              options={cohortOptions}
              value={selectedCohort}
              onChange={(value, e) => {
                setSelectedCohort(e?.label);
                setCohortSelected(true);
              }}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Tooltip
              title={!isSchoolSelected || !isYearSelected || !isMonthSelected ? "Select school, year and month filter to search." : ""}
              placement="topLeft"
              visible={!isSchoolSelected || !isYearSelected || !isMonthSelected ? undefined : false}
            >
              <div className="w-full">
                <Select
                  bordered={false}
                  className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
                  optionFilterProp="label"
                  placeholder="Select country"
                  options={countryOptions}
                  value={countryID || undefined}
                  disabled={isSchoolSelected && isYearSelected && isMonthSelected ? false : true}
                  showSearch
                  onChange={(e, value) => setCountryId(value?.label)}
                ></Select>
              </div>
            </Tooltip>
          </div> */}
        </div>

        <div className="flex justify-center items-center">
          {hasActiveFilters() && !tableLoader && (
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
      <Modal
        visible={studentModalOpen}
        className={`student-modal`}
        onCancel={() => setStudentModalOpen(false)}
        footer={null}
        centered={true}
        maskClosable={false}
      >
        <ICAStudentDetails
          storePercentage={storePercentage}
        />
      </Modal>
      <ICAModuleGroupModal
        visible={isICAModuleGroupModalVisible}
        onCancel={() => setICAModuleGroupModalVisible(false)}
        storeStudent={storeStudent}
      />
    </div>
  );
};
export default InternationalReport;