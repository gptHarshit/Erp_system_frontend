import React, { useState } from "react";
import AdminEventTrigger from "../admin/AdminEventTrigger";
import AdminFunctionality from "../admin/AdminFunctionality";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("trigger");

  return (
    <div className="w-full px-2 ">
  
      <div className="flex gap-4 mb-2">
      </div>
      <div>
        {activeTab === "trigger" ? (
          <AdminEventTrigger />
        ) : (
          <AdminFunctionality />
        )}
      </div>
    </div>
  );
}
