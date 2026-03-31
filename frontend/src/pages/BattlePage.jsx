import { useParams } from "react-router-dom";
import BattleLeaderboard from "../components/BattleLeaderboard";

function BattlePage() {

  const { battleId } = useParams();
  
  return (
    <div className="p-4">
      <BattleLeaderboard battleId={battleId} />
    </div>
  );
}

export default BattlePage;