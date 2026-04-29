import React from "react";
import { useConfig } from "../../context/ConfigContext";

const AttendanceDesktop = ({
  students,
  attendance,
  section,
  handleAttendance,
  saveAttendance,
  saveMessage,
  saveMessageType,
}) => {
  const { config } = useConfig();
  return (
    <div className="bg-white mt-4 p-3 rounded-xl shadow border">
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead
            style={{ backgroundColor: config?.COLOR_PALETTE?.TABLE_HEADER_BG }}
          >
            <tr className=" text-black">
              <th className="px-3 py-2 border">Std ID</th>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Section</th>
              <th className="px-3 py-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.uuid} className="text-center hover:bg-gray-50">
                <td className="border px-2 py-2">{s.studentId}</td>
                <td className="border px-2 py-2">{s.studentName}</td>
                <td className="border px-2 py-2">{section}</td>

                <td className="border px-2 py-2">
                  <div className="inline-flex border rounded-full overflow-hidden">
                    <button
                      onClick={() => handleAttendance(s.studentId, false)}
                      className={`px-4 py-1 text-sm ${
                        attendance[s.studentId] === false
                          ? "bg-red-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Absent
                    </button>

                    <button
                      onClick={() => handleAttendance(s.studentId, true)}
                      className={`px-4 py-1 text-sm ${
                        attendance[s.studentId] === true
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Present
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saveMessage && (
        <div
          className={`text-center mt-2 text-sm ${
            saveMessageType === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {saveMessage}
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={saveAttendance}
          className="bg-primary px-6 py-2 text-white rounded-full"
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
};

export default AttendanceDesktop;
