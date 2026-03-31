import { useEffect, useState } from "react";
import { getBattleProgress } from "../api/battleApi";
import { useNavigate } from "react-router-dom";
import "../styles/BattleCard.css"; 

function BattleCard({ battle }) {
  const [progress, setProgress] = useState(null);
  const token = localStorage.getItem("token");
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

  if (!progress) return <p className="battle-loading">Loading...</p>;

  return (
    <div className="battle-card">

      {/* Teams */}
      <div className="battle-header">
        <span className="team-name team-a">
          {progress.groupA.name}
        </span>

        <span className="vs">VS</span>

        <span className="team-name team-b">
          {progress.groupB?.name || "Waiting..."}
        </span>
      </div>

      {/* Leader */}
      {progress.leader && (
        <div className="leader-box">
          🔥 {progress.leader} leading by{" "}
          <span className="lead-score">{progress.leadBy}</span>
        </div>
      )}

      {/* Button */}
      <button
        className="view-btn"
        onClick={() => navigate(`/battle/${battle._id}`)}
      >
        View Battle ⚔️
      </button>

    </div>
  );
}

export default BattleCard;