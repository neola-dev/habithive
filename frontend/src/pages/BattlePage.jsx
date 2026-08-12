import { useParams, useNavigate } from "react-router-dom";
import BattleLeaderboard from "../components/BattleLeaderboard";
import AppShell from "../components/AppShell";
import { ArrowLeft } from "lucide-react";

function BattlePage() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  
  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} className="animate-fade-in">
        <button className="back-btn" onClick={() => navigate("/battles")} style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Battles
        </button>
        <BattleLeaderboard battleId={battleId} />
      </div>
    </AppShell>
  );
}

export default BattlePage;