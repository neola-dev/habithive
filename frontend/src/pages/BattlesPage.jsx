import { useEffect, useState } from "react";
import { getUserBattles } from "../api/battleApi";
import BattleCard from "../components/BattleCard";
import "../styles/BattlesPage.css";

function BattlesPage() {

  const [battles, setBattles] = useState([]);
  const [filter, setFilter] = useState("active"); // active | pending | completed
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  useEffect(() => {
  if (!token) {
    console.log("No token found, redirecting to login...");
    window.location.href = "/login"; // redirect to login page
    return;
  }

  const fetchData = async () => {
    try {
      const data = await getUserBattles(token, filter);
      console.log("API response:", data);
      setBattles(data.battles || []);
    } catch (err) {
      console.error("Error fetching battles:", err);
    }
  };

  fetchData();
}, [token, filter]);

  return (
    <div className="battles-page">

      <h2 className="battles-title">🔥 Your Battles</h2>

      {/* Filter Buttons */}
      <div className="battle-filters">
        <button
          className={filter === "active" ? "active" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      {/* Battles List */}
      {battles.length === 0 ? (
        <div className="no-battles">
          <p>No {filter} battles 😔</p>
          {filter === "active" && <p>Create or join one to compete!</p>}
        </div>
      ) : (
        <div className="battle-grid">
          {battles.map((battle) => (
            <BattleCard key={battle._id} battle={battle} />
          ))}
        </div>
      )}

    </div>
  );
}

export default BattlesPage;