import React, { useState } from "react";

const StudentInsights = () => {
  const [studentId, setStudentId] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!studentId || !enrollmentId) {
      setError("Please enter both Student ID and Enrollment ID.");
      return;
    }

    window.location.href = "https://www.google.com/";
  };

  return (
    <div className="p-4 md:p-6">

      {/* Page Title */}
      <p className=" text-lg  mb-3">
        Student Insights
      </p>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">

        <h2 className="text-lg md:text-xl font-semibold mb-6">
          Login to Student Insight Portal
        </h2>

        <form onSubmit={handleLogin}>

          {/* Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Enrollment ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Enrollment ID
              </label>
              <input
                type="text"
                value={enrollmentId}
                onChange={(e) => setEnrollmentId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mt-4">
              {error}
            </p>
          )}

          {/* Button Centered */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-20 py-3 rounded-full text-lg font-medium hover:opacity-90 transition"
            >
              Login
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default StudentInsights;