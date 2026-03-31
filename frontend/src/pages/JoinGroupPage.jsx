import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/JoinGroupPage.css";

const JoinGroupPage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  // Redirect to login if not logged in
  useEffect(() => {
    if (!userInfo) {
      navigate("/login", {
        state: { redirect: `/invite/${inviteCode}` },
      });
    }
  }, [userInfo, navigate, inviteCode]);

  // Fetch group details only if logged in
  useEffect(() => {
    if (!userInfo) return;

    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/invite/${inviteCode}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setGroup(data);
        } else {
          setGroup(null); // group not found or invalid invite
        }
      } catch (err) {
        console.log(err);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [inviteCode, userInfo]);

  // Join group handler
  const handleJoin = async () => {
    if (!userInfo) return;

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

        // Refresh group details
        const updatedRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/invite/${inviteCode}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        const updatedGroup = await updatedRes.json();
        setGroup(updatedGroup);
      } else {
        setMessage(data.message || "Failed to join group");
      }
    } catch (err) {
      console.log(err);
      setMessage("An error occurred while joining the group.");
    }
  };

  // ------------------- RENDER -------------------

  // Wait until redirect happens if not logged in
  if (!userInfo) return null;

  if (loading) return <h2 className="loading-text">Loading group...</h2>;
  if (!group) return <h2 className="loading-text">Group not found</h2>;

  return (
    <div className="join-group-page">
      <div className="group-card-container">
        <h1 className="group-title">{group.name}</h1>
        <p className="group-desc">{group.description}</p>
        <p className="group-creator">
          Created by: <b>{group.creator?.name}</b>
        </p>
        <p className="group-members">
          Members: {group.members?.length || 0}
        </p>

        <button className="primary-btn join-btn" onClick={handleJoin}>
          Join Group
        </button>
        {message && <p className="info">{message}</p>}
      </div>
    </div>
  );
};

export default JoinGroupPage;
