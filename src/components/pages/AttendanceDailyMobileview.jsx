import React from "react";

const AttendanceMobile = ({
  students,
  attendance,
  section,
  handleAttendance,
  saveAttendance,
  saveMessage,
  saveMessageType,
}) => {
  return (
    <div className="mt-4 space-y-3">
      {students.map((s) => (
        <div key={s.uuid} className="bg-white p-5 rounded-xl shadow-lg border border-gray-300  ">
          <div className="flex justify-between items-center p-1" >
            <div className="text-sm text-gray-500">ID: {s.studentId}</div>

            <div className="text-sm text-gray-600 mb-2">Section: {section}</div>
          </div>

          <div className="font-semibold text-lg mb-2"> <span className="text-gray-500" >Name :</span> {s.studentName}</div>

          <div className="flex p-1 ">
            <button
              onClick={() => handleAttendance(s.studentId, false)}
              className={`flex-1 py-2 text-lg rounded-l-full ${
                attendance[s.studentId] === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Absent
            </button>

            <button
              onClick={() => handleAttendance(s.studentId, true)}
              className={`flex-1 py-2 text-lg rounded-r-full ${
                attendance[s.studentId] === true
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Present
            </button>
          </div>
        </div>
      ))}

      {saveMessage && (
        <div
          className={`text-center text-sm ${
            saveMessageType === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {saveMessage}
        </div>
      )}

      <button
        onClick={saveAttendance}
        className="w-full bg-primary py-3 text-white rounded-xl"
      >
        Save Attendance
      </button>
    </div>
  );
};

export default AttendanceMobile;
