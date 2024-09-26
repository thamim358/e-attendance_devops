// src/components/routes.jsx
import React from 'react';
import { Route, Navigate } from "react-router-dom";
import StudentReport from './pageComponents/Student_Report/StudentReport';
import VisitorReports from './pageComponents/Visitors_Report/VisitorsReports';
import EmployeesReports from './pageComponents/Employee_Report/EmployeesReport';
import UploadModuleGroup from './pageComponents/Upload_Module_Report/UploadModuleGroup';
import InternationalReport from "./pageComponents/International_Student_Report/InternationalReports"
import ModuleReport from './pageComponents/Module_Report/ModuleReport';
import BatchJob from './pageComponents/Batch_Job/BatchJob';

const AppRoutes = () => {
    const pages = [
        {
          path: "/module-report",
          Component: ModuleReport,
        },
        {
          path: "/student-report",
          Component: StudentReport,
        },
        {
          path: "/international-report",
          Component: InternationalReport,
        },
        {
          path: "/visitors-report",
          Component: VisitorReports,
        },
        // {
        //   path: `/module-delivery-report`,
        //   Component: ModuleDeliveryReport,
        // },
        {
          path: `/employee-report`,
          Component: EmployeesReports,
        },
        {
          path: `/batch-job`,
          Component: BatchJob,
        },
        {
          path: `/module-group`,
          Component: UploadModuleGroup,
        },
      ];
    
    return (
        <>
          <Route path="/" element={<Navigate to="/module-report" />} />

          {pages.map((route, index) => {
            const { path, Component } = route;
            return <Route key={index} path={path} element={<Component />} />;
          })}
        </>
    );
};

export default AppRoutes;
