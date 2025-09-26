import React, { useState } from "react";

const PassengerForm = ({ passengerFields, flight, onPassengerDataChange }) => {
  // State for collapsible form
  const [isPassengerFormOpen, setIsPassengerFormOpen] = useState(true); // Open by default
  // State for passenger form data
  const [passengerData, setPassengerData] = useState({});

  // Handle form input changes
  const handleInputChange = (paxType, passengerIndex, field, value) => {
    const updatedData = {
      ...passengerData,
      [paxType]: {
        ...passengerData[paxType],
        [passengerIndex]: {
          ...passengerData[paxType]?.[passengerIndex],
          [field]: value
        }
      }
    };
    setPassengerData(updatedData);

    const formattedData = formatPassengerData(updatedData);

    // Log updated passenger data to console
    console.log("Updated Passenger Data:", formattedData);

    // Pass formatted data to parent
    onPassengerDataChange(formattedData);
  };

  // Format the passenger data into desired JSON structure
  const formatPassengerData = (data) => {
    const passengers = [];

    Object.keys(data).forEach((paxType) => {
      Object.keys(data[paxType]).forEach((index) => {
        const pax = data[paxType][index];
        passengers.push({
          title: pax.salutation || "",
          firstName: pax.firstName || "",
          lastName: pax.lastName || "",
          email: pax.email || "",
          dob: pax.dob ? new Date(pax.dob).toISOString() : "",
          genderType: pax.gender
            ? pax.gender === "Male"
              ? "M"
              : pax.gender === "Female"
              ? "F"
              : "O"
            : "",
          areaCode: pax.areaCode || "",
          ffNumber: pax.ffNumber || "",
          paxType,
          mobile: pax.mobile || "",
          passportNumber: pax.passportNumber || "",
          passengerNationality: pax.passengerNationality || "",
          passportDOI: pax.passportDOI ? new Date(pax.passportDOI).toISOString() : "",
          passportDOE: pax.passportDOE ? new Date(pax.passportDOE).toISOString() : "",
          passportIssuedCountry: pax.passportIssuedCountry || "",
          seatPref: pax.seatPref || "N",
          mealPref: pax.mealPref || "",
          ktn: pax.ktn || "",
          redressNo: pax.redressNo || "",
          serviceReference: pax.serviceReference || [
            {
              baggageRefNo: "",
              MealsRefNo: "",
              SeatRefNo: "",
              SegmentInfo: ""
            },
            {
              baggageRefNo: "",
              MealsRefNo: "",
              SegmentInfo: ""
            }
          ]
        });
      });
    });

    return { passengers };
  };

  // Helper to render input fields based on field type
  const renderInputField = (paxType, passengerIndex, field, isRequired) => {
    const commonProps = {
      className:
        "w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
      value: passengerData[paxType]?.[passengerIndex]?.[field] || "",
      onChange: (e) =>
        handleInputChange(paxType, passengerIndex, field, e.target.value),
      required: isRequired
    };

    switch (field) {
      case "salutation":
        return (
          <select {...commonProps}>
            <option value="">Select Salutation</option>
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
            <option value="Mrs">Mrs</option>
          </select>
        );
      case "gender":
        return (
          <select {...commonProps}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        );
      case "dob":
      case "passportDOE":
      case "passportDOI":
        return <input type="date" {...commonProps} />;
      case "email":
        return <input type="email" {...commonProps} />;
      case "mobile":
        return <input type="tel" {...commonProps} />;
      case "areaCode":
        return <input type="text" placeholder="+91" {...commonProps} />;
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div
        className="flex justify-between items-center cursor-pointer"
        role="button"
        aria-expanded={isPassengerFormOpen}
        onClick={() => setIsPassengerFormOpen(!isPassengerFormOpen)}
      >
        <h4 className="font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-1 1v7a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm-2 5V6a2 2 0 114 0v1H8z" />
          </svg>
          Passenger Information
        </h4>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            isPassengerFormOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {isPassengerFormOpen && (
        <div className="mt-3 space-y-6">
          {passengerFields.map((pax) => {
            const paxType = pax.paxType;
            const numPassengers = flight[`${paxType.toLowerCase()}Num`] || 0;
            return (
              <div key={paxType}>
                <h5 className="text-lg font-semibold text-gray-700 mb-3">
                  {paxType === "ADT"
                    ? "Adult"
                    : paxType === "CHD"
                    ? "Child"
                    : "Infant"}{" "}
                  Details
                </h5>
                {Array.from({ length: numPassengers }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border mb-4">
                    <h6 className="font-medium text-gray-800 mb-2">
                      Passenger {i + 1} ({paxType})
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(pax)
                        .filter((key) => key !== "paxType")
                        .map((field) => (
                          <div key={field} className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">
                              {field
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              {pax[field] ? (
                                <span className="text-red-500"> *</span>
                              ) : (
                                " (Optional)"
                              )}
                            </label>
                            {renderInputField(paxType, i, field, pax[field])}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PassengerForm;
