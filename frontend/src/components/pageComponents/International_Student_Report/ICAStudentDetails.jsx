import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DownarrowIcon, PDFdownloadIcon, XLSDownloadIcon } from "../../../icons";
import { groupBy } from "lodash";
import "../Student_Details/studentdetails.scss";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getAttendanceTypeColor, getStatusColor } from "../../../utilities/colorUtils";

const ICAStudentDetails = ({ storePercentage, citizenship }) => {

  const [allRecords, setAllRecords] = useState([]);
  const [moduleCode, setModuleCode] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { icaStudentByID, icaStudentLoading } = useSelector((state) => state?.studentState);
  const dispatch = useDispatch();

  useEffect(() => {
    if (icaStudentByID && Array.isArray(icaStudentByID)) {
      const groupedByDate = groupBy(icaStudentByID, (item) =>
        new Date(item.join_time).toISOString().split("T")[0]
      );

      setAllRecords(groupedByDate);

      const moduleCodeStr = icaStudentByID
        .map((item) => item.module_id)
        .filter(Boolean)
        .join(", ");
      setModuleCode(moduleCodeStr);
    }
  }, [icaStudentByID]);

  // const title =
  //   citizenship?.citizenship === "Local"
  //     ? "Student Details"
  //     : "International Student Details";

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text('Student Details', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Student name / ID: ${icaStudentByID[0]?.student_name || "N/A"} (${storePercentage?.fin_number || "N/A"})`, 20, 30);
    doc.text(`Country: ${storePercentage?.storePercentage?.country || icaStudentByID?.[0]?.country_name || "N/A"}`, 20, 40);
    doc.text(`Percentage: ${storePercentage?.percentage}`, 20, 50);
    doc.text(`Module codes: ${[...new Set(moduleCode.split(', '))].join(' / ') || "N/A"}`, 20, 60);

    const headers = [["S.No.", "Date", "Module host key", "Attendance type", "Attendance status"]];

    const rows = [];
    let serialNo = 1;
    for (const [date, records] of Object.entries(allRecords)) {
      records.forEach(record => {
        rows.push([
          serialNo++,
          `${date}\n(${record.scheduled_module_name || "N/A"})`,
          record.context_identifier || "N/A",
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
      columnStyles: {
        0: { cellWidth: 20 },  // S.No. column width
        1: { cellWidth: 50 },  // Date column width
        2: { cellWidth: 40 },  // Module host key width
        3: { cellWidth: 40 },  // Attendance type width
        4: { cellWidth: 40 }   // Attendance status width
      },
      didParseCell: function (data) {
        if (data.column.index === 3) {
          const attendanceStatus = data.cell.raw;
          if (attendanceStatus === "Late") {
            data.cell.styles.textColor = [255, 204, 0];
          } else if (attendanceStatus === "Present") {
            data.cell.styles.textColor = [0, 128, 0];
          } else if (attendanceStatus === "Absent") {
            data.cell.styles.textColor = [255, 0, 0];
          }
        }
        if (data.column.index === 2) {
          const attendanceType = data.cell.raw;
          if (attendanceType === "Blackboard") {
            data.cell.styles.textColor = [148, 0, 211];
          } else if (attendanceType === "Gantry") {
            data.cell.styles.textColor = [0, 128, 0];
          }
        }
      }
    });

    doc.save(`ica_report_${icaStudentByID[0]?.student_id}.pdf`);
  };

  const handleDownloadXls = async () => {
    const icaStudentTableData = [];
    let serialNo = 1;
    for (const [date, records] of Object.entries(allRecords)) {
      records.forEach(record => {
        icaStudentTableData.push({
          "S.No.": serialNo++,
          Date: date,
          "Scheduled module name": record.scheduled_module_name || "N/A",
          "Module host key": record.context_identifier || "N/A",
          "Attendance type": record.attendance_type || "N/A",
          "Attendance status": record.attendance_status || "N/A"
        });
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('StudentDetails');

    worksheet.mergeCells('A1:F1');
    const headingCell = worksheet.getCell('A1');
    headingCell.value = 'Student Details';
    headingCell.font = { bold: true, size: 16 };
    headingCell.alignment = { horizontal: 'center' };

    const detailsCellValue = [
      `Student name / ID: ${icaStudentByID[0]?.student_name || "N/A"} (${storePercentage?.fin_number || "N/A"})`,
      `Country: ${storePercentage?.storePercentage?.country || icaStudentByID?.[0]?.country_name || "N/A"}`,
      `Percentage: ${storePercentage?.percentage || "N/A"}`,
      `Module codes: ${[...new Set(moduleCode.split(', '))].join(' / ') || "N/A"}`
    ].join('\n');

    worksheet.mergeCells('A2:F6');
    const detailsCell = worksheet.getCell('A2');
    detailsCell.value = detailsCellValue;
    detailsCell.alignment = { vertical: 'top', wrapText: true };
    detailsCell.border = { bottom: { style: 'thin' } };

    const headerRow = worksheet.addRow([
      'S.No.', 'Date', 'Scheduled module name', 'Module host key', 'Attendance type', 'Attendance status'
    ]);

    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '9F1239' }
      };
    });

    icaStudentTableData.forEach(item => {
      const row = worksheet.addRow([
        item["S.No."],
        item.Date,
        item["Scheduled module name"],
        item["Module host key"],
        item["Attendance type"],
        item["Attendance status"]
      ]);

      row.getCell(5).font = { color: getAttendanceTypeColor(item["Attendance type"]) };
      row.getCell(6).font = { color: getStatusColor(item["Attendance status"]) };
    });

    worksheet.columns = [
      { key: 'S.No.', width: 5 },   // Narrow column for serial number
      { key: 'Date', width: 15 },
      { key: 'Scheduled module name', width: 25 },
      { key: 'Module host key', width: 20 },
      { key: 'Attendance type', width: 15 },
      { key: 'Attendance status', width: 15 }
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `ica_report_${icaStudentByID[0]?.student_id}.xlsx`);
  };


  const renderRecords = (records) => {
    return records.map((item, idx) => {
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
          <div>{item.context_identifier || "N/A"}</div>
          <div className={`flex-1 ${attendanceTypeClass}`}>
            {item.attendance_type || "N/A"}
          </div>
          <div className={`flex-1 ${attendanceStatusClass}`}>
            {item.attendance_status || "N/A"}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="overflow-y-auto modal-overlay">
        <div className="text-center text-3xl font-bold font-sans">
          <h1>Student Details</h1>
        </div>

        <div className="flex items-start space-x-28 mt-1">
          <div className="student-card font-sans p-3 text-sm max-w-full min-w-0">
            <button
              className="font-medium text-left w-full"
            >
              <div className="flex items-center space-x-2 justify-between">
                <div className="flex flex-row items-center space-x-2">
                  {isCollapsed && (
                    <span className="text-[#BE123C]">Show details</span>
                  )}
                  {!isCollapsed && (
                    <span className="text-[#BE123C]">Hide details</span>
                  )}
                  <div className="justify-end">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200" onClick={toggleCollapse}>
                      <DownarrowIcon
                        className={`transition-transform duration-300 ${isCollapsed ? "rotate-0" : "rotate-180"}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row justify-right space-x-6">
                  <button className="btn-download flex items-center shadow-md space-x-2" onClick={handleDownloadPDF}>
                    <PDFdownloadIcon className="" />
                    <span className="text-white">PDF</span>
                  </button>
                  <div>
                    <button className="xls-download flex items-center shadow-md space-x-2" onClick={handleDownloadXls}>
                      <XLSDownloadIcon className="" />{" "}
                      <span className="text-white">XLS</span>
                    </button>
                  </div>
                </div>
              </div>
            </button>

            {!isCollapsed && (
              <>
                <div className="grid grid-cols-3 gap-4 mt-3 overflow-x-auto">
                  <div className="module-code" style={{ height: 'auto' }}>
                    <strong>Student Name/Fin number: </strong>{" "}
                    {icaStudentByID?.[0]?.student_name || "N/A"} (
                    {storePercentage?.fin_number || "N/A"})
                  </div>
                  <div className="module-code" style={{ height: 'auto', marginLeft: "100px" }}>
                    <strong>Country: </strong>{" "}
                    {storePercentage?.storePercentage?.country || icaStudentByID?.[0]?.country_name || "N/A"}
                  </div>
                  <div className="module-code" style={{ height: 'auto' }}>
                    <strong>Percentage: </strong>{" "}
                    {storePercentage?.percentage || "N/A"}
                  </div>
                </div>
                <div className="grid grid-cols-1 mt-3 overflow-x-auto">
                  <div className="module-code" style={{ height: 'auto' }}>
                    <strong>Module Codes: </strong>
                    {[...new Set(moduleCode.split(', '))].join(' / ') || "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="data-headings font-black text-sm font-sans">
          <hr className="mt-6 mb-2" />
          <div className="grid grid-cols-4">
            <div>Date</div>
            <div>Module key</div>
            <div>Attendance type</div>
            <div>Attendance status</div>
          </div>
          <hr className="mt-2" />
        </div>

        <div className="data-rows font-sans mt-4">
          {Object.entries(allRecords).length > 0 ? (
            Object.entries(allRecords)
              .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
              .map(([date, records], index) => (
                <div key={index} className="mb-6">
                  <div className="font-semibold text-sm">{date}</div>
                  <hr className="border-gray-300 my-2" />
                  <div className="font-medium text-xs">{renderRecords(records)}</div>
                </div>
              ))
          ) : (
            <div className="text-center font-medium mt-5">No data available</div>
          )}
        </div>

      </div>
    </>
  );
};

export default ICAStudentDetails;
