import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import EnrollmentModel from "./EnrollmentModel";
import { API_BASE_URL } from "../../api/apiClient";

const EnrollmentUpdate = () => {
  const { config } = useConfig();
  const { user } = useAuth();
  const classes = config.ACADEMICS.CLASSES;
  const AcademicSessionDropDown = config.ACADEMICS.ACADEMICSESSIONS;
  const Sections = config.ACADEMICS.SECTIONS;
  const InstituteId = user?.instituteId;
  const [error, setError] = useState("");
  const [errorMessage, setErrorMeaage] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [start, end] = academicSession.split("-");
  const [dataLoaded, setDataLoaded] = useState(false);
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
      setErrorMeaage("Please fill all the field");
      return;
    }

    setError(false);
    setErrorMeaage("");
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

      if (response.ok) {
        setMessage(data.message);
        setMessageType("success");
        setStudents(data.payload ?? []);
        setDataLoaded(true);
      } else {
        setMessage(data.message || "Failed to load students");
        setMessageType("error");
        setStudents([]);
        setDataLoaded(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex flex-col ">
      <h2 className="bg-gray-200 inline-block text-black rounded-full mb-4 px-4 py-2 self-start mx-2">
       Enrollment Update
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

          {error && (
            <div className="ml-5">
              <h4 className="text-red-500">{errorMessage}</h4>
            </div>
          )}
        </div>
        {message && (
          <div
            className={`mx-2 mt-3 text-sm font-medium ${
              messageType === "success" ? "text-green-600" : "text-red-500"
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
      {loading && (
        <div className="flex justify-center items-center mt-16 text-gray-400 text-sm">
          Loading...
        </div>
      )}
      {dataLoaded && (
        <div className="bg-white p-5 m-2 rounded-xl shadow border overflow-x-auto">
          <table className="w-full border border-gray-300 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-center">Student ID</th>
                <th className="p-3 border text-center">Student Name</th>
                <th className="p-3 border text-center">Student Section</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {students?.length > 0 ? (
                students.map((student, index) => (
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
                          setSelectedStudent(student);
                          setIsModalOpen(true);
                        }}
                        className="bg-primary text-white px-3 py-1 rounded-md text-sm transition"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && (
        <EnrollmentModel
          student={selectedStudent}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default EnrollmentUpdate;
