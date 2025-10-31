import React, { useEffect, useState, useRef } from "react";

const LineLoader = ({ loading }) => {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setWidth(0);

      intervalRef.current = setInterval(() => {
        setWidth((prev) => {
          // Slowly increase, more slowly as it nears 90%
          const increment = (90 - prev) / 10;
          return Math.min(prev + increment, 90);
        });
      }, 200);
    } else {
      clearInterval(intervalRef.current);
      setWidth(100);

      // Fade out after width reaches 100%
      const timeout = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 400);

      return () => clearTimeout(timeout);
    }

    return () => clearInterval(intervalRef.current);
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "110px",
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
          backgroundColor: "#1e1a4d",
          transition: "width 0.2s ease-out",
        }}
      />
    </div>
  );
};

export default LineLoader;
