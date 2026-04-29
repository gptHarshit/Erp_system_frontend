import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";

const Home = () => {
  const { user } = useAuth();
  const instituteId = user?.instituteId || "";
  const { config } = useConfig();

  if (!config) return "Loading...";

  const max_class = config?.TOP_SCORER_CRITERIA.DEFAULT.MAX_CLASS;
  const current_session = config?.TOP_SCORER_CRITERIA.DEFAULT.CURRENT_SESSION;
  const exam_type = config?.TOP_SCORER_CRITERIA.DEFAULT.EXAM_TYPE;

  const classes = config?.ACADEMICS.CLASSES;
  const AcademicSessionDropDown = config?.ACADEMICS.ACADEMICSESSIONS;
  const examTypeDrop = config?.TOP_SCORER_CRITERIA.DROP_DOWN_EXAM_TYPE;

  const [selectedClass, setSelectedClass] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [examType, setExamType] = useState("");

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const fetchData = async () => {
    if (!selectedClass || !academicSession || !examType) {
      setErrorMessage("Please fill all the details");
      return;
    }

    setErrorMessage("");
    setMessage("");
    setLoading(true);
    setDataLoaded(true);

    const [start, end] = academicSession.split("-");

    try {
      const payload = {
        instituteId: instituteId,
        currentclass: selectedClass,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
        examType: examType,
      };

      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/top-score-student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.success) {
        setStudents(data.payload || []);
        setMessage(data.message || "Data fetched successfully");
        setMessageType("success");

        if (!data.payload || data.payload.length === 0) {
          setMessage("No Student Available for this Selection");
          setMessageType("error");
        }
      } else {
        setStudents([]);
        setMessage(data.message || "Something went wrong");
        setMessageType("error");
        setDataLoaded(false);
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
      setMessage("Failed to fetch student data");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAcademicSession(current_session);
    setExamType(exam_type);
    setSelectedClass(max_class);
  }, []);

  useEffect(() => {
    if (selectedClass && academicSession && examType) {
      fetchData();
    }
  }, [selectedClass, academicSession, examType]);

  useEffect(() => {
    if (message || errorMessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
        setErrorMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, errorMessage]);

  function getStudentBadge(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  }

  function getStudentColor(index) {
    if (index === 0) return "bg-blue-100";
    if (index === 1) return "bg-red-200";
    if (index === 2) return "bg-orange-200";
    return "bg-gray-100";
  }
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border rounded-md px-4 py-2"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={academicSession}
            onChange={(e) => setAcademicSession(e.target.value)}
            className="w-full border rounded-md px-4 py-2"
          >
            <option value="">Academic Session</option>
            {AcademicSessionDropDown.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full border rounded-md px-4 py-2"
          >
            <option value="">Select Exam Type</option>
            {examTypeDrop.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          <button
            onClick={fetchData}
            className="bg-primary px-6 py-2 text-white rounded-full"
          >
            Load User
          </button>
        </div>
        {message && (
          <div
            className={`text-center text-sm mt-2 ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
        {errorMessage && (
          <div className="text-red-500 text-center text-sm">{errorMessage}</div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex justify-between bg-primary text-white px-4 py-2 rounded-md">
          <span>All student performance</span>
          <span>{selectedClass}</span>
        </div>

        {!loading && !dataLoaded && (
          <div className="text-center text-gray-500 py-6">
            Please select filters and click Load
          </div>
        )}

        {loading && (
          <div className="text-center py-6 text-gray-400">
            Loading student data...
          </div>
        )}
        {!loading && dataLoaded && students.length > 0 && (
          <div className="space-y-2">
            {students.map((student, index) => (
              <div
                key={index}
                className={
                  "flex justify-between items-center px-4 py-2 rounded-md border"
                }
              >
                <span className="flex gap-2">
                  {student.studentName} {getStudentBadge(index)}
                </span>
                <span>{student.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
