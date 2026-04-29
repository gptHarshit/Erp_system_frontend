import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";

const EnrollmentUpdateForm = ({ student }) => {
  const [p, setp] = useState([]);

  async function getuserprofile() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/v1/student-dashboard/fetch-student?uuid=${student?.uuid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const json = await res.json();
      if (json?.success) {
        setp(json.payload);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (student?.uuid) getuserprofile();
  }, [student]);

  const { config } = useConfig();
  const { user } = useAuth();
  const instituteId = user?.instituteId || "";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ChangedFieldsFields, setChangedFieldsFields] = useState({});
  const [originalFormData, setOriginalFormData] = useState({});
  const [messageType, setMessageType] = useState("");
  const [isOpenAdditinalFeedOpen, setIsOpenAdditinalFeedOpen] = useState(false);
  const [isOpenStudentInfo, setIsOpenStudentInfo] = useState(false);
  const [isOpenCourseFeed, setIsOpenCourseFeed] = useState(false);
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
    academicSession: "",
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

  useEffect(() => {
    if (p && Object.keys(p).length > 0) {
      const additional = p.enrollmentAdditionalInformation || {};

      const populated = {
        studentId: p.studentId || "",
        studentName: p.studentName || "",
        fatherName: p.fatherName || "",
        motherName: p.motherName || "",
        gender: p.gender || "",
        dateOfBirth: p.dateOfBirth
          ? new Date(p.dateOfBirth).toISOString().split("T")[0]
          : "",
        studentEmail: p.email || "",
        parentEmail: p.parentEmail || "",
        academicSession: p.academicSessionStart
          ? `${p.academicSessionStart}-${p.academicSessionEnd}`
          : "",
        courseId: p.courseId || "",
        currentClass: p.currentClass || "",
        section: p.section || "",
        mailingAddress: p.mailingAddress || "",
        studentContactNumber: p.studentContactNumber || "",
        aadhaarNumber: additional.aadhaarNumber || "",
        category: additional.category || "",
        religion: additional.religion || "",
        nationality: additional.nationality || "",
        currentAddress: additional.currentAddress || "",
        city: additional.city || "",
        state: additional.state || "",
        pinCode: additional.pinCode || "",
        bloodGroup: additional.bloodGroup || "",
        emergencyContactNumber: additional.emergencyContactNumber || "",
        guardianName: additional.guardianName || "",
        guardianRelationship: additional.guardianRelationship || "",
        guardianMobile: additional.guardianMobile || "",
        transportRequired: additional.transportRequired || false,
        routeName: additional.routeName || "",
        pickupPoint: additional.pickupPoint || "",
        dropPoint: additional.dropPoint || "",
      };

      setFormData(populated);
      setOriginalFormData(populated);
      setChangedFieldsFields({});
    }
  }, [p]);

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
    return courseId
      ? [{ id: courseId, name: courseId, value: courseId }]
      : [];
  };

  const requiredFields = [];

  const validateForm = () => {
    return 1;
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (name === "currentClass") {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
        courseId: "",
      }));
      setAvailableCourses(getCourseOptions(newValue));
      setAvailableSubjects([]);
      setSelectedSubjects([]);
      setSelectedValue("");
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
    setChangedFieldsFields((prev) => ({
      ...prev,
      [name]: newValue !== originalFormData[name],
    }));
  }

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData((prev) => ({ ...prev, courseId }));
    setChangedFieldsFields((prev) => ({
      ...prev,
      courseId: courseId !== originalFormData.courseId,
    }));
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
  };

  const handleSubjectRemove = (id) => {
    setSelectedSubjects((prev) => prev.filter((s) => s.id !== id));
  };

const handleAdditionalClick = () => {
  setIsOpenAdditinalFeedOpen(prev => !prev);
  setIsOpenCourseFeed(false);
  setIsOpenStudentInfo(false);
};

const handleCourseFeedClick = () => {
  setIsOpenCourseFeed(prev => !prev);
  setIsOpenAdditinalFeedOpen(false);
  setIsOpenStudentInfo(false);
};

const handlestudentinfoclick = () => {
  setIsOpenStudentInfo(prev => !prev);
  setIsOpenAdditinalFeedOpen(false);
  setIsOpenCourseFeed(false);
};
  
 
  const submitEnrollmentUpdateForm = async () => {
    setMessage("");

    if (!validateForm()) {
      setMessage(
        "Please fill all required fields and select at least one subject"
      );
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const [start, end] = formData.academicSession?.split("-") || ["", ""];

      const coreFields = [
        "studentId",
        "studentName",
        "fatherName",
        "motherName",
        "gender",
        "dateOfBirth",
        "studentEmail",
        "parentEmail",
        "mailingAddress",
        "courseId",
        "currentClass",
        "section",
        "studentContactNumber",
      ];

      const additionalFields = [
        "aadhaarNumber",
        "category",
        "religion",
        "nationality",
        "currentAddress",
        "city",
        "state",
        "pinCode",
        "bloodGroup",
        "emergencyContactNumber",
        "guardianName",
        "guardianRelationship",
        "guardianMobile",
        "transportRequired",
        "routeName",
        "pickupPoint",
        "dropPoint",
      ];

      const EnrollmentUpdateForm = { instituteId };
      coreFields.forEach((field) => {
        if (ChangedFieldsFields[field]) {
          EnrollmentUpdateForm[field] = formData[field];
        }
      });

      if (ChangedFieldsFields.academicSession) {
        EnrollmentUpdateForm.academicSessionStart = Number(start);
        EnrollmentUpdateForm.academicSessionEnd = Number(end);
      }

      const additional = {};
      additionalFields.forEach((field) => {
        if (ChangedFieldsFields[field]) {
          additional[field] = formData[field];
        }
      });

      const courseFeed = {
        courseId: formData.courseId,
        className: formData.currentClass,
        subjects: selectedSubjects.map((s) => ({
          subjectId: s.id,
          subjectName: s.name,
        })),
      };

      const payload = new FormData();
      payload.append(
        "EnrollmentUpdateForm",
        JSON.stringify(EnrollmentUpdateForm)
      );
      payload.append(
        "EnrollmentUpdateFormAdditionalInformation",
        JSON.stringify(additional)
      );
      payload.append("courseFeed", JSON.stringify(courseFeed));
      if (studentPhoto) payload.append("studentPhoto", studentPhoto);
      if (studentFatherPhoto)
        payload.append("studentFatherPhoto", studentFatherPhoto);
      if (studentMotherPhoto)
        payload.append("studentMotherPhoto", studentMotherPhoto);

      for (let [key, value] of payload.entries()) {
        console.log("enteries changed", key, value);
      }

      const response = await fetch(`${API_BASE_URL}/v1/dashboard/`, {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      const result = await response.json();
      if (result.success) {
        setMessage(result.message);
        setMessageType("success");
        setChangedFieldsFields({});
        setOriginalFormData({ ...formData });
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

  const hasChangedFieldsFields = Object.values(ChangedFieldsFields).some(Boolean);

  return (
    <div className="max-w-6xl mx-auto">

      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mt-4">
      
    <button
  onClick={handlestudentinfoclick}
  className={`flex-shrink-0 w-fit flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none
    ${isOpenStudentInfo
      ? "bg-gray-800 text-white shadow"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
>
  <span
    className={`text-base font-bold transition-transform duration-200 ${
      isOpenStudentInfo ? "rotate-45" : ""
    }`}
  >
    +
  </span>
  Student Info
</button>
        
          <button
  onClick={handleCourseFeedClick}
  className={`flex-shrink-0 w-fit flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none
    ${isOpenCourseFeed
      ? "bg-gray-800 text-white shadow"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
>
  <span
    className={`text-base font-bold transition-transform duration-200 ${
      isOpenCourseFeed ? "rotate-45" : ""
    }`}
  >
    +
  </span>
  Course Feed
</button>

       <button
  onClick={handleAdditionalClick}
  className={`flex-shrink-0 w-fit flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none
    ${isOpenAdditinalFeedOpen
      ? "bg-gray-800 text-white shadow"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
>
  <span
    className={`text-base font-bold transition-transform duration-200 ${
      isOpenAdditinalFeedOpen ? "rotate-45" : ""
    }`}
  >
    +
  </span>
  Additional Info
</button>

        <div className="ml-auto flex items-center gap-3">
          {hasChangedFieldsFields && (
            <span className="text-xs text-gray-500">
              {Object.values(ChangedFieldsFields).filter(Boolean).length} field(s) modified
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className={`mt-3 text-sm font-medium text-center ${messageType === "success" ? "text-blue-600" : "text-red-500"}`}>
          {message}
        </div>
      )}
      {isOpenStudentInfo && (
        <div className="bg-white shadow-md rounded-xl p-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.studentId}
          />
          <Input
            label="Student Name"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.studentName}
          />
          <Input
            label="Student Contact No."
            name="studentContactNumber"
            value={formData.studentContactNumber}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.studentContactNumber}
          />
          <Input
            label="Father Name"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.fatherName}
          />
          <Input
            label="Mother Name"
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.motherName}
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
          </div>

          <Input
            type="date"
            label="Date of Birth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.dateOfBirth}
          />
          <Input
            type="email"
            label="Student Email"
            name="studentEmail"
            value={formData.studentEmail}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.studentEmail}
          />
          <Input
            type="email"
            label="Guardian Email"
            name="parentEmail"
            value={formData.parentEmail}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.parentEmail}
          />
          <Select
            label="Academic Session"
            name="academicSession"
            value={formData.academicSession}
            options={AcademicSessionDropDown}
            onChange={handleChange}
            showStar
            ChangedFields={ChangedFieldsFields.academicSession}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Mailing Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="mailingAddress"
              value={formData.mailingAddress}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none transition
                ${ChangedFieldsFields.mailingAddress ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Student Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setStudentPhoto(e.target.files[0])}
              className="w-full border rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Father's Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setStudentFatherPhoto(e.target.files[0])}
              className="w-full border rounded-md px-3 py-2 bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Mother's Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setStudentMotherPhoto(e.target.files[0])}
              className="w-full border rounded-md px-3 py-2 bg-white"
            />
          </div>
        </div>
      )}

      {/* ── COURSE FEED PANEL ── */}
      {isOpenCourseFeed && (
        <div className="bg-white shadow-md rounded-xl mt-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Class"
              name="currentClass"
              value={formData.currentClass}
              options={classes}
              onChange={handleChange}
              showStar
              ChangedFields={ChangedFieldsFields.currentClass}
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Course ID <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleCourseChange}
                disabled={!formData.currentClass || availableCourses.length === 0}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-100 transition
                  ${ChangedFieldsFields.courseId ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
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
            </div>

            <Select
              label="Section"
              name="section"
              value={formData.section}
              options={sections}
              onChange={handleChange}
              showStar
              ChangedFields={ChangedFieldsFields.section}
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
                  {formData.courseId ? "Select Subject" : "Please select a course first"}
                </option>
                {availableSubjects
                  .filter((subject) => !selectedSubjects.some((s) => s.id === subject.id))
                  .map((subject) => (
                    <option key={subject.id} value={JSON.stringify(subject)}>
                      {subject.name}
                    </option>
                  ))}
              </select>
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

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-700 text-sm">{getSummary()}</p>
          </div>
        </div>
      )}

      {/* ── ADDITIONAL INFO PANEL ── */}
      {isOpenAdditinalFeedOpen && (
        <div className="bg-white max-w-6xl mx-auto shadow-lg my-3 grid grid-cols-1 md:grid-cols-2 gap-5 p-7 rounded-xl">
          <Input
            type="text"
            label="Aadhaar Number"
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.aadhaarNumber}
          />
          <Select
            label="Category"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            options={categories}
            ChangedFields={ChangedFieldsFields.category}
          />
          <Select
            label="Religion"
            name="religion"
            value={formData.religion || ""}
            onChange={handleChange}
            options={religions}
            ChangedFields={ChangedFieldsFields.religion}
          />
          <Input
            label="Nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.nationality}
          />
          <Input
            type="text"
            label="Current Address"
            name="currentAddress"
            value={formData.currentAddress}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.currentAddress}
          />
          <Input
            type="text"
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.city}
          />
          <Input
            type="text"
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.state}
          />
          <Input
            type="text"
            label="Pin Code"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.pinCode}
          />
          <Input
            type="text"
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.bloodGroup}
          />
          <Input
            type="tel"
            label="Emergency Contact Number"
            name="emergencyContactNumber"
            value={formData.emergencyContactNumber}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.emergencyContactNumber}
          />
          <Input
            type="text"
            label="Guardian Name"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.guardianName}
          />
          <Input
            type="text"
            label="Guardian Relationship"
            name="guardianRelationship"
            value={formData.guardianRelationship}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.guardianRelationship}
          />
          <Input
            type="tel"
            label="Guardian Mobile"
            name="guardianMobile"
            value={formData.guardianMobile}
            onChange={handleChange}
            ChangedFields={ChangedFieldsFields.guardianMobile}
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
                ChangedFields={ChangedFieldsFields.routeName}
              />
              <Input
                type="text"
                label="Pickup Point"
                name="pickupPoint"
                value={formData.pickupPoint}
                onChange={handleChange}
                ChangedFields={ChangedFieldsFields.pickupPoint}
              />
              <Input
                type="text"
                label="Drop Point"
                name="dropPoint"
                value={formData.dropPoint}
                onChange={handleChange}
                ChangedFields={ChangedFieldsFields.dropPoint}
              />
            </>
          )}
        </div>
      )}
      <div className="flex justify-center p-4">
  <button
    onClick={submitEnrollmentUpdateForm}
    disabled={loading || !hasChangedFieldsFields}
    className={`inline-flex flex-shrink-0 w-fit items-center justify-center px-5 py-2 rounded-full text-sm text-white font-medium transition-all duration-200
      ${loading || !hasChangedFieldsFields
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
      }`}
  >
    {loading ? "Saving..." : "Save Changes"}
  </button>
</div>
    </div>
  );
};

export default EnrollmentUpdateForm;

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  showStar,
  readOnly = false,
  ChangedFields = false,
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
      readOnly={readOnly}
      className={`w-full border rounded-md px-3 py-2 outline-none transition
        ${readOnly ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-primary"}
        ${ChangedFields ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
    />
  </div>
);

const Select = ({ label, name, value, options, onChange, showStar, ChangedFields = false }) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      {label} {showStar && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none transition
        ${ChangedFields ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
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