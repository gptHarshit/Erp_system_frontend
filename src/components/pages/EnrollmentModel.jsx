import React, { useEffect, useState } from "react";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";
import EnrollmentUpdateForm from "./EnrollmentUpdateForm";
export default function EnrollmentModel({ student, closeModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
 <div className="bg-white w-[400px] sm:w-[500px] md:w-[700px] h-[465px] overflow-y-auto p-6 rounded-lg">
        <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-4">
          Update Student
        </h2>
         <button
              onClick={closeModal}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Close
            </button>
            </div>
   <EnrollmentUpdateForm student={student}/>
        <div className="flex flex-col ">
          <div className="flex justify-center items-center gap-4 mt-6 ">
           
          </div>
        </div>
      </div>
    </div>
  );
}
