import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import warsaw from "../assets/warsaw.png";

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    window.scrollTo(0,0);
  },[location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>

      {isHome && (
        <div className="flex justify-center pt-12">
          <div className=" rounded-lg px-56">
            <img src={warsaw} alt="Warsaw" className="object-contain" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Layout;
