import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import FeesAnalyticDesktop from "../../components/FeesAnalyticDesktop";
import FeesAnalyticMobile from "../../components/FeesAnalyticMobile";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const FeesAnalytic = () => {
  let data_fees_aggregate = [];
  const { config } = useConfig();
  const { user } = useAuth();
  const InstituteId = user?.instituteId;
  const Min_range_OF_Graph =
    useConfig().config.FEES_ANALYTICS_FEES_RANGE || 10000;

  const [selectedClass, setSelectedClass] = useState("CLASS_10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedAcademicSession, setSelectedAcademicSession] = useState(
    config.ACADEMICS.ACADEMICSESSIONS[0],
  );
  const [selectedStatus, setSelectedStatus] = useState("");

  const [AggreatedPaymentDetailList, setAggreatedPaymentDetailList] = useState(
    {},
  );
  const [studentsPaymentAnalytics, setStudentsPaymentAnalytics] = useState([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const classes = config.ACADEMICS.CLASSES;
  const AcademicSessionDropDown = config.ACADEMICS.ACADEMICSESSIONS;
  const Sections = config.ACADEMICS.SECTIONS;
  const [start, end] = selectedAcademicSession.split("-");
  const [fees_analysis_data, setFeesAnalysisData] = useState([]);

  const StudentsPaymentAnalytics = async () => {
    try {
      const payload = {
        instituteId: InstituteId,
        currentClass: selectedClass,
        section: selectedSection,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
        page,
        size: 5,
      };

      console.log("API HIT", {
        selectedClass,
        selectedSection,
        page,
      });

      const res = await fetch("/v1/payments/student-payments-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Student Payment Analytics Response:", data);

      if (!data.success) {
        setMessage(data.message || "Something went wrong");
        setMessageType("error");
        setStudentsPaymentAnalytics([]);
        return;
      }

      if (!data.payload) {
        setMessage("No data found");
        setMessageType("info");
        setStudentsPaymentAnalytics([]);
        return;
      }
      setStudentsPaymentAnalytics(data.payload);
      setTotalPages(data.payload.totalPages);
      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const FetchAggregatedPayment = async () => {
    try {
      const payload = {
        instituteId: InstituteId,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
      };

      const res = await fetch("/v1/payments/institute-aggrigated-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(
        "aggr-2",
        data?.payload?.classWiseStudentsPaymentsAnalyticsList,
      );
      setFeesAnalysisData(
        data?.payload?.classWiseStudentsPaymentsAnalyticsList || [],
      );
      setAggreatedPaymentDetailList(data.payload);
    } catch (err) {
      console.log(err);
    }
  };
  const allClasses = config?.ACADEMICS.CLASSES || [];
  const dataLookup = (fees_analysis_data || []).reduce((acc, item) => {
    acc[item.currentClass] = item;
    return acc;
  }, {});
  data_fees_aggregate = allClasses.map((className) => {
    if (dataLookup[className]) {
      return dataLookup[className];
    }

    // If not, return a "Empty" object with 0 values
    return {
      currentClass: className,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
    };
  });
  useEffect(() => {
    setPage(0);
  }, [selectedClass, selectedSection, selectedStatus]);

  useEffect(() => {
    FetchAggregatedPayment();
    StudentsPaymentAnalytics();
  }, [selectedAcademicSession, page, selectedClass, selectedSection]);

  const statusStyles = {
    PENDING: "bg-orange-100 text-orange-700",
    PAID: "bg-green-100 text-green-700",
    DELAY: "bg-red-100 text-red-700",
  };

  const studentList =
    studentsPaymentAnalytics?.studentFetchPaymentsResponseList || [];

  const filteredStudents = studentList.filter((item) => {
    if (!selectedStatus) return true; // ALL

    return item.status === selectedStatus;
  });

  const hasStudents = filteredStudents.length > 0;
  const maxVal =
    data_fees_aggregate.length > 0
      ? Math.max(...data_fees_aggregate.map((item) => item.totalAmount))
      : 0;

  const ticks = [];
  for (let i = 0; i <= maxVal + Min_range_OF_Graph; i += Min_range_OF_Graph) {
    ticks.push(i);
  }
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Fees Analytics</h2>

        <div className="flex items-center gap-2">
          <span className="pr-2">Academic Session</span>
          <select
            value={selectedAcademicSession}
            onChange={(e) => setSelectedAcademicSession(e.target.value)}
            className="px-4 py-1 rounded-xl border border-gray-300 bg-white
               focus:outline-none focus:ring-2 focus:ring-blue-400
               focus:border-blue-400 transition"
          >
            {AcademicSessionDropDown.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-blue-200">
          <p>Total Students</p>
          <h2>{AggreatedPaymentDetailList?.totalStudents}</h2>
        </div>

        <div className="p-3 rounded-xl bg-green-200">
          <p>Total Paid</p>
          <h2>₹{AggreatedPaymentDetailList?.totalPaidAmount}</h2>
        </div>

        <div className="p-3 rounded-xl bg-red-200">
          <p>Total Due</p>
          <h2>₹{AggreatedPaymentDetailList?.totalDueAmount}</h2>
        </div>

        <div className="p-3 rounded-xl bg-yellow-200">
          <p>Total Delayed</p>
          <h2>{AggreatedPaymentDetailList?.totalDelayedAmount}</h2>
        </div>

        <div className="p-3 rounded-xl bg-purple-200">
          <p>Total Expected</p>
          <h2>₹{AggreatedPaymentDetailList?.totalExpectedAmount}</h2>
        </div>
      </div>
      <div>
        <div className="hidden md:block">
          <FeesAnalyticDesktop
            classes={classes}
            Sections={Sections}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            studentList={filteredStudents}
            statusStyles={statusStyles}
          />
        </div>

        <div className="block md:hidden">
          <FeesAnalyticMobile
            classes={classes}
            Sections={Sections}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            studentList={filteredStudents}
            statusStyles={statusStyles}
          />
        </div>
      </div>

      {hasStudents && (
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={() => setPage(page - 1)} disabled={page === 0}>
            Prev
          </button>

          <span>Page: {page}</span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            width: "100px",
            minWidth: `${850}px`,
            height: 500,
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data_fees_aggregate}
              margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="currentClass"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                label={{
                  value: "Class Name",
                  position: "insideBottom",
                  offset: -45,
                }}
              />
              <YAxis
                ticks={ticks}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: "Amount (₹)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -20,
                }}
              />
              <Tooltip
                cursor={{ fill: "#f0f0f0" }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "20px" }}
              />
              <Bar
                dataKey="totalAmount"
                name="Total Amount"
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="totalPaid"
                name="Paid Amount"
                fill="#00E096"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="totalOutstanding"
                name="Outstanding"
                fill="#F55C5C"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FeesAnalytic;
