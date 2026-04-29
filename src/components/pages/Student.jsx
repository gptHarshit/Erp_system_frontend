import React, { useState } from "react";
const Student = () => {
  const [transactionId, setTransactionId] = useState("");
  const [uuid, setUuid] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (!transactionId || !uuid) {
      showMessage("Please enter Transaction ID and UUID", "error");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      showMessage("Razorpay SDK failed to load", "error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/v1/students-payments/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transactionId, uuid }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed with status ${response.status}`);
      }

      if (!data.success) {
        showMessage("Order creation failed: " + data.message, "error");
        setLoading(false);
        return;
      }

      const createdOrder = data.payload;

      const options = {
        key: "rzp_test_SQHu8KwxKHQjiP",
        amount: createdOrder.amount,
        currency: "INR",
        order_id: createdOrder.orderId,

        name: "Brain Grades",
        description: "Student Fee Payment",

        handler: async function (paymentResponse) {
          await verifyPayment(
            paymentResponse.razorpay_payment_id,
            paymentResponse.razorpay_order_id,
            paymentResponse.razorpay_signature,
            createdOrder
          );
        },

        prefill: {
          name: "Student",
          email: "",
          contact: "",
        },

        theme: { color: "#528FF0" },

        modal: {
          ondismiss: () =>
            showMessage("Payment cancelled by user.", "error"),
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (
    paymentId,
    orderId,
    signature,
    createdOrder
  ) => {
    try {
      const response = await fetch(`/v1/students-payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          transaction_Id: createdOrder.transactionId,
          uuid: createdOrder.uuid,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed with status ${response.status}`);
      }

      if (data.success) {
        showMessage(
          " Payment Successful! Payment ID: " + paymentId,
          "success"
        );
      } else {
        showMessage(" Payment Verification Failed!", "error");
      }
    } catch (err) {
      showMessage("Verification error: " + err.message, "error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Student Fee Payment
        </h2>

        <input
          type="text"
          placeholder="Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />

        <input
          type="text"
          placeholder="UUID"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />

        <button
          onClick={initiatePayment}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {message && (
          <div
            className={`p-2 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;