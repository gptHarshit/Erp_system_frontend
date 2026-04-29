import React from "react";

const AttendanceMonthDesktop = ({
  studentList,
  attendance,
  holidays,
  selectMonth,
}) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-auto mt-3">
      <div className="m-1 px-3 flex gap-4 flex-wrap">
        <Legend />
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Student Name</th>
            <th className="p-3">Student ID</th>
            <th className="p-3">Monthly Calendar</th>
            <th className="p-3">Present/Total</th>
          </tr>
        </thead>

        <tbody>
          {studentList.map((student) => {
            const studentAtt = attendance[student.studentId];
            const totalDays = studentAtt
              ? Object.keys(studentAtt.days).length
              : 0;

            return (
              <tr key={student.studentId} className="border-t">
                <td className="p-3">{student.studentName}</td>
                <td className="p-3 text-center">{student.studentId}</td>

                <td className="p-3">
                  <CalendarGrid
                    studentAtt={studentAtt}
                    holidays={holidays}
                    selectMonth={selectMonth}
                  />
                </td>

                <td className="p-3 text-center">
                  {studentAtt?.presentCount || 0}/{totalDays}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceMonthDesktop;

/* reusable components */
const CalendarGrid = ({ studentAtt, holidays, selectMonth }) => (
  <div className="grid grid-cols-7 gap-1">
    {studentAtt &&
      Object.entries(studentAtt.days).map(([day, isPresent]) => {
        const dayNum = parseInt(day);

        const holiday = holidays.find(
          (h) => h.day === dayNum && h.month === selectMonth
        );

        let bg = "";
        if (holiday) bg = "bg-yellow-200";
        else if (isPresent === null) bg = "bg-gray-200";
        else if (isPresent) bg = "bg-green-200";
        else bg = "bg-red-200";

        return (
          <div key={day} className={`w-7 h-7 text-xs flex items-center justify-center rounded ${bg}`}>
            {day}
          </div>
        );
      })}
  </div>
);

const Legend = () => (
  <>
    <Item color="bg-green-300" text="Present" />
    <Item color="bg-red-300" text="Absent" />
    <Item color="bg-yellow-300" text="Holiday" />
    <Item color="bg-gray-300" text="Not Marked" />
  </>
);

const Item = ({ color, text }) => (
  <div className="flex gap-2 items-center">
    <div className={`h-4 w-6 ${color} rounded-xl`}></div>
    <span>{text}</span>
  </div>
);