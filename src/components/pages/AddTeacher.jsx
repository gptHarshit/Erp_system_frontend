import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AddTeacher = () => {
  const { user } = useAuth();
  const instituteId = user?.instituteId || "";
  const projectId = user?.projectId || "";
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [employeePhoto, setEmployeePhoto] = useState(null);

  const initialFormData = {
    employeeId: "",
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    employeeType: "",
    employmentType: "",
    joiningDate: "",
    endingDate: "",
    gender: "",
    dob: "",
    salary: "",
    loginAccessEnabled: false,
  };
  const employeeTypes = ["TEACHER", "PEON", "CLERK", "DIRECTOR", "ADMIN"];
  const employmentTypes = ["REGULAR", "PART_TIME", "CONTRACT"];
  const [formData, setFormData] = useState(initialFormData);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = "Only alphabets allowed";
    }

    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (Number(formData.salary) <= 0) {
      newErrors.salary = "Salary must be greater than 0";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!employeePhoto) {
      newErrors.employeePhoto = "Photo is required";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number";
    }

    requiredFields.forEach((field) => {
      if (!formData[field] && !newErrors[field]) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const requiredFields = [
    "employeeId",
    "firstName",
    "email",
    "phoneNumber",
    "employeeType",
    "employmentType",
    "gender",
    "dob",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const submitEnrollment = async () => {
    setMessage("");
    setMessageType("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const employeeEnrollment = {
        employeeId: formData.employeeId,
        instituteId,
        projectId,
        employeeCode: formData.employeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        employeeType: formData.employeeType,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        endingDate: formData.endingDate || null,
        gender: formData.gender,
        dob: formData.dob,
        salary: Number(formData.salary),
        loginAccessEnabled: formData.loginAccessEnabled,
      };

      const formDataPayload = new FormData();

      formDataPayload.append(
        "employeeEnrollment",
        JSON.stringify(employeeEnrollment),
      );

      if (employeePhoto) {
        formDataPayload.append("employeePhoto", employeePhoto);
      }

      const response = await fetch("/v1/dashboard/enroll-employee", {
        method: "POST",
        credentials: "include",
        body: formDataPayload,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setMessageType("success");
        setFormData(initialFormData);
        setEmployeePhoto(null);
      } else {
        setMessage(result.message || "Failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error submitting form");
      setMessageType("error");
    }

    setLoading(false);
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
    <div className="max-w-6xl mx-auto">
      <h2 className="bg-gray-200 inline-block text-black rounded-full mb-4 px-4 py-2">
        Employee Enrollment
      </h2>

      <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Employee ID"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          showStar
          error={errors.employeeId}
        />
        <Input
          label="Employee Code"
          name="employeeCode"
          value={formData.employeeCode}
          onChange={handleChange}
        />
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          showStar
          error={errors.firstName}
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
        <Input
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          showStar
          error={errors.email}
        />

        <Input
          type="tel"
          label="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          showStar
          error={errors.phoneNumber}
        />

        <div>
          <Select
            label="Employment Type"
            name="employmentType"
            value={formData.employmentType}
            options={employmentTypes}
            onChange={handleChange}
            showStar
          />
          {errors.employmentType && (
            <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>
          )}
        </div>
        <div>
          <Select
            label="Employee Type"
            name="employeeType"
            value={formData.employeeType}
            options={employeeTypes}
            onChange={handleChange}
            showStar
          />
          {errors.employeeType && (
            <p className="text-red-500 text-xs mt-1">{errors.employeeType}</p>
          )}
        </div>

        <Input
          type="date"
          label="Joining Date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
        />
        <Input
          type="date"
          label="Ending Date"
          name="endingDate"
          value={formData.endingDate}
          onChange={handleChange}
        />

        <div>
          <label>
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <Radio
              name="gender"
              value="MALE"
              checked={formData.gender === "MALE"}
              onChange={handleChange}
              label="Male"
            />
            <Radio
              name="gender"
              value="FEMALE"
              checked={formData.gender === "FEMALE"}
              onChange={handleChange}
              label="Female"
            />
          </div>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>

        <Input
          type="date"
          label="Date of Birth"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          showStar
          error={errors.dob}
        />
        <Input
          type="number"
          label="Salary"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          showStar
          error={errors.salary}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="loginAccessEnabled"
              checked={formData.loginAccessEnabled}
              onChange={handleChange}
            />
            <label>Login Access Enabled</label>
          </div>

          <p className="text-xs text-gray-500 ml-6">
            This will make credentials for the employee to access admin portal
          </p>
        </div>

        <div className="max-w-md">
          <label className="block mb-2">
            Photo: <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center gap-2 w-full">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEmployeePhoto(e.target.files[0])}
              className="flex-1 min-w-0 border rounded-md px-3 py-2 bg-white h-[42px]"
            />

            {employeePhoto && (
              <img
                src={URL.createObjectURL(employeePhoto)}
                alt="preview"
                className="h-[42px] w-[42px] object-cover rounded-full border shrink-0"
              />
            )}
          </div>

          {errors.employeePhoto && (
            <p className="text-red-500 text-xs mt-1">{errors.employeePhoto}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {message && (
          <div
            className={`mt-4 ${messageType === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={submitEnrollment}
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-md"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;

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
      maxLength={name === "phoneNumber" ? 10 : undefined}
      className={`w-full border px-3 py-2 rounded-md ${error ? "border-red-500" : ""}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, name, value, options, onChange, showStar }) => (
  <div>
    <label className="block text-sm mb-2">
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
  </div>
);

const Radio = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center gap-2">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    {label}
  </label>
);
