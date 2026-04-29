import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";

const PaymentInitiatePage = () => {
  const { config } = useConfig();
  const { user } = useAuth();
  const instituteId = user?.instituteId || "";

  const initialFormData = {
    instituteId: "",
    academicSession: "",
    currentClass: "",
    section: "",
    month: "",
    year: "",
    feeCycle: "",
    paymentStartDate: "",
    paymentEndDate: "",
    fineType: "",
    perDayFineAmount: "",
    feeStructure: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const AcademicSession = config.ACADEMICS.ACADEMICSESSIONS;
  const CLASSES = config.ACADEMICS.CLASSES;
  const SECTIONS = config.ACADEMICS.SECTIONS;
  const MONTHS = config.FEE_CONFIG.MONTHS;
  const YEARS = Array.from(
    { length: config.FEE_CONFIG.YEAR_RANGE.count },
    (_, i) => config.FEE_CONFIG.YEAR_RANGE.start + i,
  );
  const FEE_CYCLE = config.FEE_CONFIG.FEE_CYCLE;
  const FINE_TYPE = config.FEE_CONFIG.FINE_TYPE;
  const PAYMENT_TYPES = config.PAYMENT_TYPES;

  const feeCategory = Object.keys(PAYMENT_TYPES).find(
    (key) => PAYMENT_TYPES[key] === formData.feeStructure[0]?.feeType,
  );

  const validateForm = () => {
    let newErrors = {};

    const requiredFields = [
      "academicSession",
      "currentClass",
      "section",
      "feeCycle",
      "year",
      "paymentStartDate",
      "paymentEndDate",
      "fineType",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.feeCycle === "MONTHLY" && !formData.month) {
      newErrors.month = "Month is required for monthly cycle";
    }

    if (formData.feeStructure.length === 0) {
      newErrors.feeStructure = "At least one fee type is required";
    } else {
      const invalidFee = formData.feeStructure.some(
        (fee) => !fee.amount || fee.amount <= 0,
      );
      if (invalidFee) {
        newErrors.feeStructure = "Please enter valid amount for all fee types";
      }
    }

    if (
      formData.fineType === "PER_DAY" &&
      (!formData.perDayFineAmount || formData.perDayFineAmount <= 0)
    ) {
      newErrors.perDayFineAmount =
        "Per day fine amount is required and must be greater than 0";
    }

    if (formData.paymentStartDate && formData.paymentEndDate) {
      if (
        new Date(formData.paymentStartDate) > new Date(formData.paymentEndDate)
      ) {
        newErrors.paymentEndDate = "Due date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "perDayFineAmount" || name === "year") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFeeSelect = (type) => {
    if (!type) return;
    const feeType = PAYMENT_TYPES[type];

    const exists = formData.feeStructure.find((f) => f.feeType === feeType);
    if (exists) {
      setMessage("Fee type already added");
      setMessageType("error");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      feeStructure: [...prev.feeStructure, { feeType, amount: "" }],
    }));

    if (errors.feeStructure) {
      setErrors((prev) => ({ ...prev, feeStructure: "" }));
    }
  };

  const handleFeeAmountChange = (index, value) => {
    const updated = [...formData.feeStructure];
    updated[index].amount = value === "" ? "" : Number(value);
    setFormData((prev) => ({ ...prev, feeStructure: updated }));

    if (errors.feeStructure) {
      setErrors((prev) => ({ ...prev, feeStructure: "" }));
    }
  };

  const removeFee = (index) => {
    const updated = formData.feeStructure.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, feeStructure: updated }));
  };

  const totalAmount = formData.feeStructure.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const SaveData = async () => {
    setMessage("");
    setMessageType("");

    if (!validateForm()) {
      setMessage("Please fix the validation errors");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const [start, end] = formData.academicSession
        ? formData.academicSession.split("-")
        : [0, 0];

      const payload = {
        instituteId: instituteId,
        academicSessionStart: Number(start),
        academicSessionEnd: Number(end),
        currentClass: formData.currentClass,
        section: formData.section,
        month: formData.feeCycle === "MONTHLY" ? formData.month : null,
        year: Number(formData.year),
        feeCategory: feeCategory || "",
        feeCycle: formData.feeCycle,
        paymentStartDate: formData.paymentStartDate,
        paymentEndDate: formData.paymentEndDate,
        fineType: formData.fineType,
        perDayFineAmount: Number(formData.perDayFineAmount || 0),
        totalAmount: Number(totalAmount),
        feeStructure: formData.feeStructure.map((item) => ({
          feeType: item.feeType,
          amount: Number(item.amount || 0),
        })),
      };

      const response = await fetch("/v1/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(result.message || "Payment initiated successfully!");
        setMessageType("success");
        clearForm();
      } else {
        setMessage(result.message || "Failed to initiate payment");
        setMessageType("error");
      }
    } catch (err) {
      console.log("Error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen px-1 sm:px-3 md:px-6 py-2">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="bg-gray-200 inline-block w-fit text-black rounded-full mb-3 px-4 py-1.5">
          <h2 className="font-medium">Fees Structure</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <SelectField
                label="Academic Session"
                name="academicSession"
                value={formData.academicSession}
                onChange={handleChange}
                options={AcademicSession}
                error={errors.academicSession}
              />
              <SelectField
                label="Class"
                name="currentClass"
                value={formData.currentClass}
                onChange={handleChange}
                options={CLASSES}
                error={errors.currentClass}
              />
              <SelectField
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                options={SECTIONS}
                error={errors.section}
              />
              <SelectField
                label="Fee Cycle"
                name="feeCycle"
                value={formData.feeCycle}
                onChange={handleChange}
                options={FEE_CYCLE}
                error={errors.feeCycle}
              />
              <SelectField
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                options={YEARS}
                error={errors.year}
              />

              {formData.feeCycle === "MONTHLY" && (
                <SelectField
                  label="Month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  options={MONTHS}
                  error={errors.month}
                />
              )}

              <InputField
                label="Payment Start Date"
                name="paymentStartDate"
                value={formData.paymentStartDate}
                onChange={handleChange}
                type="date"
                error={errors.paymentStartDate}
              />
              <InputField
                label="Due Date"
                name="paymentEndDate"
                value={formData.paymentEndDate}
                onChange={handleChange}
                type="date"
                error={errors.paymentEndDate}
              />
              <SelectField
                label="Fine Type"
                name="fineType"
                value={formData.fineType}
                onChange={handleChange}
                options={FINE_TYPE}
                error={errors.fineType}
              />
              <InputField
                label="Per Day Fine Amount (₹)"
                name="perDayFineAmount"
                value={formData.perDayFineAmount}
                onChange={handleChange}
                type="number"
                placeholder="0"
                error={errors.perDayFineAmount}
              />
            </div>

            <div className="mt-5 sm:mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Fee Structure <span className="text-red-500">*</span>
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Add multiple
                </span>
              </div>

              <select
                onChange={(e) => {
                  handleFeeSelect(e.target.value);
                  e.target.value = "";
                }}
                className={`w-full border rounded-lg p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm ${
                  errors.feeStructure ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">+ Select Fee Type</option>
                {Object.keys(PAYMENT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {errors.feeStructure && (
                <p className="text-red-500 text-xs mt-1 mb-2">
                  {errors.feeStructure}
                </p>
              )}

              {formData.feeStructure.length === 0 ? (
                <div className="text-center py-5 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">
                    No fee types added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.feeStructure.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-700 text-sm md:w-1/4">
                        {item.feeType}
                      </span>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:min-w-[250px]">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) =>
                            handleFeeAmountChange(index, e.target.value)
                          }
                          placeholder="Enter amount"
                          className="border border-gray-300 rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />

                        <button
                          onClick={() => removeFee(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700">
                Total Amount
              </label>
              <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xl font-bold text-blue-700">
                  ₹ {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {message && (
              <div
                className={`mt-4 p-3 rounded-lg text-center ${
                  messageType === "success" ? " text-green-600" : "text-red-500"
                }`}
              >
                {message}
              </div>
            )}

            {/* BUTTONS */}
            <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={clearForm}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-50"
              >
                Reset
              </button>

              <button
                onClick={SaveData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInitiatePage;

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-lg p-2 sm:p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm sm:text-base ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} <span className="text-red-500">*</span>
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border rounded-lg p-2 sm:p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm sm:text-base ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
