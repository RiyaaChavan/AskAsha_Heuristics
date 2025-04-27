import React, { useEffect, useState } from 'react';

export default function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Make sure userId is valid before making the request
        if (!userId) {
          setError('No user ID provided');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/profile/${userId}`);
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl font-semibold">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl font-semibold">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a35a79] via-[#854d6d] to-[#6d3f59] p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Profile</h2>
        <div className="space-y-6">
          <ProfileField label="Name" value={profile.name} />
          <ProfileField label="Email" value={profile.email} />
          <ProfileField label="Phone" value={profile.phone} />
          <ProfileField label="Location" value={profile.location} />
          <ProfileField label="Location Preference" value={profile.locationPreference} />
          <ProfileField label="Gender" value={profile.gender} />
          <ProfileField label="Education" value={profile.education} />
          <ProfileField label="Professional Stage" value={profile.professionalStage} />

          {/* Highlighted Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-[#87c05a] text-white py-1 px-3 rounded-full text-sm font-medium transition-transform hover:scale-105"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 text-right mt-4">
            Joined on {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-medium text-gray-800">{label}:</span>
      <span className="text-gray-700">{value || "Not provided"}</span>
    </div>
  );
}