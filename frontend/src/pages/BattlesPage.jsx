import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserBattles } from "../api/battleApi";
import BattleCard from "../components/BattleCard";
import AppShell from "../components/AppShell";
import { ArrowLeft, Swords, Calendar } from "lucide-react";
import "../styles/BattlesPage.css";

function BattlesPage() {
  const navigate = useNavigate();

  const [battles, setBattles] = useState([]);
  const [filter, setFilter] = useState("active"); // active | pending | completed
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login...");
      window.location.href = "/";
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
    <AppShell>
      <div className="battles-page animate-fade-in" style={{ padding: 0 }}>
        <button className="back-btn" onClick={() => navigate("/app")}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="battles-header" style={{ marginBottom: "24px" }}>
          <h1 className="battles-title" style={{ fontSize: "26px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <Swords size={28} style={{ color: "var(--color-primary)" }} /> Battle Arena
          </h1>
          <p className="battles-subtitle" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Challenge other groups, track live scores, and maintain consistency.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "8px", background: "rgba(226, 232, 240, 0.5)", padding: "4px", borderRadius: "var(--radius-md)", width: "fit-content", marginBottom: "24px" }}>
          {["active", "pending", "completed"].map((t) => (
            <button
              key={t}
              className={filter === t ? "active" : ""}
              onClick={() => setFilter(t)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 600,
                color: filter === t ? "var(--color-primary)" : "var(--color-text-secondary)",
                background: filter === t ? "white" : "transparent",
                boxShadow: filter === t ? "var(--shadow-sm)" : "none",
                cursor: "pointer"
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Battles List */}
        {battles.length === 0 ? (
          <div className="empty-state-modern" style={{ padding: "40px" }}>
            <div className="empty-state-icon">⚔️</div>
            <div className="empty-state-title">No {filter} battles yet</div>
            <p className="empty-state-description">Challenge other groups or join an existing battle to start competing!</p>
          </div>
        ) : (
          <div className="battle-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {battles.map((battle) => (
              <BattleCard key={battle._id} battle={battle} />
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default BattlesPage;