import { useEffect, useState } from "react";
import { getBattleProgress } from "../api/battleApi";
import { Swords, Trophy, Flame, AlertCircle } from "lucide-react";
import "../styles/BattleLeaderboard.css";

function BattleLeaderboard({ battleId }) {
  const [data, setData] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = userInfo?.token;

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBattleProgress(battleId, token);
      setData(res);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [battleId, token]);

  if (!data || !data.groupA) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div className="loading-spinner-circle" style={{ margin: "0 auto 12px" }}></div>
        <p style={{ color: "var(--color-text-secondary)" }}>Loading battle progress...</p>
      </div>
    );
  }

  const scoreA = data.groupA?.score || 0;
  const scoreB = data.groupB?.score || 0;
  const totalScore = scoreA + scoreB;
  const percentA = totalScore > 0 ? Math.round((scoreA / totalScore) * 100) : 50;

  return (
    <div className="battle-leaderboard-container-modern" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* HEADER VS */}
      <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", padding: "24px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", textAlign: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Active Clash
        </span>
        <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span>{data.groupA?.name}</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: "16px" }}>vs</span>
          <span>{data.groupB?.name || "Waiting..."}</span>
        </h2>

        {/* COMPARISON CHART */}
        {data.groupB ? (
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", fontWeight: 700 }}>
              <span style={{ color: "var(--color-primary)" }}>{scoreA} pts</span>
              <span style={{ color: "#3B82F6" }}>{scoreB} pts</span>
            </div>
            <div style={{ height: "10px", background: "var(--color-border)", borderRadius: "99px", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${percentA}%`, background: "var(--color-primary)", height: "100%", transition: "width 0.4s ease" }}></div>
              <div style={{ width: `${100 - percentA}%`, background: "#3B82F6", height: "100%", transition: "width 0.4s ease" }}></div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "16px", padding: "12px", background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)", fontSize: "13px" }}>
            ⏳ Waiting for an opponent to accept the challenge...
          </div>
        )}
      </div>

      {/* LEADER BANNER */}
      {data.leader && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--color-success-bg)", border: "1px solid var(--color-success)", color: "var(--color-success)", padding: "14px 20px", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "14px", boxShadow: "var(--shadow-sm)" }}>
          <Trophy size={18} />
          <span>{data.leader} is leading the battle by {data.leadBy} points!</span>
        </div>
      )}

      {/* TWO TEAM MEMBERS LISTS SIDE-BY-SIDE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="two-col-grid-dashboard">
        
        {/* GROUP A CARD */}
        <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px", color: "var(--color-primary)" }}>
            🛡️ {data.groupA?.name}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.groupA?.members?.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--color-bg-base)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>{m.user.name}</span>
                <span style={{ fontSize: "12px", fontWeight: 700 }}>
                  {m.weeklyStreak === 0 ? (
                    <span style={{ color: "var(--color-text-muted)" }}>❌ Missed</span>
                  ) : (
                    <span style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: "2px" }}><Flame size={12} fill="var(--color-success)" /> {m.weeklyStreak}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* GROUP B CARD */}
        <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px", color: "#3B82F6" }}>
            🛡️ {data.groupB?.name || "Opponent Group"}
          </h3>
          {data.groupB ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.groupB?.members?.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--color-bg-base)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{m.user.name}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>
                    {m.weeklyStreak === 0 ? (
                      <span style={{ color: "var(--color-text-muted)" }}>❌ Missed</span>
                    ) : (
                      <span style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: "2px" }}><Flame size={12} fill="var(--color-success)" /> {m.weeklyStreak}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "120px", color: "var(--color-text-secondary)" }}>
              <AlertCircle size={24} style={{ color: "var(--color-text-muted)", marginBottom: "8px" }} />
              <span style={{ fontSize: "13px" }}>Waiting for opponent group to join the clash.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default BattleLeaderboard;