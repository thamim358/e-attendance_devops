import React, { useEffect } from "react";
import { Modal, Table } from "antd";
import { useSelector } from "react-redux";

const StudentModuleGroupModal = ({ visible, onCancel, storeStudent }) => {

  const { StudentModuleByID } = useSelector((state) => state?.studentState);

  return (
    <Modal
      title={<p className="font-sans font-semibold text-2xl"> Student Module Groups </p>}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      centered={true}
      width={800}
      maskClosable={false}
    >
      <div className="font-sans mt-12">
        <div> <p className="font-sans text-base"><strong >Student Name: </strong>{storeStudent}</p></div>
        <div className="grid grid-cols-5 gap-20 font-semibold border-b pb-2 mb-2 mt-4">
          <div>Module Key</div>
          <div>Lec</div>
          <div>Lab</div>
          <div>Tut</div>
          <div>WS</div>
        </div>

        {/* Table content section */}
        <div className="grid gap-2">
          {StudentModuleByID.length === 0 ? (
            <div className="text-center text-gray-500">No data</div>
          ) : (
            StudentModuleByID.map((module, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-20 items-center border-b py-2"
              >
                <div style={{ width: '140%', marginRight: "30px" }}>{module.Module_Schedule || "N/A"}</div>
                <div style={{ width: '50%' }}>{module.Lec || "N/A"}</div>
                <div style={{ width: '50%' }}>{module.Lab || "N/A"}</div>
                <div style={{ width: '50%' }}>{module.Tut || "N/A"}</div>
                <div style={{ width: '50%' }}>{module.WS || "N/A"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StudentModuleGroupModal;
