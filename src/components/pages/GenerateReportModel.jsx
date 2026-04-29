
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Asset_1 from "../../../src/assets/Asset_1.png";
import configs from "../../config/1000.json";
const GenerateReportModel = ({ student, closeModal }) => {
  let schoollogo = Asset_1;
  const { user } = useAuth();
  const [reportType, setReportType] = useState("");
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  const examMapping = {
    HALF_YEARLY: ["FORMATIVE_I", "FORMATIVE_II", "SUMMATIVE_I"],
    YEARLY: [
      "FORMATIVE_I",
      "FORMATIVE_II",
      "SUMMATIVE_I",
      "FORMATIVE_III",
      "FORMATIVE_IV",
      "SUMMATIVE_II",
    ],
  };

  const fetchSubjectList = async () => {
    if (!student || !student.subjectFeedId) return;
    try {
      const response = await fetch(`/v1/dashboard/fetch-subjects/${student.subjectFeedId}`);
      const data = await response.json();
      setSubjects(data.payload || []);
    } catch (err) {
      setError("Failed to load subjects");
    }
  };

  const handleGenerate = async () => {
    if (!reportType) {
      setError("Please select report type");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const examsToFetch = examMapping[reportType];
      const fetchPromises = examsToFetch.map((type) =>
        fetch("/v1/student-dashboard/fetch-marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instituteId: student.instituteId,
            academicSessionStart: student.academicSessionStart,
            academicSessionEnd: student.academicSessionEnd,
            uuid: student.uuid,
            currentClass: student.currentClass,
            examType: type,
          }),
        }).then((res) => res.json())
      );

      const results = await Promise.all(fetchPromises);
      const consolidated = {};
      results.forEach((res, index) => {
        const type = examsToFetch[index];
        if (res.success && res.payload.marksDetails) {
          res.payload.marksDetails.forEach((item) => {
            if (!consolidated[item.subjectId]) consolidated[item.subjectId] = {};
            consolidated[item.subjectId][type] = item.subjectMarks;
          });
        }
      });
      setReportData(consolidated);
    } catch (err) {
      setError("Failed to fetch marks");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (subjectId) => {
    const sMarks = reportData[subjectId] || {};
    return Object.values(sMarks).reduce((a, b) => a + (b === "AB" ? 0 : Number(b)), 0);
  };

  const calculateAggregate = () => {
    let total = 0;
    let max = 0;
    subjects.forEach((sub) => {
      examMapping[reportType].forEach((type) => {
        const mark = reportData[sub.subjectId]?.[type];
        const maxMarks = type.startsWith("FORMATIVE") ? 30 : 100;
        max += maxMarks;
        if (mark !== undefined && mark !== "AB") {
          total += Number(mark);
        }
      });
    });
    return max === 0 ? 0 : ((total / max) * 100).toFixed(2);
  };

  useEffect(() => {
    fetchSubjectList();
  }, [student]);

  if (!reportData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white w-full max-w-[500px] p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Generate Academic Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <p className="bg-gray-50 p-2 rounded border font-semibold">{student.studentName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Report Type</label>
              <select
                className="w-full border p-2 rounded-lg"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="">-- Choose Type --</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button onClick={closeModal} className="px-4 py-2 text-gray-600 order-2 sm:order-1">Cancel</button>
              <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold order-1 sm:order-2">
                {loading ? "Processing..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let mark = calculateAggregate();
  let ans = mark < 35 ? "Fail" : "Pass";
  let gra = "F";
  if (mark >= 70) gra = "A+";
  else if (mark >= 50) gra = "A";
  else if (mark >= 35) gra = "B";

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-90 flex justify-center items-start overflow-y-auto z-50 p-2 sm:p-10">
      <div 
        className="bg-white w-full max-w-[950px] p-4 sm:p-10 shadow-2xl rounded-sm text-gray-800 border-[4px] sm:border-[10px] border-double border-gray-200 print:m-0 print:border-0 print:shadow-none" 
        id="printable-report"
      >
       <div
  style={{
    borderBottom: `2px solid ${configs.COLOR_PALETTE.REPORT_CARD[0]}`
  }}
  className="text-center pb-4 mb-6"
>
          <div className="flex justify-center mb-2">
            <img src={schoollogo} alt="School Logo" className="h-16 sm:h-20 object-contain" />
          </div><h1
  style={{ color: configs.COLOR_PALETTE.REPORT_CARD[1] }}
  className="text-xl sm:text-4xl font-serif font-bold tracking-widest uppercase"
>
            {configs?.PROJECT_NAME || "BrainGrades High School"}
          </h1>
          <p className="font-bold mt-1 text-xs sm:text-sm">{configs.INSTITUTE_ADDRESS}</p>
       <div
  style={{ backgroundColor: configs.COLOR_PALETTE.REPORT_CARD[0] }}
  className="text-white inline-block px-6 py-1 mt-4 rounded-sm font-bold uppercase tracking-tighter text-xs sm:text-sm"
>
            Report Card - {reportType.replace('_', ' ')} EXAMINATION
          </div>
          <p className="font-bold mt-2 text-xs sm:text-sm">
            ACADEMIC SESSION : {student.academicSessionStart}-{student.academicSessionEnd}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-400 text-xs sm:text-sm font-bold mb-6">
          <div className="border-b sm:border-r border-gray-400 p-2 uppercase">NAME : {student.studentName}</div>
          <div className="border-b border-gray-400 p-2 uppercase">{student.currentClass} - {student.section}</div>
          <div className="border-b sm:border-b-0 sm:border-r border-gray-400 p-2">Enrollment ID: {student.enrollmentId}</div>
          <div className="p-2">Father Name: {student.fatherName}</div>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-gray-400 text-center text-[10px] sm:text-xs">
            <thead>
             <tr
  style={{ backgroundColor: configs.COLOR_PALETTE.REPORT_CARD[0] }}
  className="uppercase"
>
                <th className="border border-gray-400 p-2 text-left">Subject Name</th>
                {examMapping[reportType].map(type => (
                  <th key={type} className="border border-gray-400 p-2">{type.replace('_', ' ')}</th>
                ))}<th
  style={{ backgroundColor: configs.COLOR_PALETTE.REPORT_CARD[0] }}
  className="border border-gray-400 p-2"
>
  TOTAL
</th>
              </tr>
              <tr className="bg-gray-50 text-[9px] sm:text-[10px]">
                <td className="border border-gray-400 italic">Max Marks</td>
                {examMapping[reportType].map(type => (
                  <td key={type} className="border border-gray-400">{type.startsWith('FORMATIVE') ? '30' : '100'}</td>
                ))}
                <td className="border border-gray-400">---</td>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub.subjectId} className="font-semibold">
                  <td className="border border-gray-400 p-2 text-left uppercase">{sub.subjectName}</td>
                  {examMapping[reportType].map(type => (
                    <td key={type} className="border border-gray-400 p-2">{reportData[sub.subjectId]?.[type] ?? "AB"}</td>
                  ))}
                  <td className="border border-gray-400 p-2 bg-gray-50">{calculateTotal(sub.subjectId)}</td>
                </tr>
              ))}
              <tr
  style={{ backgroundColor: configs.COLOR_PALETTE.REPORT_CARD[0] }}
  className="font-bold"
>
                <td className="border border-gray-400 p-2 text-left uppercase">Aggregate %</td>
                <td colSpan={examMapping[reportType].length + 1} className="border border-gray-400 p-2">{mark} %</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 space-y-4">
          <div className="border border-gray-400 flex flex-col sm:flex-row text-xs sm:text-sm">
            <div className="bg-gray-100 p-2 border-b sm:border-b-0 sm:border-r border-gray-400 font-bold sm:w-1/4 uppercase">Remark</div>
            <div className="p-2 sm:w-3/4 italic">Work harder in subjects where marks are low. Overall good behavior.</div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
            <div className="flex gap-4 border border-gray-400 bg-gray-100 p-2 font-bold uppercase">Verdict: <span className="text-green-700">{ans}</span></div>
            <div className="flex gap-4 border border-gray-400 bg-gray-100 p-2 font-bold uppercase">Grade: <span className="text-green-700">{gra}</span></div>
          </div>
        </div>
        <div className="flex justify-between mt-16 sm:mt-24 px-4 text-center">
          <div className="border-t border-gray-400 pt-2 px-4 font-bold text-xs sm:text-sm">Class Teacher</div>
          <div className="border-t border-gray-400 pt-2 px-4 font-bold text-xs sm:text-sm">School Seal</div>
          <div className="border-t border-gray-400 pt-2 px-4 font-bold font-serif italic text-base sm:text-xl">Principal</div>
        </div>

        <div className="mt-10 flex justify-center gap-4 print:hidden">
          <button onClick={() => setReportData(null)} className="bg-gray-500 text-white px-6 py-2 rounded shadow">Back</button>
          <button onClick={() => window.print()} className="bg-green-700 text-white px-6 py-2 rounded shadow">Print Full Report</button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            border: none;
            box-shadow: none;
          }
          html, body {
            height: auto;
            overflow: visible !important;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default GenerateReportModel;