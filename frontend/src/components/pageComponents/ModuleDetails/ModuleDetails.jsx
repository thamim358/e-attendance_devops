import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./moduledetails.scss";
import { DownarrowIcon, PDFdownloadIcon, XLSDownloadIcon } from "../../../icons";
import { groupBy } from "lodash";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ModuleDetails = ({ storePercentage, percentageInfo }) => {
  const [tableData, setTableData] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [moduleCode, setModuleCode] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { viewModuleDetails } = useSelector((state) => state?.studentState);

  useEffect(() => {
    if (viewModuleDetails && Array.isArray(viewModuleDetails)) {
      const formattedData = viewModuleDetails.map((item, index) => ({
        key: index,
        attendanceType: item.attendance_type,
        attendancestatus: item.attendance_status,
        moduleCode: item.module_id,
        joinntime: item.join_time,
        coursename: item.course_title,
        scheduled_module_name: item.scheduled_module_name,
        student_name: item.student_name
      }));
      setTableData(formattedData);
    }
  }, [viewModuleDetails]);

  useEffect(() => {
    if (viewModuleDetails && Array.isArray(viewModuleDetails)) {
      const groupedByDate = groupBy(viewModuleDetails, (item) =>
        new Date(item.join_time).toISOString().split("T")[0]
      );

      // Flatten grouped data into a single array
      const flattenedRecords = Object.entries(groupedByDate).flatMap(([date, records]) =>
        records.map(record => ({ ...record, date }))
      );

      setAllRecords(groupedByDate);

      const moduleCodeStr = viewModuleDetails
        .map((item) => item.module_id)
        .filter(Boolean)
        .join(", ");
      setModuleCode(moduleCodeStr);
    }
  }, [viewModuleDetails]);

  // Determine the title based on the country
  // const title =
  //   studentdetails?.[0]?.citizenship === "Local"
  //     ? "Student Details"
  //     : "International Student Details";

  // Toggle the collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDownloadXls = async () => {
    const viewModuleDetails = [];
    if (Array.isArray(percentageInfo)) {
      for (const [date, records] of Object.entries(allRecords)) {
        records.forEach(record => {
          const matchingStudent = percentageInfo.find(student => student.student_id === record.student_id);
  
          viewModuleDetails.push({
            Date: date,
            "Student name": record.student_name || "N/A",
            "Student ID": record.student_id || "N/A",
            "Scheduled module name": record.scheduled_module_name || "N/A",
            "Country": record.country_name || "N/A",
            "Course name": record.course_title || "N/A",
            "Attendance type": record.attendance_type || "N/A",
            "Attendance status": record.attendance_status || "N/A",
            "Context identifier": record.context_identifier || "N/A",
            "Module code": record.module_id || "N/A",
            "Module title": record.module_title || "N/A",
            "Percentage": matchingStudent ? matchingStudent.percentage : "N/A"
          });
        });
      }
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Module Attendance Details');
  
    // Define the headers, including "S.no" at the beginning
    const headers = [
      'S.no', 
      'Student Name', 
      'Student ID', 
      'Programme', 
      'Attendance %'
    ];
  
    // Merge cells for the main heading
    worksheet.mergeCells('A1:E4'); // Adjusted for the extra "S.no" column
    const headingCell = worksheet.getCell('A1');
    headingCell.value = `STUDENT MODULE ATTENDANCE REPORT\n${viewModuleDetails?.[0]?.["Module title"] || "N/A"} (${viewModuleDetails?.[0]?.["Module code"] || "N/A"}) (${viewModuleDetails?.[0]?.["Context identifier"] || "N/A"})`;
    headingCell.font = { bold: true, size: 15 };
    headingCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  
    // Adding table headers
    const headerRow = worksheet.addRow(headers);
  
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '9F1239' }  // Dark red background
      };
    });
  
    // Adding data rows with "S.no" column
    viewModuleDetails.forEach((item, index) => {
      worksheet.addRow([
        index + 1, // S.no column
        item["Student name"],
        item["Student ID"],
        item["Course name"],
        item["Percentage"],
      ]);
    });
  
    // Auto resize columns based on content length, and make the "S.no" column smaller
    worksheet.columns.forEach((column, i) => {
      if (i === 0) {
        column.width = 5; // Small fixed width for "S.no"
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
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `module_attendance_${viewModuleDetails[0]?.["Student name"] || "unknown"}.xlsx`);
  };
  


  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const firstRecord = allRecords[Object.keys(allRecords)[0]][0];

    const moduleTitle = firstRecord?.module_title || "N/A";
    const moduleId = firstRecord?.module_id || "N/A";
    const contextIdentifier = firstRecord?.context_identifier || "N/A";

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");

    const titleText = `STUDENT MODULE ATTENDANCE REPORT\n ${moduleTitle} (${moduleId}) (${contextIdentifier})`;
    doc.text(titleText, doc.internal.pageSize.width / 2, 22, { align: 'center' });

    doc.setFontSize(11);

    const headers = [["S.No", "Student Name", "Student ID", "Programme", "Attendance %"]];
    const rows = [];

    let serialNumber = 1;

    for (const [date, records] of Object.entries(allRecords)) {

      records.forEach(record => {
        const matchingStudent = percentageInfo.find(student => student.student_id === record.student_id);
        rows.push([
          serialNumber++,
          record.student_name || "N/A",
          record.student_id || "N/A",
          record.course_title || "N/A",
          matchingStudent ? matchingStudent.percentage : "N/A"
        ]);
      });
    }

    doc.autoTable({
      startY: 40,
      head: headers,
      body: rows,
      headStyles: {
        fillColor: [159, 18, 57],
        textColor: [255, 255, 255],
      },
    });

    doc.save(`ica_report_${rows[0]?.[2] || 'unknown'}.pdf`);
  };



  return (
    <div>
      <div className="text-center text-3xl font-bold font-sans">
        <h1>Module Attendance Details</h1>
      </div>

      {/* Custom CSS card to display student name and ID */}
      <div className="">
        <div className="flex gap-4 justify-end">
          <button onClick={handleDownloadPDF} className="btn-download flex items-center shadow-md space-x-2">
            <PDFdownloadIcon className={""} />{" "}
            <span className="text-white font-sans">PDF</span>
          </button>
          <button onClick={handleDownloadXls} className="xls-download flex items-center shadow-md space-x-2">
            <XLSDownloadIcon className={""} />{" "}
            <span className="text-white font-sans">XLS</span>
          </button>
        </div>
        {/* <div className="student-card font-sans mb-2 mt-4 p-3 text-sm">
          <button
            className="font-medium text-left w-full"
          >
            <div className="flex items-center space-x-2 justify-between">
              <div className="flex flex-row items-center space-x-2 ">
                {isCollapsed && (
                  <span className="text-[#BE123C]">Show details</span>
                )}
                {!isCollapsed && (
                  <span className="text-[#BE123C]">Hide details</span>
                )}
                <div className="justify-end ">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200" onClick={toggleCollapse}>
                    <DownarrowIcon
                      className={`transition-transform duration-300 ${isCollapsed ? "rotate-0" : "rotate-180"
                        }`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-right space-x-6">
                <button onClick={handleDownloadPDF} className="btn-download flex items-center shadow-md space-x-2">
                  <PDFdownloadIcon className={""} />{" "}
                  <span className="text-white">PDF</span>
                </button>
                <button onClick={handleDownloadXls}className="xls-download flex items-center shadow-md space-x-2">
                  <XLSDownloadIcon className={""} />{" "}
                  <span className="text-white">XLS</span>
                </button>
              </div>
            </div>
          </button>

          {!isCollapsed && (
            <>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="module-code" style={{ height: 'auto' }}>
                  <strong>Student Name/ID: </strong>{" "}
                  {viewModuleDetails?.[0]?.student_name || "N/A"} (
                  {viewModuleDetails?.[0]?.student_id || "N/A"})
                </div>
                <div style={{ width: '100%', marginLeft: "50px" }}>
                  <strong>Country: </strong>{" "}
                  {viewModuleDetails?.[0]?.country_name || "N/A"}
                </div>
                <div style={{ width: '100%'}}>
                  <strong>Percentage: </strong>{" "}
                  {storePercentage?.storePercentage || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-1 mt-3 overflow-x-auto">
                <div>
                  <strong>Module Codes: </strong>
                  {[...new Set(moduleCode.split(', '))].join(' / ') || "N/A"}
                </div>
              </div>
            </>
          )}
        </div> */}
      </div>

      {/* Headings */}
      <div className="data-headings font-black mt-8 font-sans">
        <hr className="mt-8 mb-2" />
        <div className="grid grid-cols-5 gap-8">
          <div>Date</div>
          <div>Student name</div>
          <div>Course name</div>
          <div>Attendance type</div>
          <div>Attendance status</div>
        </div>
        <hr className="mt-2" />
      </div>

      {/* Data rows */}
      <div className="data-rows font-sans mt-4">
        {Object.entries(allRecords).length > 0 ? (
          Object.entries(allRecords)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, records], index) => (
              <div key={index} className="mb-6">
                <div className="font-semibold text-sm">{date}</div>
                <hr className="border-gray-300 my-2" />
                <div className="font-medium text-sm">
                  {records.map((item, idx) => {
                    let attendanceTypeClass = "";
                    let attendanceStatusClass = "";

                    let normalizedAttendanceType = item.attendance_type === "blackboard" ? "Blackboard" : item.attendance_type;

                    switch (normalizedAttendanceType) {
                      case "Gantry":
                        attendanceTypeClass = "type-gantry";
                        break;
                      case "Blackboard":
                        attendanceTypeClass = "type-blackboard";
                        break;
                      default:
                        attendanceTypeClass = "";
                    }

                    switch (item.attendance_status) {
                      case "Present":
                        attendanceStatusClass = "text-green-500";
                        break;
                      case "Late":
                        attendanceStatusClass = "text-yellow-500";
                        break;
                      case "Absent":
                        attendanceStatusClass = "text-red-500";
                        break;
                      default:
                        attendanceStatusClass = "";
                    }

                    return (
                      <div key={idx} className="font-medium text-xs justify-between items-center grid grid-cols-5 mb-4">
                        <div className="text-xs">{item.scheduled_module_name || "N/A"}</div>
                        <div className="mx-2">{item.student_name || "N/A"}</div>
                        <div>{item.course_title || "N/A"}</div>
                        <div className={`ml-10 ${attendanceTypeClass}`}>
                          {normalizedAttendanceType || "N/A"}
                        </div>
                        <div className={`flex justify-center ${attendanceStatusClass}`}>
                          {item.attendance_status || "N/A"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center mt-5">No data available</div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetails;
