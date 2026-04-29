import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";

const CreateEvent = () => {
  const { config } = useConfig();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});

  const initialState = {
    eventName: "",
    location: "",
    day: "",
    startTime: "",
    endTime: "",
    description: "",
    class: "",
    section: "",
    color: "#7871f1",
    cardColor: "#EEF2FF",
  };

  const [formData, setFormData] = useState(initialState);

  const classes = config.ACADEMICS.CLASSES;
  const sections = config.ACADEMICS.SECTIONS;

  const requiredFields = [
    "eventName",
    "location",
    "day",
    "startTime",
    "endTime",
    "class",
    "section",
  ];

  const validateForm = () => {
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    // time validation
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

  const submitEvent = async () => {
    setMessage("");

    if (!validateForm()) {
      setMessage("Please fill all required fields properly");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        currentClass: formData.class,
        section: formData.section,
        eventName: formData.eventName,
        location: formData.location,
        date: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        color: formData.color,
        cardColor: formData.cardColor,
        description: formData.description,
      };

      const response = await fetch("/v1/dashboard/class-events/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Event created successfully");
        setMessageType("success");

        // RESET
        setFormData(initialState);
        setErrors({});
      } else {
        setMessage(result.message || "Failed to create event");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setMessageType("error");
    }

    setLoading(false);
  };

  // AUTO HIDE MESSAGE
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
    <div className="max-w-5xl mx-auto px-3 py-3">
      <h2 className="bg-gray-200 inline-block text-black rounded-full mb-6 px-6 py-2 font-medium">
        Create Event
      </h2>

      <div className="bg-white shadow-md rounded-xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select
          label="Class"
          name="class"
          value={formData.class}
          options={classes}
          onChange={handleChange}
          showStar
          error={errors.class}
        />
        <Select
          label="Section"
          name="section"
          value={formData.section}
          options={sections}
          onChange={handleChange}
          showStar
          error={errors.section}
        />

        <Input
          label="Event Name"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          showStar
          error={errors.eventName}
        />
        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          showStar
          error={errors.location}
        />

        <Input
          type="date"
          label="Date"
          name="day"
          value={formData.day}
          onChange={handleChange}
          showStar
          error={errors.day}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="time"
            label="Start Time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            showStar
            error={errors.startTime}
          />
          <Input
            type="time"
            label="End Time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            showStar
            error={errors.endTime}
          />
        </div>

        <Input
          label="Created By"
          value={user?.employeeId || "N/A"}
          disabled
          className="bg-gray-100 text-gray-500 cursor-not-allowed"
        />

        <div className="md:col-span-2">
          <label className="block text-sm mb-2 font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
      </div>

      {/* MESSAGE + BUTTON */}
      <div className="flex flex-col p-3 items-center gap-3">
        {message && (
          <div
            className={`text-sm font-medium ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={submitEvent}
          disabled={loading}
          className={`px-10 py-3 rounded-lg text-white font-semibold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary shadow-lg"
          }`}
        >
          {loading ? "Submitting..." : "Create Event"}
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;

/* INPUT */
const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  showStar,
  disabled,
  className,
  error,
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
      className={`w-full border px-3 py-2 rounded-md ${
        error ? "border-red-500" : ""
      } ${className}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

/* SELECT */
const Select = ({ label, name, value, options, onChange, showStar, error }) => (
  <div>
    <label className="block text-sm mb-2 font-medium text-gray-700">
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
          {opt.replace("_", " ")}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

