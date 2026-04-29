import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ResultFeedModal from "./ResultFeedModal";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";

const ResultFeed = () => {
  const { config } = useConfig();
  const { user } = useAuth();

  const classes = config.ACADEMICS.CLASSES;
  const AcademicSessionDropDown = config.ACADEMICS.ACADEMICSESSIONS;
  const Sections = config.ACADEMICS.SECTIONS;
  const InstituteId = user?.instituteId;
  const TableHeaderBackgroundColor = config?.COLOR_PALETTE?.TABLE_HEADER_BG;

  const [error, setError] = useState("");
  const [errorMessage, setErrorMeaage] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [start, end] = academicSession.split("-");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const payload = {
    institute_id: InstituteId,
    current_class: selectedClass,
    section: selectedSection,
    academic_session_start: Number(start),
    academic_session_end: Number(end),
  };

  const fetchData = async () => {
    if (!selectedClass || !selectedSection || !academicSession) {
      setError(true);
      setErrorMeaage("Please fill all the fields");
      return;
    }

    setMessage("");
    setError(false);
    setErrorMeaage("");
    setLoading(true);
    setDataLoaded(true);

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
      console.log("Data : ", data);
      if (data.success) {
        setStudents(data.payload || []);
        setMessage(data.message);
        setMessageType("success");
      } else {
        setStudents([]);
        setMessage(data.message || "No data found");
        setMessageType("error");
        setDataLoaded(false);
      }
      // console.log("Result Feed response: ", data);
    } catch (err) {
      console.log("ERROR:", err);
      console.log("Failed to fetch students");
      setStudents([]);
      setError(true);
      setMessage("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message || error || errorMessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
        setError(false);
        setErrorMeaage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, errorMessage]);

  return (
    <div className="flex flex-col">
      <h2 className="bg-gray-200 text-black rounded-full mb-2 px-4 py-2 w-fit">
        Result Feed
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
        {message && (
          <div
            className={`m-1 mt-3 ${messageType === "success" ? "text-green-500" : "text-red-500"}`}
          >
            {message}
          </div>
        )}
        {error && (
          <div className="ml-3 mt-3">
            <h4 className="text-red-500">{errorMessage}</h4>
          </div>
        )}
      </div>

      {!loading && !dataLoaded && (
        <div className="flex justify-center items-center mt-5 md:mt-16 text-gray-500 text-md p-5">
          Please select the required details and click Load button
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center mt-16 text-gray-400 text-sm">
          Loading...
        </div>
      )}

      {dataLoaded && (
        <div className="bg-white p-5 m-2 rounded-xl shadow border overflow-x-auto">
          <table className="w-full border border-gray-300 border-collapse">
            <thead style={{ backgroundColor: TableHeaderBackgroundColor }}>
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

                  <td className="p-3 border text-center">{student.section}</td>

                  <td className="p-3 border text-center">
                    <button
                      onClick={() => {
                        setIsModelOpen(true);
                        setSelectedStudent(student);
                      }}
                      className="bg-primary text-white px-3 py-1 rounded-md text-sm"
                    >
                      Result Feed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && (
        <ResultFeedModal
          student={selectedStudent}
          closeModal={() => setIsModelOpen(false)}
        />
      )}
    </div>
  );
};

export default ResultFeed;
