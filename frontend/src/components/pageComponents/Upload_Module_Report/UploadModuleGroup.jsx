import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux"; 
import { uploadExcelAction } from "../../../store/actions/student.action";


const UploadModuleGroup = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); 

  const fileInputRef = useRef(null); 
  const dispatch = useDispatch();

  // const MAX_FILE_SIZE = 2 * 1024 * 1024; 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }
    // if (file.size > MAX_FILE_SIZE) {
    //   alert("File size exceeds 2 MB. Please select a smaller file.");
    //   return;
    // }
    if (loading) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    try {
      await dispatch(uploadExcelAction(formData)); 
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-28 bg-gray-100">
      <div className="text-2xl font-semibold mb-4">Module Group Assignments</div>

      <div className="bg-white justify-center shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h4 className="text-xl font-medium mb-8">
          Upload Module Group Assignments File
        </h4>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="file">
            Choose file:
          </label>
          <input
            type="file"
            id="file"
            ref={fileInputRef} 
            className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-md"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-between mb-6">
        <a
            href="/Student_module_group.xlsx"  
            download
            className="bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600"
          >
            Download Template
          </a>

          <button
            className={`bg-rose-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-rose-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={handleUpload}
            disabled={loading} 
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <p className="text-gray-600 text-sm text-center">
          <strong>Note:</strong> Please ensure that the file name has not been used previously.
        </p>
      </div>
    </div>
  );
};

export default UploadModuleGroup;
