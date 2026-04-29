import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import configs from "../../config/1000.json";
import { Printer, X } from "lucide-react";

const GenerateidModel = ({ student, ID_CARD_VERSION, closeModal }) => {
  const schoollogo = configs.FE_LOGO_URL;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function getuserprofile() {
    setLoading(true);
    try {
      const res = await fetch(
        `/v1/student-dashboard/fetch-student?uuid=${student?.uuid}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials:"include"
        }
      );

      const json = await res.json();
console.log(json);
      if (json?.success) {
        const p = json.payload;
        setData({
          pic: p?.enrollmentAdditionalInformation?.studentImageBase64 || null,
          picF: p?.enrollmentAdditionalInformation?.studentFatherImageBase64 || null,
          picM: p?.enrollmentAdditionalInformation?.studentMotherImageBase64 || null,
          Name: p.studentName,
          Student_Id: p.studentId,
          Class: p.currentClass?.replace("CLASS_", "") || "-",
          Section: p.section || "-",
          Course: p.courseId,
          Enrollment_ID: p.enrollmentId,
          FatherName: p.fatherName || "N/A",
          Session: p.academicSessionStart && p.academicSessionEnd
              ? `${p.academicSessionStart} - ${p.academicSessionEnd}`
              : "2025-2026",
          Date_Of_Birth: p.dateOfBirth
            ? new Date(p.dateOfBirth).toLocaleDateString("en-GB")
            : "-",
          Contact_No: p.studentContactNumber || "N/A",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (student?.uuid) getuserprofile();
  }, [student]);

  const handlePrint = () => {
  const printContent = document.getElementById("printable-id-card");
  const windowUrl = 'about:blank';
  const uniqueName = new Date();
  const windowName = 'Print' + uniqueName.getTime();
  
  // Open a new window
  const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

  printWindow.document.write(`
    <html>
      <head>
        <title>Print ID Card</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            padding: 20px; 
            display: flex; 
            justify-content: center; 
            align-items: center;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          // Wait for images to load before printing
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

  const imageSrc = data?.pic ? `data:image/png;base64,${data.pic}` : null;
  const imageSrcF = data?.picF ? `data:image/png;base64,${data.picF}` : null;
  const imageSrcM = data?.picM ? `data:image/png;base64,${data.picM}` : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-id-card, #printable-id-card * { visibility: visible; }
          #printable-id-card { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            display: flex !important;
            justify-content: center;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden relative border border-gray-200 max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 right-0 p-4 flex justify-end gap-2 z-50 bg-white/80 backdrop-blur-md no-print">
          <button
            onClick={handlePrint}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
          >
            <Printer size={20} />
          </button>
          <button
            onClick={closeModal}
            className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center font-bold text-gray-400">
            Loading Profile...
          </div>
        ) : (
          <div id="printable-id-card" className="p-8">
            {ID_CARD_VERSION === 1 && (
              <div className="w-[600px] h-[360px] mx-auto bg-white border-[1px] border-gray-300 shadow-inner relative overflow-hidden font-sans">
                <div
                  style={{
                    backgroundColor: configs.COLOR_PALETTE.ID_CARD[1],
                    borderBottom: `4px solid ${configs.COLOR_PALETTE.ID_CARD[0]}`
                  }}
                  className="h-[100px] flex items-center px-6 gap-4"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
                    <img src={schoollogo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl font-black uppercase leading-none">{configs?.PROJECT_NAME}</h1>
                    <p className="text-[10px] opacity-90 mt-1 italic">{configs?.INSTITUTE_ADDRESS}</p>
                  </div>
                </div>

                <div className="flex px-8 pt-6 gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-40 border-4 border-[#800000] rounded-sm overflow-hidden bg-gray-100 shadow-lg">
                      {imageSrc ? <img src={imageSrc} className="w-full h-full object-cover" alt="Student" /> : <div className="text-xs text-gray-400">PHOTO</div>}
                    </div>
                    <p className="mt-2 font-black text-slate-800 text-sm">{data?.Session}</p>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-[#800000] border-b-2 mb-3 uppercase">Identity Card</h2>
                    <div className="grid grid-cols-[80px_1fr] gap-y-1 text-xs font-bold text-slate-700">
                      <span>Name</span><span className="text-slate-900">: {data?.Name}</span>
                      <span>Father</span><span className="text-slate-900">: {data?.FatherName}</span>
                      <span>D.O.B</span><span className="text-slate-900">: {data?.Date_Of_Birth}</span>
                      <span>Class</span><span className="text-slate-900">: {data?.Class}- {data?.Section}</span>
                      <span>Enrollment</span><span className="text-slate-900">: {data?.Enrollment_ID}</span>
                      <span>Mobile</span><span className="text-slate-900">: {data?.Contact_No}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 w-full">
                  <svg ID_CARD_VERSIONBox="0 0 500 150" preserveAspectRatio="none" className="h-16 w-full">
                    <path d="M0.00,49.98 C149.99,150.00 349.89,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" fill={configs.COLOR_PALETTE.ID_CARD[0]}></path>
                  </svg>
                </div>
              </div>
            )}
            {(ID_CARD_VERSION === 2 || ID_CARD_VERSION === 3) && (
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="w-[260px] h-[420px] bg-white border rounded-lg shadow-md overflow-hidden relative">
                    <div style={{ backgroundColor: configs.COLOR_PALETTE.ID_CARD[1], borderBottom: `3px solid ${configs.COLOR_PALETTE.ID_CARD[0]}` }} className="text-white text-center py-2 px-2">
                        <h1 className="text-sm font-bold uppercase">{configs?.PROJECT_NAME}</h1>
                        <p className="text-[9px]">{configs?.INSTITUTE_ADDRESS}</p>
                    </div>
                    <div className="flex  items-center justify-evenly  mt-2">
                        <div className="w-12 h-12 rounded-full border-2 border-white ">
                            <img src={schoollogo} className="w-full h-full object-contain" alt="logo" />
                        </div>
                        <div className="w-24 h-28 mt-2 border-2 overflow-hidden" style={{ borderColor: configs.COLOR_PALETTE.ID_CARD[0] }}>
                            {imageSrc ? <img src={imageSrc} className="w-full h-full object-cover" /> : <div className="text-xs">PHOTO</div>}
                        </div>
                       
                    </div>
                    <div className="px-3 py-3 text-[10px] space-y-1.5">
                      <p><strong>Name:</strong> {data?.Name}</p>
                        <p><strong>Class:</strong> {data?.Class} - {data?.Section}</p>
                        <p><strong>Father:</strong> {data?.FatherName}</p>
                        <p><strong>Phone:</strong> {data?.Contact_No}</p>
                         <p><strong>DOB:</strong> {data?.Date_Of_Birth}</p>
                        <p><strong>Enrollment:</strong> {data?.Enrollment_ID}</p>
                    </div>
                    <div style={{ backgroundColor: configs.COLOR_PALETTE.ID_CARD[0] }} className="absolute bottom-0 w-full text-white text-center py-1 text-[10px]">
                        {data?.Session}
                    </div>
                </div>
                {ID_CARD_VERSION === 3 && (
                    <div className="w-[260px] h-[420px] bg-white border border-gray-300 shadow-md flex flex-col justify-between overflow-hidden relative rounded-lg">
                        <div className="text-center pt-3">
                             <h2 className="text-sm font-black text-[#800000] uppercase">Parent Info</h2>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-28 border-2 border-[#800000] bg-gray-100">
                                {imageSrcF ? <img src={imageSrcF} className="w-full h-full object-cover" /> : <div className="text-[10px] p-4 text-center">FATHER PHOTO</div>}
                            </div>
                            <div className="w-24 h-28 border-2 border-[#800000] bg-gray-100">
                                {imageSrcM ? <img src={imageSrcM} className="w-full h-full object-cover" /> : <div className="text-[10px] p-4 text-center">MOTHER PHOTO</div>}
                            </div>
                        </div>
                        <div style={{ backgroundColor: configs.COLOR_PALETTE.ID_CARD[1] }} className="h-12 flex items-center px-4 gap-2 text-white">
                             <img src={schoollogo} className="w-6 h-6 bg-white rounded-full p-0.5" />
                             <span className="text-[9px] font-bold truncate">{configs?.PROJECT_NAME}</span>
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateidModel;