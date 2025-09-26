import React from "react";
import styles from "./OnwardFlights.module.css";
import { TbMapPinFilled } from "react-icons/tb";
import { MdGpsFixed } from "react-icons/md";
import { CiClock2 } from "react-icons/ci";

const FlightGroup = ({ segments, flight, title }) => {
  const calculateStopoverDuration = (arrivalTime, nextDepartureTime) => {
    const arrival = new Date(arrivalTime);
    const departure = new Date(nextDepartureTime);
    const diffMs = departure - arrival;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>{title}</h4>
      <div className={styles.flightDetails}>
        {/* Left Section: schedule */}
        <div className={styles.flightSchedule}>
          {segments.map((seg, index) => (
            <React.Fragment key={index}>
              <div className={styles.scheduleBlock}>
                <span>{new Date(seg.departureOn).toLocaleString()}</span>
                <span>{Math.floor(seg.duration / 60)}h {seg.duration % 60}m</span>
                <span>{new Date(seg.arrivalOn).toLocaleString()}</span>
              </div>

              {index < segments.length - 1 && (
                <div className={styles.stopover}>
                  <CiClock2 />
                  <span>
                    {calculateStopoverDuration(
                      seg.arrivalOn, 
                      segments[index + 1].departureOn
                    )}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right Section: route */}
        <div className={styles.flightRoute}>
          {segments.map((seg, index) => (
            <React.Fragment key={index}>
              <div className={styles.flightSegment}>
                <div className={styles.flightPath}>
                  <MdGpsFixed className={styles.icon} />
                  <div className={styles.verticalLine} />
                  <TbMapPinFilled className={styles.icon} />
                </div>
                <div className={styles.flightInfo}>
                  <span className={styles.airportCode}>{seg.origin}</span>
                  {seg.depTerminal && <span className={styles.terminal}>Terminal: {seg.depTerminal}</span>}
                  <span className={styles.airline}>
                    {flight.airline} {seg.flightNum}
                  </span>
                  <span className={styles.airportCode}>{seg.destination}</span>
                </div>
              </div>

              {index < segments.length - 1 && (
                <div className={styles.stopoverDetails}>
                  <h6>Stopover, Waiting at {seg.destination}</h6>
                  <span className={styles.duration}>
                    Duration: {calculateStopoverDuration(seg.arrivalOn, segments[index + 1].departureOn)}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const OnwardFlights = ({ flight }) => {
  if (!flight.segGroups?.length) return null;

  return (
    <>
      {flight.segGroups.map((group, idx) => {
        const title = group.segs[0]?.isReturn ? "Return Flight" : "Onward Flight";
        return <FlightGroup key={idx} segments={group.segs} flight={flight} title={title} />;
      })}
    </>
  );
};

export default OnwardFlights;
