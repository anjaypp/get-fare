import React from "react";

const ContactDetailsForm = ({ contactData, onContactChange }) => {
  const handleChange = (field, value) => {
    onContactChange({ ...contactData, [field]: value });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={contactData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={contactData.mobile || ""}
            onChange={(e) => handleChange("mobile", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Area Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={contactData.areaCode || ""}
            onChange={(e) => handleChange("areaCode", e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsForm;
