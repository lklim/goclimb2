import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import "./PointShop.css";

function PointShop() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [pointBalance, setPointBalance] = useState(0);
  const [items, setItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(`User fetch error: ${userError.message}`);
        if (!user) {
          console.log("No user found, redirecting to login...");
          navigate("/login", { replace: true });
          return;
        }
        console.log("User fetched:", user.id);
        setUserId(user.id);
      } catch (err) {
        console.error("Error fetching user:", err.message);
        setError(`Failed to load user data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch user's point balance
        console.log("Fetching points for user:", userId);
        const { data: pointsData, error: pointsError } = await supabase
          .from("points")
          .select("points")
          .eq("user_id", userId);
        console.log("Raw points data:", pointsData);
        console.log("Raw points error:", pointsError);
        if (pointsError) throw new Error(`Points fetch error: ${pointsError.message}`);
        if (!pointsData || pointsData.length === 0) {
          throw new Error("No points data found for user");
        }
        console.log("Points data:", pointsData[0]);
        setPointBalance(pointsData[0].points || 0);

        // Fetch point shop items
        console.log("Fetching shop items...");
        const { data: shopItems, error: itemsError } = await supabase
          .from("point_shop_items")
          .select("*")
          .order("point_cost", { ascending: true });
        if (itemsError) throw new Error(`Items fetch error: ${itemsError.message}`);
        console.log("Shop items:", shopItems);
        setItems(shopItems || []);

        // Fetch purchased items
        console.log("Fetching purchased items for user:", userId);
        const { data: purchasedData, error: purchasedError } = await supabase
          .from("purchased_items")
          .select(`
            *,
            point_shop_items (
              item_name,
              item_description,
              item_picture,
              point_cost
            )
          `)
          .eq("user_id", userId);
        if (purchasedError) throw new Error(`Purchased items fetch error: ${purchasedError.message}`);
        console.log("Purchased items:", purchasedData);
        setPurchasedItems(purchasedData || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError(`Failed to load Point Shop: ${err.message}`);
      } finally {
        console.log("Fetch complete, setting loading to false");
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handlePurchase = async (item) => {
    if (pointBalance < item.point_cost) {
      alert("Not enough points to purchase this item!");
      return;
    }

    try {
      console.log("Purchasing item:", item.id);
      // Deduct points
      const { data: pointsData, error: pointsError } = await supabase
        .from("points")
        .select("points")
        .eq("user_id", userId);
      console.log("Raw points data (purchase):", pointsData);
      console.log("Raw points error (purchase):", pointsError);
      if (pointsError) throw new Error(`Points fetch error: ${pointsError.message}`);
      if (!pointsData || pointsData.length === 0) {
        throw new Error("No points data found for user during purchase");
      }
      const newPoints = pointsData[0].points - item.point_cost;
      console.log("Updating points to:", newPoints);
      const { error: updateError } = await supabase
        .from("points")
        .update({ points: newPoints, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (updateError) throw new Error(`Points update error: ${updateError.message}`);

      // Record purchase
      console.log("Recording purchase for item:", item.id);
      const { error: purchaseError } = await supabase
        .from("purchased_items")
        .insert({ user_id: userId, item_id: item.id });
      if (purchaseError) throw new Error(`Purchase error: ${purchaseError.message}`);

      // Update state
      setPointBalance(newPoints);
      console.log("Fetching updated purchased items...");
      const { data: updatedPurchases, error: fetchError } = await supabase
        .from("purchased_items")
        .select(`
          *,
          point_shop_items (
            item_name,
            item_description,
            item_picture,
            point_cost
          )
        `)
        .eq("user_id", userId);
      if (fetchError) throw new Error(`Updated purchases fetch error: ${fetchError.message}`);
      setPurchasedItems(updatedPurchases || []);

      alert(`Successfully purchased ${item.item_name}!`);
    } catch (err) {
      console.error("Error purchasing item:", err.message);
      alert(`Failed to purchase item: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="point-shop-page">
        <Navbar />
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="point-shop-page">
        <Navbar />
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="point-shop-page">
      <Navbar />
      <h2>Point Shop</h2>
      <div className="point-balance">
        <p>Your Point Balance: {pointBalance} points</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="shop-items-section">
        <h3>Available Items</h3>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="shop-item-card">
              <img
                src={item.item_picture || "/images/default-item.png"}
                alt={item.item_name}
                className="shop-item-image"
              />
              <div className="shop-item-info">
                <h4>{item.item_name}</h4>
                <p>{item.item_description}</p>
                <p className="point-cost">Cost: {item.point_cost} points</p>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={pointBalance < item.point_cost}
                >
                  Purchase
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No items available in the shop.</p>
        )}
      </div>
      <div className="purchased-items-section">
        <h3>Purchased Items</h3>
        {purchasedItems.length > 0 ? (
          purchasedItems.map((purchase) => (
            <div key={purchase.id} className="shop-item-card">
              <img
                src={
                  purchase.point_shop_items?.item_picture ||
                  "/images/default-item.png"
                }
                alt={purchase.point_shop_items?.item_name}
                className="shop-item-image"
              />
              <div className="shop-item-info">
                <h4>{purchase.point_shop_items?.item_name}</h4>
                <p>{purchase.point_shop_items?.item_description}</p>
                <p className="point-cost">
                  Cost: {purchase.point_shop_items?.point_cost} points
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No items purchased yet.</p>
        )}
      </div>
    </div>
  );
}

export default PointShop;