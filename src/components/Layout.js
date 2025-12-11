import React from 'react';
import BottomNavigation from './BottomNavigation';

const Layout = ({ children, showNavigation = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className={`${showNavigation ? 'pb-20' : ''}`}>
        {children}
      </div>
      {showNavigation && <BottomNavigation />}
    </div>
  );
};

export default Layout;