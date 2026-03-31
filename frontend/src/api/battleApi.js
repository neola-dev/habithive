const BASE_URL = "http://localhost:5000/api/battles";
const getToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token;
};

export const getUserBattles = async (token, status = "active") => {
  const res = await fetch(`${BASE_URL}?status=${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

export const getBattleProgress = async (battleId) => {
    const token=getToken();
  const res = await fetch(`${BASE_URL}/${battleId}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return await res.json();
};