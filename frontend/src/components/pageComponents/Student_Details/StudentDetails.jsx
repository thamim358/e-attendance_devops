import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./studentdetails.scss";
import { DownarrowIcon, PDFdownloadIcon, XLSDownloadIcon } from "../../../icons";
import { groupBy } from "lodash";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getAttendanceTypeColor, getStatusColor } from "../../../utilities/colorUtils";

const StudentDetails = (storePercentage) => {
  const [tableData, setTableData] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [moduleCode, setModuleCode] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { studentdetails } = useSelector((state) => state?.studentState);


  useEffect(() => {
    if (studentdetails && Array.isArray(studentdetails)) {
      const formattedData = studentdetails.map((item, index) => ({
        key: index,
        attendanceType: item.attendance_type,
        attendancestatus: item.attendance_status,
        moduleCode: item.module_id,
        joinntime: item.join_time,
        coursename: item.course_title,
        scheduled_module_name: item.scheduled_module_name,
      }));
      setTableData(formattedData);
    }
  }, [studentdetails]);

  useEffect(() => {
    if (studentdetails && Array.isArray(studentdetails)) {
      const groupedByDate = groupBy(studentdetails, (item) =>
        new Date(item.join_time).toISOString().split("T")[0]
      );

      // Flatten grouped data into a single array
      const flattenedRecords = Object.entries(groupedByDate).flatMap(([date, records]) =>
        records.map(record => ({ ...record, date }))
      );

      setAllRecords(groupedByDate);

      const moduleCodeStr = studentdetails
        .map((item) => item.module_id)
        .filter(Boolean)
        .join(", ");
      setModuleCode(moduleCodeStr);
    }
  }, [studentdetails]);

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
    const StudentDetails = [];

    for (const [date, records] of Object.entries(allRecords)) {
      records.forEach(record => {
        StudentDetails.push({
          Date: date,
          "Student name": record.student_name || "N/A",
          "Scheduled module name": record.scheduled_module_name || "N/A",
          "Course name": record.course_title || "N/A",
          "Attendance type": record.attendance_type || "N/A",
          "Attendance status": record.attendance_status || "N/A"
        });
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Details');

    worksheet.mergeCells('A1:E1');
    const headingCell = worksheet.getCell('A1');
    headingCell.value = 'Student Details';
    headingCell.font = { bold: true, size: 16 };
    headingCell.alignment = { horizontal: 'center' };

    const detailsCellValue = [
      `Student name / ID: ${studentdetails[0]?.student_name || "N/A"} (${studentdetails[0]?.student_id || "N/A"})`,
      `Country: ${storePercentage?.storePercentage?.country || studentdetails?.[0]?.country_name || "N/A"}`,
      `Percentage: ${storePercentage?.storePercentage || "N/A"}`,
      `Module codes: ${[...new Set(moduleCode.split(', '))].join(' / ') || "N/A"}`
    ].join('\n');

    worksheet.mergeCells('A2:E6');
    const detailsCell = worksheet.getCell('A2');
    detailsCell.value = detailsCellValue;
    detailsCell.alignment = { vertical: 'top', wrapText: true };
    detailsCell.border = {
      bottom: { style: 'thin' }
    };

    const headerRow = worksheet.addRow([
      'Date',
      'Scheduled module name',
      'Course name',
      'Attendance type',
      'Attendance status'
    ]);


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


    StudentDetails.forEach(item => {
      const row = worksheet.addRow([
        item.Date,
        item["Scheduled module name"],
        item["Course name"],
        item["Attendance type"],
        item["Attendance status"]
      ]);

      row.getCell(4).font = { color: getAttendanceTypeColor(item["Attendance type"]) };
      row.getCell(5).font = { color: getStatusColor(item["Attendance status"]) };
    });


    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, length);
      });
      column.width = Math.min(maxLength + 2, 30);
    });


    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `student_report_${studentdetails[0]?.student_id}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('Student Details', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Student name / ID: ${studentdetails?.[0]?.student_name || "N/A"} (${studentdetails?.[0]?.student_id || "N/A"})`, 20, 30);
    doc.text(`Country: ${storePercentage?.storePercentage?.country || studentdetails?.[0]?.country_name || "N/A"}`, 20, 40);
    doc.text(`Percentage: ${storePercentage?.storePercentage || "N/A"}`, 20, 50);
    doc.text(`Module codes: ${[...new Set(moduleCode.split(', '))].join(' / ') || "N/A"}`, 20, 60);

    doc.text('', 20, 70);
    const headers = [["Date", "Course name", "Attendance type", "Attendance status"]];

    const rows = [];
    for (const [date, records] of Object.entries(allRecords)) {
      records.forEach(record => {
        rows.push([
          `${date}\n(${record.scheduled_module_name || "N/A"})`,
          record.course_title,
          record.attendance_type || "N/A",
          record.attendance_status || "N/A"
        ]);
      });
    }
    doc.autoTable({
      startY: 65,
      head: headers,
      body: rows,
      headStyles: {
        fillColor: [159, 18, 57],
        textColor: [255, 255, 255],
      },

      didParseCell: function (data) {
        if (data.column.index === 3) {
          const attendanceStatus = data.cell.raw.trim();
          if (attendanceStatus === "Late") {
            data.cell.styles.textColor = [255, 204, 0];
          } else if (attendanceStatus === "Present") {
            data.cell.styles.textColor = [0, 128, 0];
          } else if (attendanceStatus === "Absent") {
            data.cell.styles.textColor = [255, 0, 0];
          }
        }
        if (data.column.index === 2) {
          const attendanceType = data.cell.raw.trim();
          if (attendanceType === "Blackboard") {
            data.cell.styles.textColor = [148, 0, 211];
          } else if (attendanceType === "Gantry") {
            data.cell.styles.textColor = [0, 128, 0];
          }
        }
      }
    });

    doc.save(`student_report_${studentdetails[0]?.student_id}.pdf`);
  };

  return (
    <div>
      <div className="text-center text-3xl font-bold font-sans">
        <h1>Student Details</h1>
      </div>

      {/* Custom CSS card to display student name and ID */}
      <div className="flex flex-wrap items-center justify-between space-x-4 space-y-2">
        <div className="student-card font-sans mb-2 mt-4 p-3 text-sm">
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
                <button onClick={handleDownloadXls} className="xls-download flex items-center shadow-md space-x-2">
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
                  {studentdetails?.[0]?.student_name || "N/A"} (
                  {studentdetails?.[0]?.student_id || "N/A"})
                </div>
                <div style={{ width: '100%', marginLeft: "50px" }}>
                  <strong>Country: </strong>{" "}
                  {studentdetails?.[0]?.country_name || "N/A"}
                </div>
                <div style={{ width: '100%' }}>
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
        </div>
      </div>

      {/* Headings */}
      <div className="data-headings font-black text-base mt-8 font-sans">
        <hr className="mt-8 mb-2" />
        <div className="grid grid-cols-4">
          <div>Date</div>
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
                {/* Display Date */}
                <div className="font-semibold text-sm">{date}</div>

                {/* Horizontal Line */}
                <hr className="border-gray-300 my-2" />
                <div className="font-medium text-xs">
                  {records.map((item, idx) => {
                    let attendanceTypeClass = "";
                    let attendanceStatusClass = "";

                    switch (item.attendance_type) {
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
                      <div key={idx} className="justify-between items-center grid grid-cols-4 mb-4">
                        <div>{item.scheduled_module_name || "N/A"}</div>
                        <div>{item.course_title || "N/A"}</div>
                        <div className={`mx-5 ${attendanceTypeClass}`}>
                          {item.attendance_type || "N/A"}
                        </div>
                        <div className={`flex-1 ${attendanceStatusClass}`}>
                          {item.attendance_status || "N/A"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center font-medium mt-5">No data available</div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
