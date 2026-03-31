import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
const ActivityFeed = ({ groupId }) => {

  const [activities,setActivities] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(()=>{

    const fetchActivities = async()=>{

      const res = await fetch(
        `http://localhost:5000/api/activity/${groupId}`,
        {
          headers:{
            Authorization:`Bearer ${userInfo.token}`
          }
        }
      );

      const data = await res.json();
      console.log(data);
      setActivities(data);

    }

    fetchActivities();

  },[groupId]);

  return(

    <div className="activity-feed">

      <h2>Group Activity</h2>

      {activities.map((activity)=>(
        <div key={activity._id} className="activity-item">

          <p>{activity.message}</p>
          <span>
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>
      ))}

    </div>

  )
}

export default ActivityFeed;