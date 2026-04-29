import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import HomeworkSubmissions from "./HomeworkSubmissions";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Homework = () => {

  const { user } = useAuth();
  const configs = useConfig()?.config;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    homeworkTitle: "",
    dateAssign: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
    currentClass: "",
    section: "",
    file: null,
  });

  const [viewhomework, setviewhomework] = useState(true);

  const classes = configs?.ACADEMICS?.CLASSES || [];
  const sections = configs?.ACADEMICS?.SECTIONS || [];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submithomework = async () => {
    setMessage("");

    if (
      !formData.currentClass ||
      !formData.section ||
      !formData.homeworkTitle ||
      !formData.file ||
      !formData.dueDate
    ) {
      setMessage("Please fill all required fields and upload a file");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      const homeworkDetails = {
        instituteId: user?.instituteId,
        currentClass: formData.currentClass,
        section: formData.section,
        homeworkTitle: formData.homeworkTitle,
        dateAssign: formData.dateAssign,
        dueDate: formData.dueDate,
        createdBy: user?.employeeId,
        description: formData.description,
      };

      data.append("homework", JSON.stringify(homeworkDetails));
      data.append("homeworkFile", formData.file);

      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/homework/add`,
        {
          method: "POST",
          body: data,
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        throw new Error("Server Error");
      }

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        setMessageType("success");

        // auto clear message after 3s
        setTimeout(() => {
          setMessage("");
        }, 3000);

        setFormData({
          homeworkTitle: "",
          dateAssign: new Date().toISOString().split("T")[0],
          dueDate: "",
          description: "",
          currentClass: "",
          section: "",
          file: null,
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(result.message || "Failed to save homework");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage(error.message || "Server connection error");
      setMessageType("error");
    }

    setLoading(false);
  };


  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="max-w-5xl mx-auto px-3 py-3">
      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        <button
          className={`px-6 py-2 rounded-full font-medium ${
            viewhomework ? "bg-gray-300" : "bg-gray-200"
          }`}
          onClick={() => setviewhomework(true)}
        >
          Create Homework
        </button>

        <button
          className={`px-6 py-2 rounded-full font-medium ${
            !viewhomework ? "bg-gray-300" : "bg-gray-200"
          }`}
          onClick={() => setviewhomework(false)}
        >
          View Submissions
        </button>
      </div>

      {viewhomework ? (
        <div>
          <div className="bg-white shadow-md rounded-xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select label="Class" name="currentClass" value={formData.currentClass} options={classes} onChange={handleChange} showStar />
            <Select label="Section" name="section" value={formData.section} options={sections} onChange={handleChange} showStar />

            <Input label="Homework Title" name="homeworkTitle" value={formData.homeworkTitle} onChange={handleChange} showStar />
            <Input type="date" label="Date Assigned" name="dateAssign" value={formData.dateAssign} onChange={handleChange} showStar />
            <Input type="date" label="Due Date" name="dueDate" value={formData.dueDate} onChange={handleChange} showStar />

            <Input label="Created By" value={user?.employeeId || "NA"} disabled className="bg-gray-100 text-gray-500" />

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <input
                type="file"
                name="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            {message && (
              <div
                className={`px-4 py-2 rounded-md text-sm ${
                  messageType === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={submithomework}
              disabled={loading}
              className={`px-10 py-3 rounded-lg text-white ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-500 "
              }`}
            >
              {loading ? "Saving..." : "Create Homework"}
            </button>
          </div>
        </div>
      ) : (
        <HomeworkSubmissions />
      )}
    </div>
  );
};

export default Homework;

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  showStar,
  disabled,
  className,
}) => (
  <div>
    <label className="block text-sm mb-2 font-medium text-gray-700">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 ${className}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({
  label,
  name,
  value,
  options,
  onChange,
  showStar,
}) => (
  <div>
    <label className="block text-sm mb-2 font-medium text-gray-700">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border px-3 py-2 rounded-md"
    >
      <option value="">-- Select --</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);