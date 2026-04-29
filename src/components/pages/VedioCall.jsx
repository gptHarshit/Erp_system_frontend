import { useState, useEffect } from "react";
import { useConfig } from "../../context/ConfigContext";

const VedioCall = () => {
  const { config } = useConfig();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    sectionId: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const classes = config.ACADEMICS.CLASSES;
  const sections = config.ACADEMICS.SECTIONS;

  const requiredFields = [
    "title",
    "classId",
    "sectionId",
    "startTime",
    "endTime",
  ];

  const validateForm = () => {
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });
    if (
      formData.startTime &&
      formData.endTime &&
      formData.endTime <= formData.startTime
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // error clear
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    setMessage("");

    if (!validateForm()) {
      setMessage("Please fill all required fields properly");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        classId: formData.classId,
        sectionId: formData.sectionId,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      setMessage("Live class created successfully");
      setMessageType("success");

      // RESET
      setFormData({
        title: "",
        description: "",
        classId: "",
        sectionId: "",
        startTime: "",
        endTime: "",
      });

      setErrors({});
    } catch (error) {
      setMessage("Error submitting form");
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
    <div className="max-w-5xl mx-auto">
      <h2 className="bg-gray-200 inline-block px-4 py-2 rounded-full mb-4">
        Create Live Class
      </h2>

      <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          showStar
          error={errors.title}
        />

        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <Select
          label="Class"
          name="classId"
          value={formData.classId}
          options={classes}
          onChange={handleChange}
          showStar
          error={errors.classId}
        />

        <Select
          label="Section"
          name="sectionId"
          value={formData.sectionId}
          options={sections}
          onChange={handleChange}
          showStar
          error={errors.sectionId}
        />

        <Input
          type="datetime-local"
          label="Start Time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          showStar
          error={errors.startTime}
        />

        <Input
          type="datetime-local"
          label="End Time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          showStar
          error={errors.endTime}
        />
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">

        {message && (
          <div
            className={`text-sm font-medium ${
              messageType === "success"
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-md"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default VedioCall;

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  showStar,
  error,
}) => (
  <div>
    <label className="block text-sm mb-2">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded-md ${
        error ? "border-red-500" : ""
      }`}
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
  error,
}) => (
  <div>
    <label className="block text-sm mb-2">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded-md ${
        error ? "border-red-500" : ""
      }`}
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