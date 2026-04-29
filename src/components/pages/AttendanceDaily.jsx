import React, { useEffect, useState } from "react";
import MyCalender from "./MyCalender";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";
import AttendanceDesktop from "./AttendanceDailyDesktopview";
import AttendanceMobile from "./AttendanceDailyMobileview";

const AttendanceDaily = () => {
  const { user } = useAuth();
  const { config } = useConfig();
  const instituteId = user?.instituteId || "";
  const [selectedClass, setSelectedClass] = useState("");
  const [section, setSection] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageType, setSaveMessageType] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const Classes = config?.ACADEMICS?.CLASSES || [];
  const Sections = config?.ACADEMICS?.SECTIONS || [];
  const AcademicSessionDropDown = config?.ACADEMICS?.ACADEMICSESSIONS || [];

  // ================= LOAD =================
  const loadAttendance = async () => {
    // Validation — pehle check karo
    if (!selectedClass || !section || !academicSession || !isDateSelected) {
      setMessage("Please fill all the fields");
      setMessageType("error");
      return;
    }

    try {
      setMessage("");
      setMessageType("");
      setStudents([]);
      setAttendance({});
      setDataLoaded(false);

      const day = dayjs(selectedDate).date();
      const month = dayjs(selectedDate).format("MMMM").toUpperCase();
      const year = dayjs(selectedDate).year();

      const [start, end] = academicSession.split("-");

      const payload = {
        currentClass: selectedClass,
        section,
        instituteId,
        year,
        month,
        day,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
      };

      const res = await fetch(
        `${API_BASE_URL}/v1/dashboard/attendance/load/day`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        const list = data.payload?.attendanceList || [];
        setStudents(list);
        setDataLoaded(true);
        setMessage(data.message);
        setMessageType("success");

        const initial = {};
        list.forEach((s) => {
          initial[s.studentId] = s.attendanceStatus;
        });
        setAttendance(initial);
      } else {
        setMessage(data.message || "Failed to load attendance");
        setMessageType("error");
        setDataLoaded(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
      setMessageType("error");
    }
  };

  // ================= SAVE =================
  const saveAttendance = async () => {
    if (students.length === 0) {
      setSaveMessage("No students available");
      setSaveMessageType("error");
      return;
    }

    try {
      const day = dayjs(selectedDate).date();
      const month = dayjs(selectedDate).format("MMMM").toUpperCase();
      const year = dayjs(selectedDate).year();

      const formatted = students.map((s) => ({
        uuid: s.uuid,
        studentId: s.studentId,
        courseId: s.courseId,
        enrollmentId: s.enrollmentId,
        currentClass: selectedClass,
        section,
        attendanceStatus: attendance[s.studentId] ?? null,
      }));

      const payload = {
        currentClass: selectedClass,
        section,
        instituteId,
        year,
        month,
        day,
        allStudentattendanceList: formatted,
      };

      const res = await fetch(
        `${API_BASE_URL}/v1/dashboard/mark-allstudent-attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        setSaveMessage(data.message || "Saved successfully");
        setSaveMessageType("success");
      } else {
        setSaveMessage(data.message || "Failed to save");
        setSaveMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Something went wrong");
      setSaveMessageType("error");
    }
  };

  const handleAttendance = (id, value) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === value ? null : value,
    }));
  };

  // ================= useEffect — Auto hide messages =================
  useEffect(() => {
    if (!message && !saveMessage) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
      setSaveMessage("");
      setSaveMessageType("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [message, saveMessage]);

  return (
    <div className="p-3">
      {/* ================= FORM ================= */}
      <div className="grid md:grid-cols-4 gap-4 bg-white p-5 rounded-xl shadow border">
        <select
          className="w-full border rounded-md px-4 py-2"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {Classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="w-full border rounded-md px-4 py-2"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="">Select Section</option>
          {Sections.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* DATE */}
        <div className="relative w-full">
          <button
            onClick={() => setIsCalendarOpen((p) => !p)}
            className="w-full border rounded-md px-4 py-2 text-left bg-white"
          >
            {isDateSelected
              ? dayjs(selectedDate).format("DD MMM YYYY")
              : "Select Date"}
          </button>

          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white shadow-lg rounded-lg p-2">
              <MyCalender
                selectedDate={selectedDate}
                setSelectedDate={(d) => {
                  setSelectedDate(d);
                  setIsCalendarOpen(false);
                  setIsDateSelected(true);
                }}
              />
            </div>
          )}
        </div>

        <select
          className="w-full border rounded-md px-4 py-2"
          value={academicSession}
          onChange={(e) => setAcademicSession(e.target.value)}
        >
          <option value="">Select Session</option>
          {AcademicSessionDropDown.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {/* Message — grid ke bahar same block mein */}
        {message && (
          <div
            className={`md:col-span-4 text-center text-sm font-medium ${
              messageType === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
        <button
          onClick={loadAttendance}
          className="md:col-span-4 bg-primary text-white py-2 rounded-md"
        >
          Load Users Data
        </button>
      </div>

      {/* ================= INITIAL PLACEHOLDER ================= */}
      {!dataLoaded && students.length === 0 && !message && (
        <div className="flex justify-center items-center  mt-6 md:mt-16 p-3 text-gray-400 text-md">
          Please select the required fields and click Load Users Data
        </div>
      )}

      {dataLoaded && students.length === 0 && (
        <div className="flex justify-center items-center mt-4 md:mt-10 p-2 text-gray-500 text-lg">
          No students Available for this selection
        </div>
      )}

      {students.length > 0 && (
        <>
          <div className="hidden md:block">
            <AttendanceDesktop
              students={students}
              attendance={attendance}
              section={section}
              handleAttendance={handleAttendance}
              saveAttendance={saveAttendance}
              saveMessage={saveMessage}
              saveMessageType={saveMessageType}
            />
          </div>


          <div className="block md:hidden">
            <AttendanceMobile
              students={students}
              attendance={attendance}
              section={section}
              handleAttendance={handleAttendance}
              saveAttendance={saveAttendance}
              saveMessage={saveMessage}
              saveMessageType={saveMessageType}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceDaily;
