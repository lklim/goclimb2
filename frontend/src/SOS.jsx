import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import emailjs from "@emailjs/browser";
import Navbar from "./components/Navbar";
// import "./Sos.css";
import "./SOS.css";

function Sos() {
  const [userLocation, setUserLocation] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState(null); // For storing the SOS status
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setError("Failed to retrieve your location. Please enable location services and try again.");
      }
    );
  }, []);

  // Fetch the current SOS status when the component mounts
  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('sos')
        .select('status')
        .order('created_at', { ascending: false }) // Get the most recent SOS
        .limit(1);

      if (error) {
        setError("Failed to fetch SOS status.");
        return;
      }

      if (data && data.length > 0) {
        setStatus(data[0].status); // Set the status (either 'pending' or 'closed')
      }
    };

    fetchStatus();
  }, [sent]); // Re-run when the SOS is sent

  const handleSosClick = async () => {
    if (!userLocation) {
      alert("Getting your location... Please try again in a moment.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be logged in to send SOS.");
        return;
      }

      const { error: insertError } = await supabase
        .from('sos')
        .insert([
          {
            user_id: user.id,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            status: "pending"
          }
        ]);

      if (insertError) {
        setError("Failed to save SOS location.");
        return;
      }

      // Send Email
      try {
        await emailjs.send('service_pxul3is', 'template_086b98n', {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          maps_link: `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`,
        }, 'LwO0xQt55hX0RpQV1');

        setSent(true);
        setSuccessMessage("SOS has been sent successfully!");

      } catch (emailError) {
        setError("Failed to send Email.");
      }

    } catch (error) {
      setError("Unexpected error sending SOS.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sos-page">
      <Navbar />
      <div className="sos-container">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <button
          className="sos-button"
          onClick={handleSosClick}
          disabled={sending || sent || status === "pending" || !userLocation} // Disable if location is not yet available
        >
          {sending ? (
            <div className="spinner"></div>
          ) : status === "pending" ? (
            "Help is on the way" // Button text when status is 'pending'
          ) : sent ? (
            "SOS Sent"
          ) : (
            "Send SOS"
          )}
        </button>

        {/* Show message below the button */}
        {!userLocation && <div className="message">Retrieving your location...</div>}
        {status === "pending" && <div className="message">Help is on the way!</div>}
      </div>
    </div>
  );
}

export default Sos;
