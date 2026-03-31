import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/JoinGroupPage.css";

const JoinGroupPage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [userInfo, setUserInfo] = useState(undefined);
  useEffect(() => {
  const storedUser = localStorage.getItem("userInfo");
  setUserInfo(storedUser ? JSON.parse(storedUser) : null);
}, []);

  // 🔐 Redirect if not logged in
  useEffect(() => {
  
    if (userInfo===null) {
      navigate("/login", {
        state: {
          redirect: `/invite/${inviteCode}`,
          inviteMessage: "⚠️ Login to join the invited group",
        },
      });
    }
  }, [userInfo, navigate, inviteCode]);

  // 🚀 Fetch group

  useEffect(() => {
    if (userInfo === undefined || userInfo===null) return;

    const fetchGroup = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/invite/${inviteCode}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) setGroup(data);
        else setGroup(null);

      } catch (err) {
        console.log(err);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [inviteCode, userInfo]);

  const handleJoin = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups/invite/${inviteCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Joined Group Successfully!");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!userInfo) return null;
  if (loading) return <h2 className="loading-text">Loading group...</h2>;
  if (!group) return <h2 className="loading-text">Group not found</h2>;

  return (
    <div className="join-group-page">
      <div className="group-card-container">
        <h1>{group.name}</h1>
        <p>{group.description}</p>
        <p>👤 {group.creator?.name}</p>
        <p>👥 {group.members?.length}</p>

        <button onClick={handleJoin}>Join Group</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default JoinGroupPage;
