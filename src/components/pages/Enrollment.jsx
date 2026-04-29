import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";

const Enrollment = () => {
  const { config } = useConfig();
  const { user } = useAuth();
  const instituteId = user?.instituteId || "";
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isOpenAdditinalFeedOpen, setIsOpenAdditinalFeedOpen] = useState(false);
  const [isOpenCourseFeed, setIsOpenCourseFeed] = useState(true);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [studentFatherPhoto, setStudentFatherPhoto] = useState(null);
  const [studentMotherPhoto, setStudentMotherPhoto] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    gender: "",
    dateOfBirth: "",
    studentEmail: "",
    parentEmail: "",
    enrollmentId: "",
    academicSession: "",
    enrollmentStatus: "",
    enrollmentDate: "",
    courseId: "",
    currentClass: "",
    section: "",
    mailingAddress: "",
    aadhaarNumber: "",
    category: "",
    religion: "",
    nationality: "",
    currentAddress: "",
    city: "",
    state: "",
    pinCode: "",
    bloodGroup: "",
    emergencyContactNumber: "",
    guardianName: "",
    guardianRelationship: "",
    guardianMobile: "",
    transportRequired: false,
    routeName: "",
    pickupPoint: "",
    dropPoint: "",
    studentContactNumber: "",
  });

  const classes = config.ACADEMICS.CLASSES;
  const sections = config.ACADEMICS.SECTIONS;
  const categories = config.STUDENT_META.CATEGORIES;
  const religions = config.STUDENT_META.RELIGIONS;
  const classCourseMap = config?.ACADEMICS?.CLASS_COURSE_MAP || {};
  const allSubjects = config?.ACADEMICS?.SUBJECTS_BY_COURSE || {};
  const AcademicSessionDropDown = config.ACADEMICS.ACADEMICSESSIONS;
  const statuses = config.STUDENT_META.STATUSES;
  const streams = config?.ACADEMICS?.STREAMS || [];
  const courseNames = config?.ACADEMICS?.COURSE_NAMES || {};
  const bloodGroups = config?.STUDENT_META?.BLOOD_GROUPS || [];

  const getCourseDisplayName = (courseId) => {
    return courseNames[courseId] || courseId;
  };

  const getCourseOptions = (className) => {
    if (className === "CLASS_11" || className === "CLASS_12") {
      return streams.map((s) => ({
        id: s.courseId,
        name: s.courseId,
        value: s.courseId,
      }));
    }
    const courseId = classCourseMap[className];
    return courseId ? [{ id: courseId, name: courseId, value: courseId }] : [];
  };

  const requiredFields = [
    "studentId",
    "studentName",
    "fatherName",
    "motherName",
    "gender",
    "dateOfBirth",
    "studentEmail",
    "parentEmail",
    "enrollmentId",
    "enrollmentDate",
    "courseId",
    "currentClass",
    "section",
    "mailingAddress",
    "studentContactNumber",
  ];

  const validateForm = () => {
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (
      formData.studentEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.studentEmail)
    ) {
      newErrors.studentEmail = "Invalid email";
    }
    if (
      formData.parentEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)
    ) {
      newErrors.parentEmail = "Invalid email";
    }

    if (
      formData.studentContactNumber &&
      !/^[6-9]\d{9}$/.test(formData.studentContactNumber)
    ) {
      newErrors.studentContactNumber = "Invalid phone number";
    }

    if (
      formData.guardianMobile &&
      !/^[6-9]\d{9}$/.test(formData.guardianMobile)
    ) {
      newErrors.guardianMobile = "Invalid phone number";
    }

    if (
      formData.emergencyContactNumber &&
      !/^[6-9]\d{9}$/.test(formData.emergencyContactNumber)
    ) {
      newErrors.emergencyContactNumber = "Invalid phone number";
    }

    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Aadhaar must be 12 digits";
    }

    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Invalid pin code";
    }

    if (selectedSubjects.length === 0) {
      newErrors.subjects = "Select at least one subject";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updatedForm = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "currentClass") {
      updatedForm.courseId = "";
      setAvailableCourses(getCourseOptions(value));
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      setSelectedValue("");
    }

    setFormData(updatedForm);

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData({ ...formData, courseId });
    setAvailableSubjects(allSubjects[courseId] || []);
    setSelectedSubjects([]);
    setSelectedValue("");
  };

  const handleSubjectList = (value) => {
    if (!value) return;
    const subject = JSON.parse(value);
    if (!selectedSubjects.some((s) => s.id === subject.id)) {
      setSelectedSubjects((prev) => [...prev, subject]);
    }
    setSelectedValue("");
    setErrors((prev) => ({
      ...prev,
      subjects: "",
    }));
  };

  const handleSubjectRemove = (id) => {
    setSelectedSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAdditionalClick = () =>
    setIsOpenAdditinalFeedOpen(!isOpenAdditinalFeedOpen);
  const handleCourseFeedClick = () => setIsOpenCourseFeed(!isOpenCourseFeed);

  const submitEnrollment = async () => {
    setMessage("");
    if (!validateForm()) {
      setMessage(
        "Please fill all required fields and select at least one subject",
      );
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const [start, end] = formData.academicSession?.split("-") || ["", ""];

      const enrollment = {
        instituteId,
        studentId: formData.studentId,
        studentName: formData.studentName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        studentEmail: formData.studentEmail,
        parentEmail: formData.parentEmail,
        enrollmentId: formData.enrollmentId,
        enrollmentStatus: formData.enrollmentStatus,
        enrollmentDate: formData.enrollmentDate,
        mailingAddress: formData.mailingAddress,
        courseId: formData.courseId,
        currentClass: formData.currentClass,
        section: formData.section,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
        studentContactNumber: formData.studentContactNumber,
      };

      const additional = {
        aadhaarNumber: formData.aadhaarNumber,
        category: formData.category,
        religion: formData.religion,
        nationality: formData.nationality,
        currentAddress: formData.currentAddress,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        bloodGroup: formData.bloodGroup,
        emergencyContactNumber: formData.emergencyContactNumber,
        guardianName: formData.guardianName,
        guardianRelationship: formData.guardianRelationship,
        guardianMobile: formData.guardianMobile,
        transportRequired: formData.transportRequired || false,
        routeName: formData.routeName,
        pickupPoint: formData.pickupPoint,
        dropPoint: formData.dropPoint,
      };

      const courseFeed = {
        courseId: formData.courseId,
        className: formData.currentClass,
        subjects: selectedSubjects.map((s) => ({
          subjectId: s.id,
          subjectName: s.name,
        })),
      };

      const payload = new FormData();
      payload.append("enrollment", JSON.stringify(enrollment));
      payload.append(
        "enrollmentAdditionalInformation",
        JSON.stringify(additional),
      );
      payload.append("courseFeed", JSON.stringify(courseFeed));
      if (studentPhoto) payload.append("studentPhoto", studentPhoto);
      if (studentFatherPhoto)
        payload.append("studentFatherPhoto", studentFatherPhoto);
      if (studentMotherPhoto)
        payload.append("studentMotherPhoto", studentMotherPhoto);

      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/enroll-student`,
        {
          method: "POST",
          credentials: "include",
          body: payload,
        },
      );

      const result = await response.json();
      if (result.success) {
        setMessage(result.message);
        setMessageType("success");

        setFormData({
          studentId: "",
          studentName: "",
          fatherName: "",
          motherName: "",
          gender: "",
          dateOfBirth: "",
          studentEmail: "",
          parentEmail: "",
          enrollmentId: "",
          academicSession: "",
          enrollmentStatus: "",
          enrollmentDate: "",
          courseId: "",
          currentClass: "",
          section: "",
          mailingAddress: "",
          aadhaarNumber: "",
          category: "",
          religion: "",
          nationality: "",
          currentAddress: "",
          city: "",
          state: "",
          pinCode: "",
          bloodGroup: "",
          emergencyContactNumber: "",
          guardianName: "",
          guardianRelationship: "",
          guardianMobile: "",
          transportRequired: false,
          routeName: "",
          pickupPoint: "",
          dropPoint: "",
          studentContactNumber: "",
        });

        setSelectedSubjects([]);
        setAvailableSubjects([]);
        setAvailableCourses([]);
        setSelectedValue("");

        setStudentPhoto(null);
        setStudentFatherPhoto(null);
        setStudentMotherPhoto(null);
      } else {
        setMessage(result.message);
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
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getSummary = () => {
    if (
      !formData.currentClass &&
      !formData.courseId &&
      !formData.section &&
      selectedSubjects.length === 0
    ) {
      return "No subjects selected";
    }
    let text = `You have selected ${formData.currentClass || "Class"}`;
    if (formData.courseId)
      text += ` with Course ${getCourseDisplayName(formData.courseId)}`;
    if (formData.section) text += ` and Section ${formData.section}`;
    if (selectedSubjects.length)
      text += ` with ${selectedSubjects.length} subject(s)`;
    return text;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div>
        <h2 className="bg-gray-200 inline-block text-black rounded-full mb-2 px-4 py-2">
          Student Enrollment
        </h2>
        <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            showStar
            error={errors.studentId}
          />
          <Input
            label="Student Name"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            showStar
            error={errors.studentName}
          />
          <Input
            label="Student Contact No."
            name="studentContactNumber"
            value={formData.studentContactNumber}
            onChange={handleChange}
            showStar
            error={errors.studentContactNumber}
            maxLength={10}
          />
          <Input
            label="Father Name"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            showStar
            error={errors.fatherName}
          />
          <Input
            label="Mother Name"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            showStar
            error={errors.motherName}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
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
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            showStar
            error={errors.dateOfBirth}
          />
          <Input
            type="email"
            label="Student Email"
            name="studentEmail"
            value={formData.studentEmail}
            onChange={handleChange}
            showStar
            error={errors.studentEmail}
          />
          <Input
            type="email"
            label="Guardian Email"
            name="parentEmail"
            value={formData.parentEmail}
            onChange={handleChange}
            showStar
            error={errors.parentEmail}
          />
          <Select
            label="Academic Session"
            name="academicSession"
            value={formData.academicSession}
            options={AcademicSessionDropDown}
            onChange={handleChange}
          />
          <Input
            label="Enrollment ID"
            name="enrollmentId"
            value={formData.enrollmentId}
            onChange={handleChange}
            showStar
            error={errors.enrollmentId}
          />
          <Select
            label="Enrollment Status"
            name="enrollmentStatus"
            value={formData.enrollmentStatus}
            options={statuses}
            onChange={handleChange}
          />
          <Input
            type="date"
            label="Enrollment Date"
            name="enrollmentDate"
            value={formData.enrollmentDate}
            onChange={handleChange}
            showStar
            error={errors.enrollmentDate}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Mailing Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="mailingAddress"
              value={formData.mailingAddress}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.mailingAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.mailingAddress}
              </p>
            )}
          </div>

          <div className="bg-white p-6">
            <div className="flex flex-col gap-6">
              {/* STUDENT PHOTO */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">
                    Student Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStudentPhoto(e.target.files[0])}
                    className="w-full border rounded-md px-3 py-2 bg-white h-[42px]"
                  />
                </div>

                {studentPhoto && (
                  <img
                    src={URL.createObjectURL(studentPhoto)}
                    alt="preview"
                    className="h-[42px] w-[42px] object-cover rounded-full border shrink-0"
                  />
                )}
              </div>

              {/* FATHER PHOTO */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">
                    Father's Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStudentFatherPhoto(e.target.files[0])}
                    className="w-full border rounded-md px-3 py-2 bg-white h-[42px]"
                  />
                </div>

                {studentFatherPhoto && (
                  <img
                    src={URL.createObjectURL(studentFatherPhoto)}
                    alt="preview"
                    className="h-[42px] w-[42px] object-cover rounded-full border shrink-0"
                  />
                )}
              </div>

              {/* MOTHER PHOTO */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">
                    Mother's Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStudentMotherPhoto(e.target.files[0])}
                    className="w-full border rounded-md px-3 py-2 bg-white h-[42px]"
                  />
                </div>

                {studentMotherPhoto && (
                  <img
                    src={URL.createObjectURL(studentMotherPhoto)}
                    alt="preview"
                    className="h-[42px] w-[42px] object-cover rounded-full border shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="bg-gray-200 text-black rounded-full mt-5 px-4 py-2"
          onClick={handleCourseFeedClick}
        >
          <span className="font-bold">+</span> Course Feed
        </button>

        {isOpenCourseFeed && (
          <div className="bg-white shadow-md rounded-xl mt-3 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Class"
                name="currentClass"
                value={formData.currentClass}
                options={classes}
                onChange={handleChange}
                showStar
                error={errors.currentClass}
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Course ID <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleCourseChange}
                  disabled={
                    !formData.currentClass || availableCourses.length === 0
                  }
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                >
                  <option value="">
                    {!formData.currentClass
                      ? "Please select a class first"
                      : availableCourses.length === 0
                        ? "No courses available"
                        : "Select Course ID"}
                  </option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.value}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>
                )}
              </div>

              <Select
                label="Section"
                name="section"
                value={formData.section}
                options={sections}
                onChange={handleChange}
                showStar
                error={errors.section}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedValue}
                  disabled={!formData.courseId}
                  onChange={(e) => handleSubjectList(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.courseId
                      ? "Select Subject"
                      : "Please select a course first"}
                  </option>
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
                {errors.subjects && (
                  <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 col-span-1 md:col-span-2">
                {selectedSubjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    {subject.name}
                    <button
                      type="button"
                      onClick={() => handleSubjectRemove(subject.id)}
                      className="text-red-500 font-bold hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SUMMARY WITH COURSE NAME */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-gray-700 text-sm">{getSummary()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="">
        <button
          className="bg-gray-200 text-black rounded-full mt-4 px-2 py-2"
          onClick={handleAdditionalClick}
        >
          <span className="font-bold">+</span> Additional Information
        </button>

        {isOpenAdditinalFeedOpen && (
          <div className="bg-white max-w-6xl mx-auto shadow-lg my-3 grid grid-cols-1 md:grid-cols-2 gap-5 p-7 rounded-xl">
            <Input
              label="Aadhaar Number"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              error={errors.aadhaarNumber}
              maxLength={12}
            />
            <Select
              label="Category"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              options={categories}
            />
            <Select
              label="Religion"
              name="religion"
              value={formData.religion || ""}
              onChange={handleChange}
              options={religions}
            />
            <Input
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
            />
            <Input
              type="text"
              label="Current Address"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleChange}
            />
            <Input
              type="text"
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              type="text"
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              type="text"
              label="Pin Code"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              maxLength={6}
              error={errors.pinCode}
            />
            <Select
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              options={bloodGroups}
            />
            <Input
              type="tel"
              label="Emergency Contact Number"
              name="emergencyContactNumber"
              value={formData.emergencyContactNumber}
              onChange={handleChange}
              error={errors.emergencyContactNumber}
              maxLength={10}
            />
            <Input
              type="text"
              label="Guardian Name"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
            />

            <Input
              type="text"
              label="Guardian Relationship"
              name="guardianRelationship"
              value={formData.guardianRelationship}
              onChange={handleChange}
            />

            <Input
              type="tel"
              label="Guardian Mobile"
              name="guardianMobile"
              value={formData.guardianMobile}
              onChange={handleChange}
              error={errors.guardianMobile}
              maxLength={10}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="transportRequired"
                checked={formData.transportRequired || false}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">Transport Required</label>
            </div>

            {formData.transportRequired && (
              <>
                <Input
                  type="text"
                  label="Route Name"
                  name="routeName"
                  value={formData.routeName}
                  onChange={handleChange}
                />
                <Input
                  type="text"
                  label="Pickup Point"
                  name="pickupPoint"
                  value={formData.pickupPoint}
                  onChange={handleChange}
                />
                <Input
                  type="text"
                  label="Drop Point"
                  name="dropPoint"
                  value={formData.dropPoint}
                  onChange={handleChange}
                />
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        {message && (
          <div
            className={`text-sm font-medium ${messageType === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {message}
          </div>
        )}
        <button
          onClick={submitEnrollment}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default Enrollment;

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  showStar,
  error,
  maxLength,
  readOnly = false,
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full border px-3 py-2 rounded-md ${error ? "border-red-500" : ""}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, name, value, options, onChange, showStar, error }) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 ${error ? "border-red-500" : ""}`}
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
