import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import React, { useEffect, useState } from "react";
import GenerateReportModel from "./GenerateReportModel";
import { API_BASE_URL } from "../../api/apiClient";
function GenerateReport() {
  const configs = useConfig().config;
  const classes = configs.ACADEMICS.CLASSES;
  const AcademicSessionDropDown = configs.ACADEMICS.ACADEMICSESSIONS;
  const Sections = configs.ACADEMICS.SECTIONS;

  const { user } = useAuth();
  const InstituteId = user?.instituteId;
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [start, end] = academicSession.split("-");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  const payload = {
    institute_id: InstituteId,
    current_class: selectedClass,
    section: selectedSection,
    academic_session_start: Number(start),
    academic_session_end: Number(end),
  };

  const fetchData = async () => {
    if (!selectedClass || !selectedSection || !academicSession) {
      setMessage("Please select required fields and click Load User");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setDataLoaded(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/generic-fetch-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.success) {
        const studentList = data.payload || [];

        if (studentList.length === 0) {
          setStudents([]);
          setMessage("No students found for this selection");
          setMessageType("error");
        } else {
          setStudents(studentList);
          setMessage(data.message || "Students fetched successfully");
          setMessageType("success");
        }

        setDataLoaded(true);
      } else {
        setStudents([]);
        setMessage(data.message || "Failed to fetch students");
        setMessageType("error");
        setDataLoaded(false);
      }
    } catch (err) {
      console.log("ERROR:", err);
      setStudents([]);
      setMessage("Network error / server down");
      setMessageType("error");
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex flex-col">
      <h2 className="bg-gray-200 w-fit text-black rounded-full mb-2 px-4 py-2">
        Generate Report
      </h2>
      <div className="bg-white p-5 m-2 rounded-xl shadow border">
        <div className="grid md:grid-cols-4 gap-4 ">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">Select Section</option>
            {Sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          <select
            value={academicSession}
            onChange={(e) => setAcademicSession(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">Academic Session</option>
            {AcademicSessionDropDown.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={fetchData}
            className="bg-primary px-8 py-2 text-white rounded-full"
          >
            Load User
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mx-1 mt-1 p-2 rounded-md ${
              messageType === "success"
                ? " text-green-700  "
                : " text-red-700  "
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {!loading && !dataLoaded && (
        <div className="flex justify-center items-center mt-5 md:mt-16 text-gray-500 text-md p-5">
          Please select the required details and click Load button
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center mt-16 text-gray-400 text-sm">
          Loading...
        </div>
      )}

      {dataLoaded && (
        <div className="bg-white p-5 m-2 rounded-xl shadow border overflow-x-auto">
          {students.length === 0 ? (
            <p className="text-center">No Students Found</p>
          ) : (
            <table className="w-full border border-gray-300 border-collapse">
              <thead
                style={{
                  backgroundColor: configs?.COLOR_PALETTE?.TABLE_HEADER_BG,
                }}
              >
                <tr>
                  <th className="p-3 border text-center">Student ID</th>
                  <th className="p-3 border text-center">Student Name</th>
                  <th className="p-3 border text-center">Student Section</th>
                  <th className="p-3 border text-center">Result Status</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border text-center">
                      {student.studentId}
                    </td>

                    <td className="p-3 border text-center">
                      {student.studentName}
                    </td>

                    <td className="p-3 border text-center">
                      {student.section}
                    </td>

                    <td className="p-3 border text-center">
                      <button
                        onClick={() => {
                          setIsModelOpen(true);
                          setSelectedStudent(student);
                        }}
                        className="bg-primary text-white px-3 py-1 rounded-md text-sm"
                      >
                        Generate Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isModalOpen && (
        <GenerateReportModel
          student={selectedStudent}
          closeModal={() => setIsModelOpen(false)}
        />
      )}
    </div>
  );
}
export default GenerateReport;
