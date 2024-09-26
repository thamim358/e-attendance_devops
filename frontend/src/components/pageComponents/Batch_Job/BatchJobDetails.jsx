import React from "react";
import { Modal, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const BatchJobDetails = ({ visible, onCancel, selectedStudentData }) => {
  return (
    <Modal
      title={<p className="font-sans font-semibold text-2xl">Batch Job Details</p>}
      visible={visible}
      className={`student-modal`}
      onCancel={onCancel}
      footer={null}
      centered={true}
      maskClosable={false}
    >
      {selectedStudentData ? (
        <div className="font-sans mt-12">
          <p><strong>Student ID:</strong> {selectedStudentData.student_id}</p>
          <p><strong>Reason:</strong> {selectedStudentData.reason}</p>
        </div>
      ) : null}
      <div className="flex justify-end mt-8">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onCancel}
        >
          <div className="font-medium ml-2">Retry</div>
        </Button>
      </div>
    </Modal>
  );
};

export default BatchJobDetails;
