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
      <section className="px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Offers />
          </div>

          <div className="w-full lg:w-80">
            <RecentSearches />
          </div>
        </div>
      </section>
      <section className="px-8 py-12">
        <Hotels />
      </section>
    </>
  );
};

export default Homepage;
