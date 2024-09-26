import React, { useEffect, useState } from "react";
import { AutoComplete, Dropdown, Menu, Modal, Pagination, Tooltip } from "antd";
import dayjs from "dayjs";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../baseComponents/Table";
import { Select } from "antd";
import "../Module_Report/modulereport.scss";
import {
  getAllCohortAction,
  getAllCourseAction,
  getAllCourseModuleAction,
  getAllModuleAction,
  getAllStudentAction,
  getFilterModule,
  getFilterStudent,
} from "../../../store/actions/module.action";
import { SearchIcon } from "../../../icons/SearchIcon";
import { getAllStudentNameListAction, getStudentByIdAction, getStudentModuleGroupingAction } from "../../../store/actions/student.action";
import { ActionMenuIcon } from "../../../icons/ActionMenuIcon";
import StudentModuleGroupModal from "./StudentModuleGroup";
import StudentDetails from "../Student_Details/StudentDetails";
import { GroupingIcon, PDFdownloadIcon, StudentDetailsIcon, XLSDownloadIcon } from "../../../icons";
import { getAllStudentAttendanceSlice } from "../../../store/slices/module.slice";
import { studentDataListSlice } from "../../../store/slices/student.slice";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getAttendanceTypeColor } from "../../../utilities/colorUtils";

const StudentReport = () => {
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
  const [isAttendanceType, setAttendanceType] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [cohortOptions, setCohortOptions] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [storePercentage, setStorePercentage] = useState("");
  const [storeStudent, setStoreStudent] = useState("");
  const [storeStudentName, setStoreStudentName] = useState("");
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentActive, setStudentActive] = useState(null);

  const [isModuleSelected, setModuleSelected] = useState(false);
  const [moduleCode, setModuleCode] = useState(null);
  const [cohortName, setCohortName] = useState(null);
  const [courseCode, setCourseCode] = useState(null);

  const [isStudentModuleGroupModalVisible, setStudentModuleGroupModalVisible] = useState(false);

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const dispatch = useDispatch();

  const {
    allCourses,
    getallCourseModules,
    AllStudentAttendance,
    allStudents,
    moduleLoader,
    getallCohort,
  } = useSelector((state) => state?.moduleState);

  const { studentDataList } = useSelector((state) => state?.studentState);

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

  const hasActiveFilters = () => {
    return (
      courseID ||
      selectedModule ||
      selectedCohort ||
      selectedStudent ||
      isAttendanceType ||
      selectedYear ||
      selectedMonth
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
    if (allCourses && Array.isArray(allCourses)) {
      const options = allCourses.map((course, index) => ({
        value: course.course_title,
        label: course.course_title,
        course_id: course.course_id,
        key: `${course.course_id}-${index}`,
      }));
      setCourseOptions(options);
    }
  }, [allCourses]);

  useEffect(() => {
    if (getallCourseModules && Array.isArray(getallCourseModules)) {
      const options = getallCourseModules.map((module_details) => ({
        value: module_details.module_id,
        label: `${module_details.module_title} (${module_details.module_id})`,
        module_code: module_details.module_id,
      }));
      setModuleOptions(options);
    }
  }, [getallCourseModules]);

  useEffect(() => {
    if (getallCohort && Array.isArray(getallCohort)) {
      const uniqueCohorts = new Set(); // To store unique combinations
      const options = [];

      getallCohort.forEach((cohort_course_details) => {
        const { cohort_name, course_id, module_id } = cohort_course_details;
        const trimmedCourseId = course_id ? course_id.trim() : '';
        const trimmedModuleId = module_id ? module_id.trim() : '';
        const uniqueKey = `${cohort_name}-${trimmedCourseId}-${trimmedModuleId}`;
        if (cohort_name && !uniqueCohorts.has(uniqueKey)) {
          uniqueCohorts.add(uniqueKey);
          options.push({
            value: cohort_name,
            label: cohort_name,
            cohort_name: cohort_name,
          });
        }
      });
      if (options.length > 1) {
        options.unshift({ label: "All", value: "All" });
      }

      setCohortOptions(options);
    }
  }, [getallCohort]);


  useEffect(() => {
    if (AllStudentAttendance && Array.isArray(AllStudentAttendance)) {
      const formattedData = AllStudentAttendance.map((item, index) => ({
        key: index,
        enrollId: item.enrollment_id || "N/A",
        studentNameId: item.student_name && item.student_id ? `${item.student_name} (${item.student_id})` : "N/A",
        email: item.student_email || "N/A",
        enrollStatus: item.enrollment_status || "N/A",
        course: item.course_title || "N/A",
        moduleTitleId: item.module_title && item.module_id ? `${item.module_title} (${item.module_id})` : "N/A",
        attendanceType: item.attendance_type || "N/A",
        country: item.country_name || "N/A",
        cohort: item.course_cohort_name || "N/A",
        studentid: item.student_id || "N/A",
        moduleid: item.module_id || "N/A",
        percentage: item.attendance_percentage ? `${item.attendance_percentage}` : "N/A",
        citizenship: item.citizenship || "N/A",
      }));

      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [AllStudentAttendance]);

  const attendanceOptions = [
    { label: "Gantry", value: "Gantry" },
    { label: "Blackboard", value: "Blackboard" },
  ];

  const ActiveFilterSearch = () => {
    if (selectedYear && !selectedMonth) {
      return "Please select month filter to search.";
    }
    if ((selectedYear && selectedMonth && !courseID && !selectedModule && !isAttendanceType) || selectedStudent) {
      return "";
    }
    if (!courseID && !selectedModule && !isAttendanceType) {
      return "Please apply a filter to search.";
    }
    if (courseID && !selectedModule) {
      return "Please select a module filter to search.";
    }
    return "";
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = tableData ? tableData.slice(startIndex, endIndex) : [];

  const handleViewStudent = (student_id, module_id) => {
    const payload = {
      student_id: student_id || "",
      module_code: module_id || "",
    };
    dispatch(getStudentByIdAction(payload, setStudentModalOpen));
  };

  const handleOpenStudentModuleGroupModal = (student_id) => {
    const payload = {
      student_id: student_id
    }
    dispatch(getStudentModuleGroupingAction(payload, setStudentModuleGroupModalVisible));
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
      course_id: courseCode || "",
      module_id: moduleCode || "",
      student_name: selectedStudent || "",
      attendance_type: isAttendanceType || "",
      cohort_id: cohortName && cohortName !== "All" ? cohortName : "",
      month: selectedMonth || "",
      year: selectedYear || "",
    };

    setCurrentPage(1);
    dispatch(getFilterStudent(payload));
    setIsFiltered(true);
    dispatch(studentDataListSlice(null));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const initial_payload = {
    course_code: "",
    module_code: "",
    course_cohort_name: ""
  };

  useEffect(() => {
    dispatch(getAllStudentNameListAction(initial_payload))
  }, [dispatch]);

  const handleStudentAPi = (cohort_name) => {
    const student_payload = {
      course_code: courseCode || "",
      module_code: moduleCode || "",
      course_cohort_name: cohort_name || ""
    }
    dispatch(getAllStudentNameListAction(student_payload))
  }


  // Reset state function
  const resetState = () => {
    setCourseSelected(false);
    setCourseCode(false);
    setModuleCode(false);
    setModuleSelected(false);
    setModuleSelected(false);
    setStudentActive(null);
    setIsFiltered(false);
    setCourseId(false);
    setSelectedModule(null);
    setSelectedCohort(null);
    setCohortName(null);
    setCohortOptions([]);
    setAttendanceType(null);
    setSelectedStudent(null);
    setSelectedYear(null);
    setSelectedMonth(null);
    setStudentOptions([]);
    setCurrentPage(1);
    setTableData([]);
    dispatch(getAllStudentNameListAction(initial_payload))
  };

  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    modules: false,
    cohorts: false,
    students: false
  });

  const handleLoadingState = (key, value) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  const [disabledStates, setDisabledStates] = useState({
    course: false,
    module: false,
  });

  const handleDisabledState = (key, value) => {
    setDisabledStates((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        handleLoadingState("courses", true);
        await dispatch(getAllCourseAction());
        handleLoadingState("courses", false);

        handleLoadingState("students", true);
        // dispatch(getAllStudentAction());
        handleLoadingState("students", false);
      } catch (error) {
        handleLoadingState("courses", false);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch]);


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
      title: <span className="font-[700]">Enroll ID</span>,
      dataIndex: "enrollId",
      key: "enrollId",
      width: 150,
    },
    {
      title: <span className="font-[700]">Student name/ID</span>,
      dataIndex: "studentNameId",
      key: "studentNameId",
      width: 240,
    },
    {
      title: <span className="font-[700]">Email</span>,
      dataIndex: "email",
      key: "email",
      width: 300,
      render: (text) => (
        <div style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
          {text}
        </div>
      ),
    },
    {
      title: <span className="font-[700]">Enroll status</span>,
      dataIndex: "enrollStatus",
      key: "enrollStatus",
      width: 160,
    },
    {
      title: <span className="font-[700]">Course</span>,
      dataIndex: "course",
      key: "course",
      width: 220,
    },
    {
      title: <span className="font-[700]">Module title/ID</span>,
      dataIndex: "moduleTitleId",
      key: "moduleTitleId",
      width: 240,
    },
    {
      title: <span className="font-[700]">Cohort</span>,
      dataIndex: "cohort",
      key: "cohort",
      width: 120,
    },
    {
      title: <span className="font-[700]">Attendance%</span>,
      dataIndex: "percentage",
      key: "percentage",
      width: 100,
    },
    {
      title: " ",
      key: "action",
      dataIndex: "action",
      render: (text, record, index) => {
        const menuOptions = (
          <Menu
            onClick={({ key }) => {
              setStorePercentage(record?.percentage);
              setStoreStudent(record?.studentNameId);
              if (key === "viewstudent") {
                handleViewStudent(record.studentid, record.moduleid);
              } else if (key === "viewStudentmodulegroup") {
                handleOpenStudentModuleGroupModal(record.studentid);
              }
              //  else if (key === "viewstudentgroup") {
              //   setIsGroupModalOpen(true);
              // }
            }}
          >
            <Menu.Item key="viewstudent">
              <span className="flex items-center space-x-2"><StudentDetailsIcon /> <span>View student details</span></span>
            </Menu.Item>
            <Menu.Item key="viewStudentmodulegroup">
              <span className="flex items-center space-x-2"><GroupingIcon /> <span>View Student Module Group</span></span>
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    const PDFcolumns = [
      { header: 'S.No', dataKey: 'sNo' },
      { header: 'Enrollment Id', dataKey: 'enrollId' },
      { header: 'Student name', dataKey: 'studentNameId' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Enroll status', dataKey: 'enrollStatus' },
      { header: 'Course', dataKey: 'course' },
      { header: 'Module title/Id', dataKey: 'moduleTitleId' },
      { header: 'Cohort', dataKey: 'cohort' },
      { header: 'Percentage', dataKey: 'percentage' },
    ];

    doc.setFont("helvetica", "bold");
    doc.text('Student Attendance Report', doc.internal.pageSize.width / 2, 22, { align: 'center' });

    const startY = 35;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Module: ${moduleCode}`, 14, startY + 6);

    const modifiedTableData = tableData.map((row, index) => ({
      sNo: index + 1,
      ...row
    }));

    doc.autoTable({
      columns: PDFcolumns,
      body: modifiedTableData,
      headStyles: {
        fillColor: [159, 18, 57],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        studentNameId: { cellWidth: 40 },  // Increase Student name column width
        email: { cellWidth: 30 },          // Reduce Email column width
      },
      startY: 50,
      margin: { top: 30 },
      startH: 30,
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, 190, 290, null, null, 'right');
      },
      didParseCell: function (data) {
        if (data.column.index === 8) {
          const attendanceType = data.cell.raw;
          if (attendanceType === "Blackboard") {
            data.cell.styles.textColor = [148, 0, 211];
          } else if (attendanceType === "Gantry") {
            data.cell.styles.textColor = [0, 128, 0];
          }
        }
      }
    });

    doc.save('student_attendance_report.pdf');
  };

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Data');

    // Heading
    worksheet.mergeCells('A1:F1'); // Updated to F1 to account for the new S.no column
    const headingCell = worksheet.getCell('A1');
    headingCell.value = 'Student Attendance Report';
    headingCell.font = { bold: true, size: 16 };
    headingCell.alignment = { horizontal: 'center' };
    headingCell.border = { bottom: { style: 'thin' } };

    // Header row with S.no
    const headerRow = worksheet.addRow([
      'S.no',
      'Enrollment Id',
      'Student Name/Id',
      'Email',
      'Enrollment status',
      'Course',
      'Module title/Id',
      'Cohort',
      'Percentage',
      'Attendance type'
    ]);

    // Format header row
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '9F1239' }
      };
    });

    // Data rows with S.no column
    tableData.forEach((item, index) => {
      let row = worksheet.addRow([
        index + 1, // S.no
        item.enrollId,
        item.studentNameId,
        item.email,
        item.enrollStatus,
        item.course,
        item.moduleTitleId,
        item.cohort,
        item.percentage,
        item.attendanceType,
      ]);
      row.getCell(10).font = { color: getAttendanceTypeColor(item.attendanceType) }; // Adjusted to cell 9 for attendanceType
    });

    // Auto width for all columns
    worksheet.columns.forEach((column, i) => {
      if (i === 0) {
        column.width = 5; // Small fixed width for S.no column
      } else {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const length = cell.value ? cell.value.toString().length : 0;
          maxLength = Math.max(maxLength, length);
        });
        column.width = Math.min(maxLength + 2, 30);
      }
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'student_attendance_report.xlsx');
  };

  return (
    <div>
      <div className="text-center text-3xl font-bold">
        Student Attendance Report
      </div>

      <div className="flex justify-between my-4">
        <div className="border-2 border-slate-300 p-3 w-10/12 grid grid-cols-4 gap-4 rounded-lg ">
          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.courses ? "Loading..." : "Select course"}
              showSearch
              options={courseOptions}
              value={courseID || undefined}
              disabled={moduleLoader || loadingStates.courses || disabledStates.course}
              dropdownStyle={{ width: '350px' }}
              onChange={async (value, option) => {
                setCourseSelected(true);
                setCourseId(value);
                setCourseCode(option.course_id);
                setSelectedModule(null);
                setSelectedCohort(null);
                setCohortOptions([]);
                setModuleCode(null);
                setCohortOptions([]);
                const course_payload = {
                  course_id: option.course_id,
                };
                const cohort_payload = {
                  course_id: option.course_id,
                  module_id: "",
                };
                handleDisabledState("course", true);
                handleLoadingState("modules", true);
                handleDisabledState("course", true);
                handleLoadingState("cohorts", true);
                await dispatch(getAllCourseModuleAction(course_payload));
                handleLoadingState("modules", false);
                handleDisabledState("course", false);
                handleDisabledState("course", true);
                handleLoadingState("cohorts", true);
                await dispatch(getAllCohortAction(cohort_payload));
                handleLoadingState("cohorts", false);
                handleDisabledState("course", false);

              }}
            />
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.modules ? "Loading..." : "Select module"}
              showSearch
              disabled={moduleLoader || !courseID || loadingStates.modules || disabledStates.module}
              // disabled={isCourseSelected ? false : true}
              options={moduleOptions}
              value={selectedModule}
              dropdownStyle={{ width: '450px' }}
              onChange={async (value, option) => {
                setModuleSelected(true);
                setSelectedModule(value);
                setModuleCode(option.module_code);
                setSelectedCohort(null);
                setCohortOptions([]);
                const cohort_payload = {
                  course_id: courseCode,
                  module_id: option.module_code,
                };
                handleDisabledState("module", true);
                handleLoadingState("cohorts", true);
                await dispatch(getAllCohortAction(cohort_payload));
                handleLoadingState("cohorts", false);
                handleDisabledState("module", false);
              }}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.cohorts ? "Loading..." : "Select cohort"}
              showSearch
              disabled={moduleLoader || !(courseID && selectedModule) || loadingStates.cohorts}
              // disabled={isCourseSelected || isModuleSelected ? false : true}
              options={cohortOptions}
              value={selectedCohort || undefined}
              dropdownStyle={{ width: '350px' }}
              onChange={(value, option) => {
                setSelectedCohort(value);
                setCohortName(option.cohort_name);
                handleStudentAPi(option.cohort_name)
              }}
            ></Select>
          </div>

          <div className="bg-white shadow-md rounded-xl flex items-center w-full">
            <AutoComplete
              style={{ placeholder: { fontFamily: "", color: "black" } }}
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              options={studentOptions}
              disabled={moduleLoader || loadingStates.students}
              onSelect={(value) => {
                setSelectedStudent(value);
                setStudentActive(value);
              }}
              onSearch={(value) => {
                setStudentActive(value);

                if (value) {
                  const dataList = studentDataList ? studentDataList : AllStudentAttendance;
                  const filteredOptions = dataList.filter((student) => {
                    return (
                      (student.student_name && student.student_name.toLowerCase().includes(value.toLowerCase())) ||
                      (student.student_id && student.student_id.toLowerCase().includes(value.toLowerCase())) ||
                      (student.student_email && student.student_email.toLowerCase().includes(value.toLowerCase())) ||
                      (student.student_enrollment_id && student.student_enrollment_id.toLowerCase().includes(value.toLowerCase())) ||
                      (student.enrollment_id && student.enrollment_id.toLowerCase().includes(value.toLowerCase()))
                    );
                  })
                    .map((student, index) => ({
                      value: student.student_name,
                      label: `${student.student_name} (${student.student_id})`,
                      key: `${index}_${student.student_id}`,
                    }));

                  if (filteredOptions.length === 0) {
                    setStudentOptions([{ value: "no_data", label: "No data", disabled: true }]);
                  } else {
                    setStudentOptions(filteredOptions);
                  }
                } else {
                  setStudentOptions([]);
                  setSelectedStudent(null);
                }
              }}
              placeholder={loadingStates.students ? "Loading..." : "Search by Name, Email & ID"}
              suffixIcon={
                studentActive && !(moduleLoader || loadingStates.students) ? (
                  <CloseOutlined
                    onClick={() => {
                      setStudentActive(null);
                      setSelectedStudent(null);
                      setStudentOptions([]);
                    }}
                    style={{ cursor: "pointer" }}
                    className="hover:text-gray-700 transition-colors duration-200"
                  />
                ) : (
                  <SearchIcon />
                )
              }
              value={studentActive || undefined}
            />
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder="Select year"
              showSearch
              options={years}
              disabled={moduleLoader}
              value={selectedYear}
              onChange={(value, option) => {
                setSelectedYear(value);
                setYearSelected(true);
                setSelectedMonth(null);
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
              onChange={(value) => setSelectedMonth(value)}
            ></Select>
          </div>
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

        <div className="mt-10">
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
          {currentData?.length > 0 && !tableLoader ? (
            <div className="flex gap-2 mt-3">
              <button onClick={handleDownloadPDF} className="btn-download flex items-center shadow-md space-x-2">
                <PDFdownloadIcon className="" />
                <span className="text-white text-xs">PDF</span>
              </button>
              <div className="">
                <button onClick={handleDownloadExcel} className="xls-download flex items-center shadow-md space-x-2">
                  <XLSDownloadIcon className="" />
                  <span className="text-white text-xs">XLS</span>
                </button>
              </div>
            </div>
          ) : ""}
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
        <StudentDetails storePercentage={storePercentage} />
      </Modal>
      <StudentModuleGroupModal
        visible={isStudentModuleGroupModalVisible}
        onCancel={() => setStudentModuleGroupModalVisible(false)}
        storeStudent={storeStudent}
      />
    </div>
  );
};

export default StudentReport;