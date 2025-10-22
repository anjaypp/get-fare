import React from "react";
import SearchBox from "../../components/SearchBox";
import styles from "./Homepage.module.css";
import Offers from "../../components/Offers";
import RecentSearches from "../../components/RecentSearches";



import Hotels from "../../components/Hotels";

const Homepage = () => {
  return (
    <>
      {/* Searchbox */}
      <section className={`${styles.searchbox} max-h-[450px]`}>
        <SearchBox />
      </section>
      {/* Offers and Recent Searches*/}
      <section className="grid place-items-center px-10 py-12">
        <div className="max-w-6xl flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Offers />
          </div>

          <div className="w-full lg:w-80">
            <RecentSearches />
          </div>
        </div>
      </section>
      <section className="grid place-items-center px-8 py-12">
        <Hotels />
      </section>
    </>
  );
};

export default Homepage;
