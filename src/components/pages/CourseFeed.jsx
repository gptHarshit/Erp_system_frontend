import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import StudentValidator from "../common/StudentValidator";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";

const CourseFeed = () => {
  const { config } = useConfig();
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [studentData, setStudentData] = useState(null);

  const allSubjects = config.ACADEMICS.SUBJECTS_BY_COURSE;
  const { user } = useAuth();
  const instituteId = user?.instituteId;

  useEffect(() => {
    const courseId = studentData?.payload?.courseId;
    if (!courseId) return;

    setAvailableSubjects(allSubjects[courseId] || []);
    setSelectedSubjects([]);
    setSelectedValue("");
  }, [studentData]);

  const handleSubjectSelect = (subject) => {
    if (!selectedSubjects.some((s) => s.id === subject.id)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSubjectRemove = (subjectId) => {
    setSelectedSubjects(selectedSubjects.filter((s) => s.id !== subjectId));
  };

  const submitClassFeed = async () => {
    if (!studentData) {
      alert("Please validate student first.");
      return;
    }

    const formData = {
      enrollmentId: studentData.payload.enrollmentId,
      studentId: studentData.payload.studentId,
      instituteId: instituteId,
      courseId: studentData.payload.courseId,
      className: studentData.payload.currentClass,
      subjects: selectedSubjects.map((subject) => ({
        subjectId: subject.id,
        subjectName: subject.name.toUpperCase(),
      })),
    };

    setMessage("");
    setMessageType("");

    const isFormValid = Object.values(formData).every(
      (value) => value && value.toString().trim() !== ""
    );

    if (!isFormValid) {
      setMessage("Please fill out all required fields.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/dashboard/course-feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed with status ${response.status} `
        );
      }

      await response.json();
      setMessage("Class Successfully Submitted!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">

      <h2 className="text-lg  text-gray-800">Course Feed</h2>

      <StudentValidator
        isSubjectData={false}
        onStudentValidated={(data) => setStudentData(data)}
      />

      {studentData && (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-2">
          <p><strong>Student ID:</strong> {studentData.payload.studentId}</p>
          <p><strong>Enrollment ID:</strong> {studentData.payload.enrollmentId}</p>
          <p><strong>Institute ID:</strong> {studentData.payload.instituteId}</p>
          <p><strong>Name:</strong> {studentData.payload.studentName}</p>
          <p><strong>Class:</strong> {studentData.payload.currentClass}</p>
          <p><strong>Course ID:</strong> {studentData.payload.courseId}</p>
        </div>
      )}

      {studentData && (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">

          <div>
            <label className="block font-semibold mb-2">Subjects</label>



            <select
              value={selectedValue}
              onChange={(e) => {
                const subject = JSON.parse(e.target.value);
                handleSubjectSelect(subject);
              }}
              className="w-full px-4 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {availableSubjects
                .filter(
                  (subject) =>
                    !selectedSubjects.some((s) => s.id === subject.id)
                )
                .map((subject) => (
                  <option key={subject.id} value={JSON.stringify(subject)}>
                    {subject.name}
                  </option>
                ))}
            </select>

          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map((subject) => (
              <span
                key={subject.id}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {subject.name}
                <button
                  onClick={() => handleSubjectRemove(subject.id)}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={submitClassFeed}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          {message && (
            <div
              className={`text - center font - semibold ${messageType === "success"
                ? "text-green-600"
                : "text-red-600"
                } `}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseFeed;
