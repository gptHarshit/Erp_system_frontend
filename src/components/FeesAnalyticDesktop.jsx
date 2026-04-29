import React from "react";
import { useConfig } from "../context/ConfigContext";

const FeesAnalyticDesktop = ({
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
  const config = useConfig();
  const TableHeaderBackgroundColor = config?.COLOR_PALETTE?.TABLE_HEADER_BG;
  return (
    <>
      {/* FILTER BAR */}
      <div className="grid grid-cols-5 items-center gap-4 mt-3 bg-violet-300 p-3 rounded-2xl mb-3 text-sm font-semibold">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white"
        >
          {classes.map((cls) => (
            <option key={cls}>{cls}</option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white"
        >
          {Sections.map((sec) => (
            <option key={sec}>{sec}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="DELAY">Delay</option>
        </select>

        <span className="text-center text-white">Amount Paid</span>
        <span className="text-center text-white">Due Amount</span>
      </div>

      <div
        className="mb-4 p-3 rounded-xl border font-semibold"
        style={{
          backgroundColor: TableHeaderBackgroundColor || "#e5e7eb",
        }}
      >
        <div className="grid grid-cols-5 items-center text-center">
          <span>Student Name</span>
          <span>Section</span>
          <span>Status</span>
          <span>Amount Paid</span>
          <span>Due Amount</span>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
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
              <div key={i} className="bg-white p-3 rounded-xl border shadow-sm">
                <div className="grid grid-cols-5 items-center">
                  <span className="text-center">{item.studentName}</span>
                  <span className="text-center">{item.section}</span>

                  <span
                    className={`text-center px-2 py-1 rounded-full ${statusColor}`}
                  >
                    {item.status}
                  </span>

                  <span className="text-center">
                    {item.status === "PENDING" ? 0 : item.totalAmount}
                  </span>

                  <span className="text-center">
                    {item.status === "PAID" ? 0 : item.totalAmount}
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

export default FeesAnalyticDesktop;
