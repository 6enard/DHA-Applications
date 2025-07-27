import React from 'react';
import { Shield, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  userProfile?: {
    displayName?: string;
    email?: string;
    role?: string;
  };
  onLogout?: () => void;
  showAuth?: boolean;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  userProfile, 
  onLogout, 
  showAuth = false,
  onSignIn,
  onSignUp
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {userProfile && (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userProfile.displayName}</p>
                  <p className="text-sm text-gray-500">{userProfile.role}</p>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                )}
              </>
            )}
            
            {showAuth && onSignIn && onSignUp && (
              <>
                <button
                  onClick={onSignIn}
                  className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUp}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;