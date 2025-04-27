import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/680e115c92d402a8f71dea2f');
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching user data');
      }
    };

    fetchUserData();
  }, [userId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{user.name}'s Profile</h1>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Location: {user.location}</p>
      <p>Location Preference: {user.locationPreference}</p>
      <p>Education: {user.education}</p>
      <p>Professional Stage: {user.professionalStage}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default UserProfile;
