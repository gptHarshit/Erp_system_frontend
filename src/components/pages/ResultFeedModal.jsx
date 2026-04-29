import React, { use, useEffect, useState } from "react";
import { API_BASE_URL } from "../../api/apiClient";
import { useConfig } from "../../context/ConfigContext";

const ResultFeedModal = ({ student, closeModal }) => {
  const { config } = useConfig();
  const [examType, setExamType] = useState("");
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const examTypes = config.ACADEMICS.EXAM_TYPES;

  const formative = config.EXAM_TYPE_SCORE.FORMATIVE;
  const summative = config.EXAM_TYPE_SCORE.SUMMATIVE;

  const getMaxMarks = () => {
    if (!examType) return 0;
    if (examType.startsWith("FORMATIVE")) return formative;
    if (examType.startsWith("SUMMATIVE")) return summative;
    return 0;
  };

  const handleMarksChange = (subjectId, value) => {
    setMarks((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  const fetchSubjectList = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/fetch-subjects/${student.subjectFeedId}`,
        {
          method: "GET", 
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", 
        }
      );
  
      if (!response.ok) throw new Error();
  
      const data = await response.json();
      setSubjects(data.payload || []);
    } catch (err) {
      setError("Failed to load subjects");
    }
  };


  const handleSubmit = async () => {
    setError("");
    if (!examType) {
      setError("Select exam type first");
      return;
    }

    const maxMarks = getMaxMarks();

    for (let subject of subjects) {
      const value = Number(marks[subject.subjectId] || 0);
      if (value > maxMarks) {
        setError(`${subject.subjectName} > ${maxMarks} not allowed`);
        return;
      }
    }

    const marksDetails = subjects.map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      subjectMarks: Number(marks[subject.subjectId] || 0),
    }));

    const payload = {
      uuid: student.uuid,
      enrollmentId: student.enrollmentId,
      studentId: student.studentId,
      courseId: student.courseId,
      instituteId: student.instituteId,
      examType,
      currentClass: student.currentClass,
      academicSessionStart: student.academicSessionStart,
      academicSessionEnd: student.academicSessionEnd,
      marksDetails,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/v1/dashboard/result-feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message || "Result saved successfully");
        setMessageType("success");
      } else {
        setMessage(data.message || "Failed to save result");
        setMessageType("error");
      }
      // console.log("Result Feed response: ", data);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectList();
  }, [student]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-[600px] max-h-[65vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-50">
          <h2 className="text-xl font-semibold">Feed Student Result</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* STUDENT INFO */}
          <div className="bg-gray-100 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <p>
              <span className="font-medium">Name:</span> {student.studentName}
            </p>
            <p>
              <span className="font-medium">Class:</span> {student.currentClass}
            </p>
            <p>
              <span className="font-medium">Student ID:</span>{" "}
              {student.studentId}
            </p>
            <p>
              <span className="font-medium">Section:</span> {student.section}
            </p>
            <p className="col-span-2">
              <span className="font-medium">Session:</span>{" "}
              {student.academicSessionStart}-{student.academicSessionEnd}
            </p>
          </div>

          {/* EXAM TYPE */}
          <div>
            <label className="block mb-2 text-sm font-medium">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Exam Type</option>
              {examTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* SUBJECTS */}
          {examType && (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject.subjectId}
                  className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg"
                >
                  <p className="font-medium">{subject.subjectName}</p>

                  <input
                    type="number"
                    placeholder={`Max ${getMaxMarks()}`}
                    className="w-32 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                    onChange={(e) =>
                      handleMarksChange(subject.subjectId, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col justify-center items-center">
            <div>
              {/* ALERTS */}
              {error && (
                <div className=" text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div
                  className={`px-2 py-2 rounded-lg text-sm ${messageType === "success" ? " text-green-600" : " text-red-600"}`}
                >
                  {message}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 py-2">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-blue-400 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Result"}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
      </div>
    </div>
  );
};

export default ResultFeedModal;
