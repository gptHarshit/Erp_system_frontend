import React from "react";

const FeesAnalyticMobile = ({
  classes,
  Sections,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  selectedStatus,
  setSelectedStatus,
  studentList,
  statusStyles,
}) => {
  return (
    <>
      {/* FILTER BAR */}
      <div className="bg-violet-300 p-3 rounded-2xl space-y-2">
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2 py-1 rounded bg-white"
          >
            {classes.map((cls) => (
              <option key={cls}>{cls}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-2 py-1 rounded bg-white"
          >
            {Sections.map((sec) => (
              <option key={sec}>{sec}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1 rounded bg-white"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="DELAY">Delay</option>
          </select>
        </div>
      </div>

      {/* CARDS */}
      <div className="space-y-3 mt-3">
        {studentList.length === 0 ? (
          <div className="text-center py-6 text-gray-500 font-medium">
            {selectedStatus
              ? `No students with status ${selectedStatus}`
              : "No students found"}
          </div>
        ) : (
          studentList.map((item, i) => {
            const statusColor = statusStyles[item.status];

            return (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-md space-y-2"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {item.studentName || "N/A"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColor}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Section: {item.section}
                </div>

                <div className="flex justify-between text-sm">
                  <span>
                    Paid: {item.status === "PENDING" ? 0 : item.totalAmount}
                  </span>

                  <span>
                    Due: {item.status === "PAID" ? 0 : item.totalAmount}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default FeesAnalyticMobile;
