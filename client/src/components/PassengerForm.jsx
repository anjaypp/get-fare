import React, { useState, useEffect } from "react";

const PassengerForm = ({ passengerFields, flight, onPassengerDataChange }) => {
  // Flattened passenger array
  const [passengers, setPassengers] = useState([]);

  // Initialize passengers on mount
  useEffect(() => {
    const initialPassengers = passengerFields.flatMap((pax) => {
      const count = flight[`${pax.paxType.toLowerCase()}Num`] || 0;
      return Array.from({ length: count }).map(() => ({
        paxType: pax.paxType,
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        genderType: "",
        mobile: "",
        areaCode: "",
        passportNumber: "",
        passengerNationality: "",
        passportDOI: "",
        passportDOE: "",
        passportIssuedCountry: "",
        seatPref: "N",
        mealPref: "",
        ffNumber: "",
        ktn: "",
        redressNo: "",
        serviceReference:
          pax.paxType === "INF"
            ? undefined
            : [
                {
                  baggageRefNo: "",
                  MealsRefNo: "",
                  SeatRefNo: "",
                  SegmentInfo: "",
                },
                {
                  baggageRefNo: "",
                  MealsRefNo: "",
                  SeatRefNo: "",
                  SegmentInfo: "",
                },
              ],
      }));
    });
    setPassengers(initialPassengers);
  }, [passengerFields, flight]);

  // Update lead passenger fields for others
  useEffect(() => {
    const leadPassenger = passengers.find(
      (p, i) => p.paxType === "ADT" && i === 0
    );
    if (!leadPassenger) return;

    const updated = passengers.map((p) => {
      if (p === leadPassenger) return p;
      return {
        ...p,
        email: leadPassenger.email,
        mobile: leadPassenger.mobile,
        areaCode: leadPassenger.areaCode,
        addressCountryCode: leadPassenger.addressCountryCode,
      };
    });

    setPassengers(updated);
    onPassengerDataChange({ passengers: updated });
    // Only run once after mount
  }, []);

  // Handle input changes
  const handleInputChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
    onPassengerDataChange({ passengers: updated });
  };

  // Render inputs
  const renderInputField = (index, field, value) => {
    const commonProps = {
      className:
        "w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
      value: value || "",
      onChange: (e) => handleInputChange(index, field, e.target.value),
    };

    switch (field) {
      case "title":
        return (
          <select {...commonProps}>
            <option value="">Select Salutation</option>
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
            <option value="Mrs">Mrs</option>
          </select>
        );
      case "genderType":
        return (
          <select {...commonProps}>
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
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

  // Helper to format label
  const formatLabel = (field) =>
    field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="mt-3 space-y-6">
        {(() => {
          const typeCounters = { ADT: 0, CHD: 0, INF: 0 }; // persistent counters
          return passengers.map((pax, index) => {
            typeCounters[pax.paxType] += 1;
            const displayNumber = typeCounters[pax.paxType];

            const paxTypeLabel =
              pax.paxType === "ADT"
                ? "Adult"
                : pax.paxType === "CHD"
                ? "Child"
                : "Infant";

            return (
              <div key={index} className="bg-white p-4 rounded-lg mb-4">
                <h6 className="font-medium text-gray-800 mb-2">
                  {`${paxTypeLabel} (${pax.paxType}) ${displayNumber}`}
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(pax)
                    .filter(
                      (field) =>
                        field !== "serviceReference" &&
                        field !== "addressCountryCode" &&
                        ![
                          "paxType",
                          "seatPref",
                          "mealPref",
                          "ffNumber",
                          "ktn",
                          "redressNo",
                          "email",
                          "mobile",
                          "areaCode",
                        ].includes(field)
                    )
                    .map((field) => (
                      <div key={field} className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">
                          {formatLabel(field)}
                        </label>
                        {renderInputField(index, field, pax[field])}
                      </div>
                    ))}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default PassengerForm;
