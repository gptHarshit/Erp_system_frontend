import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import configs from "../../config/1000.json";
import { API_BASE_URL } from "../../api/apiClient";

export default function AdminEventTrigger() {
  const { user } = useAuth();
  const instituteId = user?.instituteId;

  const classes = configs.ACADEMICS.CLASSES;
  const courses = configs.ACADEMICS.COURSES;
  const emailTypes = configs.ACADEMICS.EMAIL_TYPES;

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedEmailType, setSelectedEmailType] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");

  const [eligibleUser, setEligibleUser] = useState([]);

  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getPhaseOptions = (type) => {
    if (type === "STD_WELCOME") return [1];
    if (type === "STD_SUMMATIVE") return [1, 2];
    if (type === "STD_FORMATIVE") return [1, 2, 3, 4];
    if (type === "STD_ATTENDANCE")
      return Array.from({ length: 12 }, (_, i) => i + 1);
    return [];
  };

  const handleFetch = async () => {
    if (
      !selectedClass ||
      !selectedCourse ||
      !selectedEmailType ||
      !selectedPhase
    ) {
      setError(true);
      setErrorMessage("Please fill all the fields");
      return;
    }

    setError(false);
    setErrorMessage("");
    setMessage("");
    setLoading(true);
    setDataLoaded(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/fetched-user-notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            selectedClass,
            selectedCourse,
            selectedEmailType,
            instituteId,
            phase: selectedPhase,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setEligibleUser(data.payload || []);
        setMessage(data.message || "Users fetched");
        setMessageType("success");

        if (!data.payload || data.payload.length === 0) {
          setMessage("No users found");
          setMessageType("error");
        }
      } else {
        setEligibleUser([]);
        setMessage(data.message || "Failed to fetch users");
        setMessageType("error");
        setDataLoaded(false);
      }
    } catch (err) {
      console.log(err);
      setEligibleUser([]);
      setError(true);
      setErrorMessage("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (index) => {
    setRowLoading(index);

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/trigger-user-notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...eligibleUser[index],
            phase: selectedPhase,
            instituteId,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setEligibleUser((prev) => {
          const updated = [...prev];
          updated[index].emailSent = true;
          return updated;
        });

        setMessage("Email sent successfully");
        setMessageType("success");
      } else {
        setMessage("Email failed");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Error sending email");
      setMessageType("error");
    } finally {
      setRowLoading(null);
    }
  };

  useEffect(() => {
    if (message || error || errorMessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
        setError(false);
        setErrorMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error, errorMessage]);

  return (
    <div className="flex flex-col">
      <h2 className="bg-gray-200 rounded-full px-4 py-2 w-fit mb-2">
        Admin Event Trigger
      </h2>

      {/* FILTER */}
      <div className="bg-white p-5 m-2 rounded-xl shadow border">
        <div className="grid md:grid-cols-5 gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedEmailType}
            onChange={(e) => {
              setSelectedEmailType(e.target.value);
              setSelectedPhase("");
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Email Type</option>
            {emailTypes.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>

          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(Number(e.target.value))}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Phase</option>
            {getPhaseOptions(selectedEmailType).map((p) => (
              <option key={p} value={p}>
                Phase {p}
              </option>
            ))}
          </select>

          <button
            onClick={handleFetch}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Load Users
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-3 ${messageType === "success" ? "text-green-500" : "text-red-500"}`}
          >
            {message}
          </div>
        )}

        {error && <div className="text-red-500 mt-3">{errorMessage}</div>}
      </div>

      {/* EMPTY STATE */}
      {!loading && !dataLoaded && (
        <div className="flex justify-center items-center mt-10 text-gray-500">
          Please select the required details and click Load button
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center mt-10 text-gray-400">
          Loading...
        </div>
      )}

      {/* TABLE */}
      {dataLoaded && !loading && eligibleUser.length > 0 && (
        <div className="bg-white p-5 m-2 rounded-xl shadow border">
          <table className="w-full border">
            <thead
              style={{ backgroundColor: configs.COLOR_PALETTE.TABLE_HEADER_BG }}
            >
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {eligibleUser.map((u, i) => (
                <tr key={i} className="text-center">
                  <td className="border p-2">{u.studentId}</td>
                  <td className="border p-2">{u.studentName}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">
                    {u.emailSent ? (
                      <span className="text-green-500">Sent</span>
                    ) : (
                      <button
                        onClick={() => sendEmail(i)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        {rowLoading === i ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Send"
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
