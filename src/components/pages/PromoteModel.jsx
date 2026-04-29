import React, { useEffect, useState } from "react";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";

export default function PromoteModal({ student, closeModal }) {
  const { config } = useConfig();
  const classes = config.ACADEMICS.CLASSES;
  const AcademicSessionDropDown = config.ACADEMICS.ACADEMICSESSIONS;
  const sections = config.ACADEMICS.SECTIONS;
  const allSubjects = config.ACADEMICS.SUBJECTS_BY_COURSE;

  const [status, setStatus] = useState("");

  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [targetCourse, setTargetCourse] = useState("");
  const [targetSession, setTargetSession] = useState("");

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleCourseChange = (courseId) => {
    setTargetCourse(courseId);
    setAvailableSubjects(allSubjects[courseId] || []);
    setSelectedSubjects([]);
  };

  const handleSubjectList = (value) => {
    if (!value) return;

    const subject = JSON.parse(value);

    setSelectedSubjects([...selectedSubjects, subject]);
    setSelectedValue("");
  };

  const handleSubjectRemove = (id) => {
    const updated = selectedSubjects.filter((s) => s.id !== id);
    setSelectedSubjects(updated);
  };

  const handleSubmit = async () => {
    let start = null;
    let end = null;

    if (targetSession) {
      [start, end] = targetSession.split("-");
    }

    const payload = {
      studentId: student.studentId,
      enrollmentId: student.enrollmentId,
      instituteId: student.instituteId,
      uuid: student.uuid,
      currentSessionStart: student.academicSessionStart,
      currentSessionEnd: student.academicSessionEnd,
      targetCourseId: targetCourse || null,
      targetSection: targetSection || null,
      targetClass: targetClass || null,
      targetEnrollmentStatus: status,

      targetSessionStart: start ? Number(start) : null,
      targetSessionEnd: end ? Number(end) : null,

      subjects: selectedSubjects.map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
      })),
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/promote-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
     // console.log("Promotion response : ", data);
      if (response.ok) {
        setMessage(data.message);
        setMessageType("success");
      } else {
        setMessage(data.message || "Promotion failed");
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto  p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Initiate Promotion Journey
        </h2>

        <h3 className="font-semibold mb-3">Basic Details</h3>

        <div className="grid grid-cols-2 gap-2 text-sm mb-6">
          <p>Name : {student.studentName}</p>
          {student.enrollmentId && (
            <p>Enrollment Id : {student.enrollmentId}</p>
          )}
          {student.studentId && <p>Student Id : {student.studentId}</p>}

          <p>Class : {student.currentClass}</p>
          <p>Section : {student.section}</p>
          <p>
            Session : {student.academicSessionStart}-
            {student.academicSessionEnd}
          </p>
          <p>Course : {student.courseId}</p>
        </div>

        <h3 className="font-semibold mb-2">Promotion</h3>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border w-full p-2 mb-3"
        >
          <option value="">Select Status</option>

          <option value="COURSE_COMPLETED">COURSE_COMPLETED</option>
          <option value="PASSED">PASSED</option>
          <option value="DROPPED">DROPPED</option>
          <option value="FAILED">FAILED</option>
        </select>

        {(status === "PASSED" || status === "FAILED") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Academic Session
              </label>

              <select
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Academic Session</option>

                {AcademicSessionDropDown.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Class
              </label>

              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Class</option>

                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Section
              </label>

              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Section</option>

                {sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Course
              </label>

              <select
                value={targetCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Course</option>

                <option value="SC_M_001">SC_M_001</option>
                <option value="SC_B_002">SC_B_002</option>
                <option value="ART_003">ART_003</option>
                <option value="COM_004">COM_004</option>
              </select>
            </div>

            {targetCourse && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>

                <select
                  value={selectedValue}
                  onChange={(e) => handleSubjectList(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mb-3"
                >
                  <option value="">Select Subject</option>

                  {availableSubjects
                    .filter(
                      (subject) =>
                        !selectedSubjects.some((s) => s.id === subject.id),
                    )
                    .map((subject) => (
                      <option key={subject.id} value={JSON.stringify(subject)}>
                        {subject.name}
                      </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
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
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col ">
          <div className=" flex justify-center items-center">
            {message && (
              <div
                className={`${messageType === "success" ? "text-green-600" : "text-red-500"}`}
              >
                {message}
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-4 mt-6 ">
            <button
              onClick={closeModal}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Close
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
