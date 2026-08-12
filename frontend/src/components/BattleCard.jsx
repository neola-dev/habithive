import { useEffect, useState } from "react";
import { getBattleProgress } from "../api/battleApi";
import { useNavigate } from "react-router-dom";
import { Swords, Trophy } from "lucide-react";
import "../styles/BattleCard.css"; 

function BattleCard({ battle }) {
  const [progress, setProgress] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = userInfo?.token || localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getBattleProgress(battle._id, token);
        setProgress(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProgress();
  }, [battle._id, token]);

  if (!progress) {
    return (
      <div style={{ background: "white", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-spinner-circle" style={{ width: "24px", height: "24px" }}></div>
      </div>
    );
  }

  const scoreA = progress.groupA?.score || 0;
  const scoreB = progress.groupB?.score || 0;
  const totalScore = scoreA + scoreB;
  const percentA = totalScore > 0 ? Math.round((scoreA / totalScore) * 100) : 50;

  return (
    <div className="battle-card-modern" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
      {/* VS HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
          <Swords size={12} style={{ color: "var(--color-primary)" }} /> Matchup
        </span>
        {progress.status && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-success)", background: "var(--color-success-bg)", padding: "2px 8px", borderRadius: "99px" }}>
            {progress.status}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg-base)", padding: "12px", borderRadius: "var(--radius-md)" }}>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{progress.groupA.name}</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-primary)", marginTop: "2px" }}>{scoreA}</div>
        </div>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--color-text-muted)", padding: "0 12px" }}>VS</div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{progress.groupB?.name || "Waiting..."}</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: scoreB > 0 ? "var(--color-primary)" : "var(--color-text-muted)", marginTop: "2px" }}>{scoreB}</div>
        </div>
      </div>

      {/* Progress visual comparison */}
      {progress.groupB && (
        <div style={{ height: "6px", background: "var(--color-border)", borderRadius: "99px", overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${percentA}%`, background: "var(--color-primary)", height: "100%" }}></div>
          <div style={{ width: `${100 - percentA}%`, background: "#3B82F6", height: "100%" }}></div>
        </div>
      )}

      {/* Leader Box */}
      <div>
        {progress.leader ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--color-success)" }}>
            <Trophy size={14} />
            <span>{progress.leader} leads (+{progress.leadBy})</span>
          </div>
        ) : (
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            ⏳ Waiting for opponent to join...
          </span>
        )}
      </div>

      <button
        className="habit-action-btn"
        style={{ width: "100%", padding: "10px", marginTop: "4px" }}
        onClick={() => navigate(`/battle/${battle._id}`)}
      >
        View Battle Details →
      </button>
    </div>
  );
}

export default BattleCard;