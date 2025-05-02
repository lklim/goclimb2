import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import supabase from "./supabaseClient";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import Navbar from "./components/Navbar";
import { useParams } from "react-router-dom";
import { getDistance } from "geolib";

const WEATHER_API_KEY = "c2d5fc58f652fc3214d931e830f6d7fa";

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <>
      {"🌟".repeat(fullStars)}
      {halfStar && "⭐"}
      {"☆".repeat(emptyStars)}
      <span> ({rating.toFixed(1)}/5)</span>
    </>
  );
};

function Map() {
  const { cragId } = useParams();
  const [crags, setCrags] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [selectedCrag, setSelectedCrag] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [canClock, setCanClock] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [attemptType, setAttemptType] = useState("Sent");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    const fetchCrags = async () => {
      const { data, error } = await supabase.from("crags").select("*");
      if (!error) {
        setCrags(data);
        fetchWeatherForCrags(data);
      }
    };
    fetchCrags();
  }, []);

  const fetchWeatherForCrags = async (crags) => {
    let weatherUpdates = {};
    for (let crag of crags) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${crag.latitude}&lon=${crag.longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await res.json();
        weatherUpdates[crag.id] = data;
      } catch (error) {
        console.error("Weather error:", error);
      }
    }
    setWeatherData(weatherUpdates);
  };

  useEffect(() => {
    if (cragId) {
      const crag = crags.find((c) => c.id === parseInt(cragId));
      setSelectedCrag(crag);
    }
  }, [cragId, crags]);

  useEffect(() => {
    if (selectedCrag && userLocation) {
      const distance = getDistance(
        { latitude: selectedCrag.latitude, longitude: selectedCrag.longitude },
        { latitude: userLocation.latitude, longitude: userLocation.longitude }
      );
      setCanClock(distance <= 100);
    }
  }, [selectedCrag, userLocation]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.error("Geolocation error:", err)
    );
  }, []);

  useEffect(() => {
    if (selectedCrag) {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCrag.latitude}&lon=${selectedCrag.longitude}&appid=${WEATHER_API_KEY}&units=metric`
      )
        .then((res) => res.json())
        .then((data) => setCurrentWeather(data))
        .catch((err) => console.error("Weather fetch error:", err));
    }
  }, [selectedCrag]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", user.id)
          .single();
  
        if (!error && data) {
          setAccountType(data.account_type);
        }
      }
    };
  
    fetchUserData();
  }, []);  

  const handleClockSubmit = async () => {
    const { data: userSession } = await supabase.auth.getUser();
    const userId = userSession?.user?.id;

    if (!userId || !selectedCrag) return;

    let photoUrl = null;

    if (photo) {
      const ext = photo.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { data, error: uploadErr } = await supabase.storage
        .from("clocked-climb-images")
        .upload(fileName, photo);

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("clocked-climb-images")
          .getPublicUrl(data.path);
        photoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("climb_logs").insert({
      user_id: userId,
      crag_id: selectedCrag.id,
      attempt_type: attemptType,
      notes: notes,
      photo_url: photoUrl,
    });

    if (!error) {
      setShowClockModal(false);
      setNotes("");
      setPhoto(null);
      setShowSuccessPopup(true); // Show success message
      setTimeout(() => setShowSuccessPopup(false), 3000); // Hide after 3s
    } else {
      console.error("Clock log error:", error.message);
    }
  };

  return (
    <div className="map-container">
      <Navbar />
      <div className="map-content">
        <div className={`sidebar ${selectedCrag ? "visible" : ""}`}>
          {selectedCrag ? (
            <div className="sidebar-content">
              {selectedCrag.image_url && (
                <div className="image-container">
                  <img
                    src={selectedCrag.image_url}
                    alt={selectedCrag.name}
                    className="crag-image"
                  />
                </div>
              )}
              <div className="crag-info-box">
                <h2>{selectedCrag.name}</h2>
                <p><strong>Description:</strong> {selectedCrag.description}</p>
                <p><strong>Difficulty:</strong> {selectedCrag.difficulty}</p>
                <p><strong>Rating:</strong> {selectedCrag.user_rating ? renderStars(selectedCrag.user_rating) : "No rating yet"}</p>
                <hr className="divider" />
                {accountType && [1, 2, 3].includes(accountType) ? (
                  currentWeather && (
                    <div className="weather-info">
                      <h3>Current Weather</h3>
                      <p><strong>Condition:</strong> {currentWeather.weather[0].description}</p>
                      <p><strong>Temperature:</strong> {currentWeather.main.temp}°C</p>
                      <p><strong>Wind:</strong> {currentWeather.wind.speed} m/s</p>
                    </div>
                  )
                ) : (
                  <div className="locked-parameter">
                    <h3>Current Weather</h3>
                    <p>Upgrade to premium to view weather or use points.</p>
                  </div>
                )}
                <div className="button-container">
                {accountType && [1, 2, 3].includes(accountType) ? (
                    selectedCrag?.id && (
                      <button 
                        className="ar-button"
                        onClick={() => {
                          const cragId = selectedCrag.id;

                          const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                          const isMobileUserAgent = /android|iphone|ipad|ipod/i.test(userAgent);
                          const isTouchDevice = ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 1);
                          const isSmallScreen = window.innerWidth < 800;
                          const isMobile = isMobileUserAgent || isTouchDevice || isSmallScreen;

                          const fallbackUrl = encodeURIComponent('https://www.google.com/'); // your real fallback here
                          const deepLink = `intent://open-ar?id=${cragId}#Intent;scheme=unity;package=com.ARTest.MobileAR;action=android.intent.action.VIEW;S.browser_fallback_url=${fallbackUrl};end;`;

                          if (isMobile) {
                            window.location.href = deepLink;
                          } else {
                            alert("Please use a mobile device to open AR features.");
                          }
                        }}
                      >
                        View AR
                      </button>
                    )
                  ) : (
                    <div className="locked-parameter">
                      <p>Upgrade to premium to view <strong>AR experience</strong> or use points.</p>
                    </div>
                  )}
                  {canClock && (
                    <button className="clock-button" onClick={() => setShowClockModal(true)}>
                      Clock a Climb
                    </button>
                  )}
                  <button className="close-button" onClick={() => setSelectedCrag(null)}>
                    Close ⛌
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sidebar-placeholder">
              <p>Select a crag to view details.</p>
            </div>
          )}
        </div>

        <MapContainer center={[1.3521, 103.8198]} zoom={12} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {crags.map((crag) => (
            <Marker
              key={crag.id}
              position={[crag.latitude, crag.longitude]}
              eventHandlers={{
                click: () => setSelectedCrag(crag),
              }}
            >
              <Tooltip>{crag.name}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {showClockModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Clock a Climb</h3>
            <label>Attempt Type:</label>
            <select value={attemptType} onChange={(e) => setAttemptType(e.target.value)}>
              <option value="Sent">Sent</option>
              <option value="Attempted">Attempted</option>
              <option value="Project">Project</option>
            </select>
            <label>Notes:</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            <label>Photo (optional):</label>
            <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
            <div className="modal-buttons">
              <button onClick={handleClockSubmit}>Submit</button>
              <button onClick={() => setShowClockModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup">
            Climb successfully logged!
        </div>
      )}
    </div>
  );
}

export default Map;
