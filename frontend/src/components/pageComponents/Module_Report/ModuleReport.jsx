import React, { useEffect, useRef, useState } from "react";
import { AutoComplete, Dropdown, Menu, Modal, Pagination, Tooltip } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../baseComponents/Table";
import { Select } from "antd";
import "./modulereport.scss";
import {
  getAllCohortAction,
  getAllModuleAction,
  getAllStudentAction,
  getFilterModule,
} from "../../../store/actions/module.action";
import { ActionMenuIcon } from "../../../icons/ActionMenuIcon";
import { SearchIcon } from "../../../icons/SearchIcon";
import { getAllSchoolAction, getAllStudentNameListAction, getModuleByIdAction } from "../../../store/actions/student.action";
import { PDFdownloadIcon, StudentDetailsIcon, XLSDownloadIcon } from "../../../icons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ModuleDetails from "../ModuleDetails/ModuleDetails";
import { getAttendanceTypeColor } from "../../../utilities/colorUtils";
import { studentDataListSlice } from "../../../store/slices/student.slice";

const ModuleReport = () => {
  const [tableData, setTableData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [tableLoader, setTableLoader] = useState(false);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [schoolID, setSchoolId] = useState(false);
  const [isSchoolSelected, setSchoolSelected] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isAttendanceType, setAttendanceType] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [cohortOptions, setCohortOptions] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [studentActive, setStudentActive] = useState(null);

  const [isModuleSelected, setModuleSelected] = useState(false);
  const [isCohortSelected, setCohortSelected] = useState(false);
  const [moduleCode, setModuleCode] = useState(null);
  const [schoolCode, setSchoolCode] = useState(null);
  const [cohortName, setCohortName] = useState(null);

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [storePercentage, setStorePercentage] = useState("");

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [percentageInfo, setPercentageInfo] = useState([]);

  const dispatch = useDispatch();

  const {
    getallModules,
    AllModuleAttendance,
    allStudents,
    moduleLoader,
    getallCohort,
  } = useSelector((state) => state?.moduleState);

  const { schoolDetails, studentDataList } = useSelector((state) => state?.studentState);

  const hasActiveFilters = () => {
    return (
      schoolID ||
      selectedModule ||
      selectedCohort ||
      selectedStudent ||
      isAttendanceType
    );
  };

  useEffect(() => {
    if (schoolDetails && Array.isArray(schoolDetails)) {
      const options = schoolDetails.map((schools) => ({
        value: schools.school_code,
        label: schools.school_name,
        school_code: schools.school_code,
        key: `${schools.school_code} - ${schools.school_id}`,
      }));
      setSchoolOptions(options);
    }
  }, [schoolDetails]);

  useEffect(() => {
    if (getallModules && Array.isArray(getallModules)) {
      const options = getallModules.map((module_list) => ({
        value: module_list.module_id,
        label: `${module_list.module_title} (${module_list.module_id})`,
        module_code: module_list.module_id,
      }));
      setModuleOptions(options);
    }
  }, [getallModules]);


  useEffect(() => {
    if (getallCohort && Array.isArray(getallCohort)) {
      const uniqueCohorts = new Set();
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
    if (AllModuleAttendance && Array.isArray(AllModuleAttendance)) {
      const formattedData = AllModuleAttendance.map((item, index) => ({
        key: index,
        enrollId: item.enrollment_id || "N/A",
        studentNameId: item.student_name && item.student_id ? `${item.student_name} (${item.student_id})` : "N/A",
        email: item.student_email || "N/A",
        enrollStatus: item.enrollment_status || "N/A",
        courseTitle: item.course_title || "N/A",
        moduleTitleId: item.module_title && item.module_id ? `${item.module_title} (${item.module_id})` : "N/A",
        attendanceType: item.attendance_type || "N/A",
        country: item.country_name || "N/A",
        cohort: item.course_cohort_name || "N/A",
        studentid: item.student_id || "N/A",
        percentage: item.attendance_percentage ? `${item.attendance_percentage}` : "N/A",
        citizenship: item.citizenship || "N/A",
      }));

      const studentData = AllModuleAttendance.map((item) => ({
        student_id: item.student_id || "N/A",
        percentage: item.attendance_percentage ? `${item.attendance_percentage}` : "N/A",
      }));

      setPercentageInfo(studentData);
      setTableData(formattedData);
    } else {
      setTableData([]);
    }
  }, [AllModuleAttendance]);


  const attendanceOptions = [
    { label: "Gantry", value: "Gantry" },
    { label: "Blackboard", value: "Blackboard" },
  ];

  const ActiveFilterSearch = () => {
    if (!schoolID && !selectedModule && !isAttendanceType) {
      return "Please apply a filter to search.";
    }
    if (schoolID && !selectedModule && !selectedCohort) {
      return "Please select a module, cohort filter to search.";
    }
    if (schoolID && selectedModule && !selectedCohort) {
      return "Please select a cohort filter to search.";
    }
    return "";
  };


  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = tableData ? tableData.slice(startIndex, endIndex) : [];

  const abortControllerRef = useRef(new AbortController());
  // Method for Abort API 

  const handleSearch = () => {
    const errorMessage = ActiveFilterSearch();

    if (errorMessage) {
      setTooltipMessage(errorMessage);
      setShowTooltip(true);
      return;
    }

    setShowTooltip(false);
    const payload = {
      school_code: schoolCode || "",
      module_id: moduleCode || "",
      student_name: selectedStudent || "",
      attendance_type: isAttendanceType || "",
      cohort_name: cohortName && cohortName !== "All" ? cohortName : "",
    };

    setCurrentPage(1);
    setIsFiltered(true);
    dispatch(studentDataListSlice(null));
    abortControllerRef.current = new AbortController();
    dispatch(getFilterModule(payload, abortControllerRef.current.signal));
  };

  // Abort the API call when navigating to another page before the response arrives.
  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset state function
  const resetState = () => {
    setModuleSelected(false);
    setCohortSelected(false);
    setStudentActive(null);
    setIsFiltered(false);
    setSchoolId(null);
    setSchoolSelected(false);
    setSelectedModule(null);
    setSelectedCohort(null);
    setCohortName(null);
    setCohortOptions([]);
    setAttendanceType(null);
    setSelectedStudent(null);
    setStudentOptions([]);
    setCurrentPage(1);

    setTableData([]);
  };

  useEffect(() => {
    dispatch(getAllSchoolAction());
  }, [dispatch]);

  // Reset state when the component mounts
  useEffect(() => {
    resetState();
  }, []);

  const handleClear = () => {
    resetState();
  };

  const handleViewStudent = (student_id) => {
    const payload = {
      student_id: student_id,
      module_code: moduleCode || "",
      course_cohort_name: cohortName || ""
    };
    dispatch(getModuleByIdAction(payload, setStudentModalOpen));
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
      width: 300,
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
    // {
    //   title: <span className="font-[700]">Course</span>,
    //   dataIndex: "course",
    //   key: "course",
    //   width: 220,
    // },
    {
      title: <span className="font-[700]">Programme</span>,
      dataIndex: "courseTitle",
      key: "courseTitle",
      width: 300,
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
    // {
    //   title: <span className="font-[700]">Attendance type</span>,
    //   dataIndex: "attendanceType",
    //   key: "attendanceType",
    //   width: 200,
    //   render: (text) => {
    //     let className = "";
    //     switch (text) {
    //       case "Gantry":
    //         className = "attendance-gantry";
    //         break;
    //       case "Blackboard":
    //         className = "attendance-blackboard";
    //         break;
    //       default:
    //         className = "";
    //     }
    //     return <div className={className}>{text}</div>;
    //   },
    // },
    {
      title: " ",
      key: "action",
      dataIndex: "action",
      render: (text, record, index) => {
        const menuOptions = (
          <Menu
            onClick={({ key }) => {
              setStorePercentage(record?.percentage);
              if (key === "viewstudent") {
                handleViewStudent(record?.studentid);
              }
            }}
          >
            <Menu.Item key="viewstudent">
              <span className="flex items-center space-x-2"><StudentDetailsIcon /> <span>View details</span></span>
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
  const selectedSchoolLabel = schoolOptions.find(opt => opt.value === schoolCode)?.label || 'N/A';


  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    const PDFcolumns = [
      { header: 'S.No', dataKey: 'sNo' },
      { header: 'Enrollment Id', dataKey: 'enrollId' },
      { header: 'Student name', dataKey: 'studentNameId' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Enroll status', dataKey: 'enrollStatus' },
      { header: 'Programme', dataKey: 'courseTitle' },
      { header: 'Cohort', dataKey: 'cohort' },
      { header: 'Percentage', dataKey: 'percentage' },
      { header: 'Attendance type', dataKey: 'attendanceType' },
    ];

    doc.setFont("helvetica", "bold");
    doc.text('Module Attendance Report', doc.internal.pageSize.width / 2, 22, { align: 'center' });

    const startY = 35;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`School: ${schoolCode} (${selectedSchoolLabel})`, 14, startY);
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

    doc.save('Module_attendance_report.pdf');
  };

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Data');

    // Heading
    worksheet.mergeCells('A1:F1'); // Updated to F1 to account for the new S.no column
    const headingCell = worksheet.getCell('A1');
    headingCell.value = 'Module Attendance Report';
    headingCell.font = { bold: true, size: 16 };
    headingCell.alignment = { horizontal: 'center' };
    headingCell.border = { bottom: { style: 'thin' } };

    worksheet.mergeCells('A2:F5'); // Updated to F5 to account for the new S.no column
    const detailsCell = worksheet.getCell('A2');
    detailsCell.value = `
      School: ${schoolCode} (${selectedSchoolLabel})
      Module: ${moduleCode} 
    `;
    detailsCell.alignment = { vertical: 'top', wrapText: true };
    detailsCell.border = { bottom: { style: 'thin' } };
    worksheet.getRow(2).height = 20;

    // Add an empty row
    worksheet.addRow([]);

    // Header row with S.no
    const headerRow = worksheet.addRow([
      'S.no',
      'Enrollment Id',
      'Student Name/Id',
      'Email',
      'Enrollment status',
      'Programme',
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
        item.courseTitle,
        item.cohort,
        item.percentage,
        item.attendanceType,
      ]);
      row.getCell(9).font = { color: getAttendanceTypeColor(item.attendanceType) }; // Adjusted to cell 9 for attendanceType
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
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Module_attendance_report.xlsx');
  };

  const [loadingStates, setLoadingStates] = useState({
    school: false,
    modules: false,
    cohorts: false,
  });

  const handleLoadingState = (key, value) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };


  const [disabledStates, setDisabledStates] = useState({
    school: false,
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
        handleLoadingState("school", true);
        await dispatch(getAllSchoolAction());
        handleLoadingState("school", false);
      } catch (error) {
        handleLoadingState("school", false);
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [dispatch]);


  const handleStudentAPi = (cohort_name) => {
    const student_payload = {
      school_code: schoolCode,
      module_code: moduleCode,
      course_cohort_name: cohort_name
    }
    dispatch(getAllStudentNameListAction(student_payload))
  }

  return (
    <div>
      <div className="text-center text-3xl font-bold">
        Module Attendance Report
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
        ) : ""}
      </div>

      <div className="flex justify-between my-4">
        <div className="border-2 border-slate-300 p-3 w-10/12 grid grid-cols-4 gap-4 rounded-lg ">
          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.school ? "Loading..." : "Select school"}
              dropdownStyle={{ width: '350px' }}
              options={schoolOptions}
              value={schoolID || undefined}
              disabled={moduleLoader || disabledStates.school}
              showSearch
              onChange={async (value, option) => {
                setModuleOptions([])
                setSchoolSelected(true);
                setSchoolId(value);
                setSchoolCode(option.school_code);
                setSelectedModule(null);
                setSelectedCohort(null);
                setCohortOptions([]);
                setModuleCode(null);
                const school_payload = {
                  school_code: option.school_code,
                };
                handleDisabledState("school", true);
                handleLoadingState("modules", true);
                await dispatch(getAllModuleAction(school_payload));
                handleLoadingState("modules", false);
                handleDisabledState("school", false);
              }}
            ></Select>
          </div>

          <div className="ant-dropdown bg-white shadow-md rounded-xl flex items-center w-full">
            <Select
              bordered={false}
              className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
              optionFilterProp="label"
              placeholder={loadingStates.modules ? "Loading..." : "Select module"}
              showSearch
              disabled={moduleLoader || !schoolID || loadingStates.modules || disabledStates.module}
              options={moduleOptions}
              value={selectedModule}
              dropdownStyle={{ width: '450px' }}
              onChange={async (value, option) => {
                setCohortOptions([]);
                setModuleSelected(true);
                setSelectedModule(value);
                setModuleCode(option.module_code);
                setSelectedCohort(null);
                const cohort_payload = {
                  course_id: "",
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
              dropdownStyle={{ width: '350px' }}
              disabled={moduleLoader || !selectedModule || loadingStates.cohorts}
              options={cohortOptions}
              value={selectedCohort || undefined}
              onChange={(value, option) => {
                setSelectedCohort(value);
                setCohortName(option.cohort_name);
                setCohortSelected(true);
                handleStudentAPi(option.cohort_name)
              }}
            ></Select>
          </div>

          <div className="bg-white shadow-md rounded-xl flex items-center w-full">
            <Tooltip
              title={
                !isSchoolSelected || !isModuleSelected || !isCohortSelected
                  ? "Select all the filters to search student"
                  : ""
              }
              placement="topRight"
              visible={
                !isSchoolSelected || !isModuleSelected || !isCohortSelected ? undefined : false
              }
            >
              <div className="w-full">
                <AutoComplete
                  style={{ placeholder: { fontFamily: "", color: "black" } }}
                  bordered={false}
                  className="custom-placeholder border-none font-sans h-10 flex items-center focus:outline-none w-full font-medium"
                  optionFilterProp="label"
                  options={studentOptions}
                  disabled={moduleLoader || !(schoolID && selectedModule && selectedCohort)}
                  onSelect={(value, option) => {
                    setSelectedStudent(value);
                    setStudentActive(value);
                  }}
                  onSearch={(value) => {
                    setStudentActive(value);

                    if (value) {
                      const dataList = studentDataList ? studentDataList : AllModuleAttendance;
                      const filteredOptions = dataList.filter((student) => {
                        return (
                          (student.student_name &&
                            student.student_name.toLowerCase().includes(value.toLowerCase())) ||
                          (student.student_id &&
                            student.student_id.toLowerCase().includes(value.toLowerCase())) ||
                          (student.student_email &&
                            student.student_email.toLowerCase().includes(value.toLowerCase())) ||
                          (student.enrollment_id &&
                            student.enrollment_id.toLowerCase().includes(value.toLowerCase()))
                        );
                      }).map((student, index) => ({
                        value: student.student_name,
                        label: `${student.student_name} (${student.student_id})`,
                        key: `${index}_${student.student_id}`,
                      }));

                      if (filteredOptions.length === 0) {
                        setStudentOptions([
                          {
                            value: 'no_data',
                            label: 'No data',
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
                  placeholder="Search by Name, Email & ID"
                  suffixIcon={
                    studentActive && !moduleLoader ? (
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
                Enter
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
        <ModuleDetails storePercentage={storePercentage} percentageInfo={percentageInfo} />
      </Modal>
    </div>
  );
};

export default ModuleReport;
