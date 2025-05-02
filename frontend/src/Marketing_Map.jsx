import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import supabase from "./supabaseClient";
import "leaflet/dist/leaflet.css";
import "./MarketingMap.css";
import Navbar from "./components/Navbar";

function Marketing_Map() {
  const [crags, setCrags] = useState([]);

  useEffect(() => {
    const fetchCrags = async () => {
      const { data, error } = await supabase.from("crags").select("*");
      if (!error) {
        setCrags(data);
      } else {
        console.error("Error fetching crags:", error);
      }
    };
    fetchCrags();
  }, []);

  return (
    <div className="marketing-map-wrapper">
      <Navbar />
      <div className="map-area">
        <MapContainer
          center={[2.5, 110]} // Adjusted center to match your screenshot
          zoom={6}
          scrollWheelZoom={true}
          className="marketing-map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {crags.map((crag) => (
            <Marker
              key={crag.id}
              position={[crag.latitude, crag.longitude]}
            >
              <Tooltip>{crag.name}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Marketing_Map;
