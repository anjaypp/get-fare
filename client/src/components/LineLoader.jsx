import React, { useEffect, useState } from "react";

const LineLoader = ({ loading }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setWidth(0);
      interval = setInterval(() => {
        setWidth((prev) => (prev < 90 ? prev + Math.random() * 5 : prev));
      }, 100);
    } else {
      setWidth(100);
      const timeout = setTimeout(() => setWidth(0), 300);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div
      style={{
        position: "absolute",
        top: "110px", // adjust based on navbar height
        left: 0,
        height: "4px",
        width: "100%",
        backgroundColor: "#ffffff",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          backgroundColor: "#E5BC3B", 
          transition: "width 0.2s ease-out",
        }}
      />
    </div>
  );
};

export default LineLoader;
