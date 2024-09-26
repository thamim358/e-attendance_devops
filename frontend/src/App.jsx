import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MasterLayout } from "./components/MasterLayout";
import { ToastContainer } from 'react-toastify';
import './styles/app.scss'
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/*" element={<MasterLayout />} />
        </Routes>
        <ToastContainer />
      </Router>
    </div>
  );
};

export default App;