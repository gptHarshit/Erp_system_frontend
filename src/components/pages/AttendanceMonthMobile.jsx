import React from "react";

const AttendanceMonthMobile = ({
  studentList,
  attendance,
  holidays,
  selectMonth,
}) => {
  return (
    <div className="mt-3 space-y-4">
      <Legend />

      {studentList.map((student) => {
        const studentAtt = attendance[student.studentId];
        const totalDays = studentAtt
          ? Object.keys(studentAtt.days).length
          : 0;

        return (
          <div
            key={student.studentId}
            className="bg-white p-4 rounded-xl shadow border"
          >
            <div className="font-semibold text-lg">
              {student.studentName}
            </div>

            <div className="text-sm text-gray-500 mb-2">
              ID: {student.studentId}
            </div>

            {/* SCROLLABLE CALENDAR */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 min-w-[280px]">
                {studentAtt &&
                  Object.entries(studentAtt.days).map(
                    ([day, isPresent]) => {
                      const dayNum = parseInt(day);

                      const holiday = holidays.find(
                        (h) =>
                          h.day === dayNum &&
                          h.month === selectMonth
                      );

                      let bg = "";
                      if (holiday) bg = "bg-yellow-200";
                      else if (isPresent === null)
                        bg = "bg-gray-200";
                      else if (isPresent)
                        bg = "bg-green-200";
                      else bg = "bg-red-200";

                      return (
                        <div
                          key={day}
                          className={`w-8 h-8 text-xs flex items-center justify-center rounded ${bg}`}
                        >
                          {day}
                        </div>
                      );
                    }
                  )}
              </div>
            </div>

            <div className="mt-2 text-sm font-medium text-center">
              {studentAtt?.presentCount || 0}/{totalDays}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceMonthMobile;

const Legend = () => (
  <div className="flex flex-wrap gap-3 text-sm">
    <Item color="bg-green-300" text="Present" />
    <Item color="bg-red-300" text="Absent" />
    <Item color="bg-yellow-300" text="Holiday" />
    <Item color="bg-gray-300" text="Not Marked" />
  </div>
);

const Item = ({ color, text }) => (
  <div className="flex gap-2 items-center">
    <div className={`h-4 w-5 ${color} rounded`}></div>
    <span>{text}</span>
  </div>
);
