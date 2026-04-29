import React, { useState } from "react";
import AttendanceMonth from "./AttendanceMonth";
import AttendanceDaily from "./AttendanceDaily";

const Attendance = () => {
  const [viewType, setViewType] = useState("DAILY");

  return (
    <div>
      <button
        onClick={() => {
          setViewType("DAILY");
        }}
        className={`px-4 py-2 m-2 mb-5 rounded-full ${viewType === "DAILY" ? "bg-primary text-white" : "bg-gray-300"}`}
      >
        Day Wise Attendacne
      </button>
      <button
        onClick={() => {
          setViewType("MONTH");
        }}
        className={`px-4 py-2 m-2 mb-5 rounded-full ${viewType === "MONTH" ? "bg-primary text-white" : "bg-gray-300"}`}
      >
        Month Wise Attendace
      </button>
      <div>{viewType === "DAILY" ? <AttendanceDaily /> : <AttendanceMonth />}</div>
    </div>
  );
};

export default Attendance;
