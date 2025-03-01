//userDashboardTest.js
import React from 'react';
import UserDashboard from './userDashboard';

const UserDashboardTest = ({listings}) => {
  // Mock user data for testing (user dashboard)
  const mockUser = {
    username: "Thapelo",
    email: "test@campus.edu"
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <div>
      <UserDashboard 
        user={mockUser} 
        onLogout={handleLogout}
      />
    </div>
  );
};

export default UserDashboardTest;