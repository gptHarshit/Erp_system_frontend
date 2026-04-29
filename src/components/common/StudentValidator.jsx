import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const StudentValidator = ({ isSubjectData, onStudentValidated }) => {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const { user } = useAuth();
  const instituteId = user?.instituteId;

  const handleStudentLoadDetails = async () => {
    const formData = {
      instituteId: instituteId,
      studentId: selectedStudentId,
      enrollmentId: selectedEnrollmentId,
    };

    setMessage("");
    setMessageType("");

    const isFormValid = Object.values(formData).every(
      (value) => value && value.toString().trim() !== "",
    );

    if (!isFormValid) {
      setMessage("Please fill out all required fields before submitting.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/v1/dashboard/fetch-student/${isSubjectData}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed with status ${response.status}`,
        );
      }

      const studentResponse = await response.json();

      setMessage("Student fetch successful!");
      setMessageType("success");
      onStudentValidated(studentResponse);
    } catch (error) {
      setMessage(
        error.message.includes("Failed to fetch")
          ? "Network error: Unable to reach the server."
          : error.message,
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Student ID */}
        <div className="flex-1">
          <label className="block text-sm mb-2">Student ID</label>
          <input
            type="text"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-4 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Enrollment ID */}
        <div className="flex-1">
          <label className="block text-sm  mb-2">Enrollment ID</label>
          <input
            type="text"
            value={selectedEnrollmentId}
            onChange={(e) => setSelectedEnrollmentId(e.target.value)}
            className="w-full px-4 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Button */}
        <div className="lg:w-auto w-full">
          <button
            onClick={handleStudentLoadDetails}
            disabled={loading}
            className="w-full lg:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold transition"
          >
            {loading ? "Loading..." : "Fetch Student Details"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`text-center font-semibold mt-4 ${
            messageType === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default StudentValidator;
