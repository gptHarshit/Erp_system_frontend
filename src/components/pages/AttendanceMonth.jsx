import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import { API_BASE_URL } from "../../api/apiClient";
import AttendanceMonthDesktop from "./AttendanceMonthDesktop";
import AttendanceMonthMobile from "./AttendanceMonthMobile";

const AttendanceMonth = () => {
  const { config } = useConfig();
  const { user } = useAuth();
  const instituteId = user?.instituteId;

  const [selectClass, setSelectClass] = useState("");
  const [selectSection, setSelectSection] = useState("");
  const [selectMonth, setSelectMonth] = useState("");
  const [academicSession, setAcademicSession] = useState("");

  const [studentList, setStudentList] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [holidays, setHolidays] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const classes = config.ACADEMICS.CLASSES;
  const sections = config.ACADEMICS.SECTIONS;
  const AcademicSessionDropDown = config.ACADEMICS.ACADEMICSESSIONS;

  const monthDays = {
    JANUARY: 31,
    FEBRUARY: 28,
    MARCH: 31,
    APRIL: 30,
    MAY: 31,
    JUNE: 30,
    JULY: 31,
    AUGUST: 31,
    SEPTEMBER: 30,
    OCTOBER: 31,
    NOVEMBER: 30,
    DECEMBER: 31,
  };

  const fetchStudentForAttendance = async () => {
    if (!selectClass || !selectSection || !selectMonth || !academicSession) {
      setMessage("Please fill all the fields");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setStudentList([]);
      setDataLoaded(false);

      const [start, end] = academicSession.split("-");
      const year = Number(start);

      const payload = {
        currentClass: selectClass,
        section: selectSection,
        instituteId,
        year,
        month: selectMonth,
        day: null,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
      };

      const response = await fetch(
        `${API_BASE_URL}/v1/dashboard/attendance/load/month`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Failed to load data");
        setMessageType("error");
        setDataLoaded(false);
        return;
      }

      const list = data.payload?.attendanceResponse || [];

      if (list.length === 0) {
        setMessage("No students found for this selection");
        setMessageType("error");
        setDataLoaded(true);
        return;
      }

      setStudentList(list);
      setHolidays(data.payload?.holidayList || []);
      setMessage(data.message || "Attendance loaded successfully");
      setMessageType("success");
      setDataLoaded(true);
    } catch (err) {
      setMessage("Network error / server down");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentList.length || !selectMonth || !academicSession) return;

    let daysInMonth = monthDays[selectMonth];
    const [start] = academicSession.split("-");
    const year = Number(start);

    if (
      selectMonth === "FEBRUARY" &&
      year % 4 === 0 &&
      (year % 100 !== 0 || year % 400 === 0)
    ) {
      daysInMonth = 29;
    }

    const newAttendance = {};

    studentList.forEach((student) => {
      const days =
        student.monthAttendance && typeof student.monthAttendance === "object"
          ? student.monthAttendance
          : Object.fromEntries(
              Array.from({ length: daysInMonth }, (_, i) => [i + 1, null]),
            );

      newAttendance[student.studentId] = {
        days,
        presentCount: Object.values(days).filter(Boolean).length,
      };
    });

    setAttendance(newAttendance);
  }, [studentList]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="p-3">
      {/* FORM */}
      <div className="grid md:grid-cols-4 gap-4 bg-white p-5 rounded-xl shadow border">
        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls}>{cls}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectSection(e.target.value)}
        >
          <option value="">Select Section</option>
          {sections.map((sec) => (
            <option key={sec}>{sec}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {Object.keys(monthDays).map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>

        <select
          value={academicSession}
          onChange={(e) => setAcademicSession(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Academic Session</option>
          {AcademicSessionDropDown.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

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
          onClick={fetchStudentForAttendance}
          className="md:col-span-4 bg-primary text-white py-2 rounded-md"
        >
          {loading ? "Loading..." : "Load Users Data"}
        </button>
      </div>

  
      {!dataLoaded && studentList.length === 0 && !message && (
        <div className="flex justify-center items-center mt-6 md:mt-16 text-gray-400 text-md">
          Please select the required fields and click Load Users Data
        </div>
      )}


      {dataLoaded && studentList.length === 0 && (
        <div className="flex justify-center items-center mt-10 text-gray-500 text-sm">
          No students found for this selection
        </div>
      )}

    
      {studentList.length > 0 && (
        <>
          <div className="hidden md:block">
            <AttendanceMonthDesktop
              studentList={studentList}
              attendance={attendance}
              holidays={holidays}
              selectMonth={selectMonth}
            />
          </div>

          <div className="block md:hidden">
            <AttendanceMonthMobile
              studentList={studentList}
              attendance={attendance}
              holidays={holidays}
              selectMonth={selectMonth}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceMonth;
