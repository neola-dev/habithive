import { useEffect, useState } from "react";
import { getBattleProgress } from "../api/battleApi";
import "../styles/BattleLeaderboard.css";

function BattleLeaderboard({ battleId }) {

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getBattleProgress(battleId);
      setData(res);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [battleId]);

  if (!data || !data.groupA) {
    return <p className="leaderboard-loading">Loading leaderboard...</p>;
  }

  return (
    <div className="leaderboard-container-battle">

      {/* HEADER */}
      <h2 className="leaderboard-title">
        ⚔️ {data.groupA?.name} vs {data.groupB?.name || "Waiting..."}
      </h2>

      {/* SCORE SECTION */}
      <div className="score-box">
        <div className="score team-a-score">
          <span>{data.groupA?.name}</span>
          <h3>{data.groupA?.score}</h3>
        </div>

        <div className="vs-text">VS</div>

        <div className="score team-b-score">
          <span>{data.groupB?.name || "Waiting..."}</span>
          <h3>{data.groupB?.score || 0}</h3>
        </div>
      </div>

      {/* LEADER */}
      {data.leader && (
        <div className="leader-banner">
          🏆 {data.leader} leading by {data.leadBy}
        </div>
      )}

      {/* LEADERBOARD GRID */}
      <div className="leaderboard-grid">

        {/* GROUP A */}
        <div className="team-card">
          <h3 className="team-title">{data.groupA?.name}</h3>

          {data.groupA?.members?.map((m, i) => (
            <div key={i} className="member-row">
              <span>{m.user.name}</span>
              <span className="streak">
                {m.weeklyStreak === 0 ? "❌ Missed" : `🔥 ${m.weeklyStreak}`}
              </span>
            </div>
          ))}
        </div>

        {/* GROUP B */}
        <div className="team-card">
          {data.groupB ? (
            <>
              <h3 className="team-title">{data.groupB.name}</h3>

              {data.groupB?.members?.map((m, i) => (
                <div key={i} className="member-row">
                  <span>{m.user.name}</span>
                  <span className="streak">
                    {m.weeklyStreak === 0 ? "❌ Missed" : `🔥 ${m.weeklyStreak}`}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p className="waiting-text">Waiting for opponent... ⏳</p>
          )}
        </div>

      </div>

    </div>
  );
}

export default BattleLeaderboard;