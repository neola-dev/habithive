import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainApp from "./MainApp";
import ProtectedRoute from "./components/ProtectedRoute";
import GroupPage from "./pages/GroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import LeaderboardPage from "./pages/leaderboardPage";
import JoinBattle from "./pages/JoinBattle";
import CreateBattle from "./pages/CreateBattle";
import BattlesPage from "./pages/BattlesPage";
import BattlePage from "./pages/BattlePage";
import AuthRedirect from "./components/AuthRedirect";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />

        <Route path="/group/:id" element={<GroupPage />} />

        {/* ✅ FIXED: wrapped with AuthRedirect */}
        <Route
          path="/invite/:inviteCode"
          element={
            <AuthRedirect>
              <JoinGroupPage />
            </AuthRedirect>
          }
        />

        <Route path="/groups/:groupId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/create-battle" element={<CreateBattle />} />
        <Route path="/battles" element={<BattlesPage />} />

        {/* ✅ FIXED: wrapped with AuthRedirect */}
        <Route
          path="/battle/invite/:code"
          element={
            <AuthRedirect>
              <JoinBattle />
            </AuthRedirect>
          }
        />

        <Route path="/battle/:battleId" element={<BattlePage />} />

        {/* ✅ ALWAYS LAST */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;