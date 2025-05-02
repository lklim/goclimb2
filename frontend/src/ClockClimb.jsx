import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import "./ClockClimb.css";

function ClockClimb() {
  const [crags, setCrags] = useState([]);
  const [selectedCrag, setSelectedCrag] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [attemptType, setAttemptType] = useState("Sent");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const DISTANCE_LIMIT = 100; // in meters

  useEffect(() => {
    const fetchCrags = async () => {
      const { data, error } = await supabase.from("crags").select("*");
      if (!error) setCrags(data);
    };

    fetchCrags();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location", error);
        setMessage("Location access denied.");
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleSubmit = async () => {
    if (!selectedCrag || !userLocation) {
      setMessage("Please select a crag and allow location access.");
      return;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      selectedCrag.latitude,
      selectedCrag.longitude
    );

    if (distance > DISTANCE_LIMIT) {
      setMessage("You must be within 100 meters of the crag to log your climb.");
      return;
    }

    let imageUrl = null;

    if (photo) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("climb-photos")
        .upload(fileName, photo);

      if (error) {
        console.error("Image upload failed", error);
        setMessage("Failed to upload image.");
        return;
      }

      const { publicUrl } = supabase.storage
        .from("climb-photos")
        .getPublicUrl(data.path).data;
      imageUrl = publicUrl;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("climb_logs").insert({
      user_id: userData.user.id,
      crag_id: selectedCrag.id,
      attempt_type: attemptType,
      notes: notes,
      photo_urls: imageUrl ? [imageUrl] : [],
    });

    if (!error) {
      setMessage("Climb logged successfully!");
      setNotes("");
      setPhoto(null);
    } else {
      console.error(error);
      setMessage("Error logging climb.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="clock-climb-container">
        <h1>Clock a Climb</h1>

        <div className="form-group">
          <label>Select Crag:</label>
          <select
            value={selectedCrag?.id || ""}
            onChange={(e) =>
              setSelectedCrag(crags.find((c) => c.id === parseInt(e.target.value)))
            }
          >
            <option value="">-- Choose a crag --</option>
            {crags.map((crag) => (
              <option key={crag.id} value={crag.id}>
                {crag.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Attempt Type:</label>
          <select value={attemptType} onChange={(e) => setAttemptType(e.target.value)}>
            <option value="Sent">Sent</option>
            <option value="Attempted">Attempted</option>
            <option value="Project">Project</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes:</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it go?"
          />
        </div>

        <div className="form-group">
          <label>Optional Photo:</label>
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Log Climb
        </button>

        {message && <p className="message">{message}</p>}
      </div>
    </>
  );
}

export default ClockClimb;
