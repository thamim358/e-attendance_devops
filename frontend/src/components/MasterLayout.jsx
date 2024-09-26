import React, { useState, useEffect } from 'react';
import { Routes } from 'react-router-dom';
import AppRoutes from './Routes';
import TopNavbar from './groupComponents/TopNavbar';

export const MasterLayout = () => {

  return (
    <div className="h-screen overflow-y-auto bg-cover bg-center bg-no-repeat bg-gray-100"
    >
      <TopNavbar/>
      <div className="m-5">
      <div className="max-w-wrapper mx-auto px-wrapper font-sans">
        <Routes>
          {AppRoutes()}
        </Routes>
      </div>
      </div>
    </div>
  )
}
