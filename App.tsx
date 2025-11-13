
import React from 'react';
import { AppContextProvider } from './context/AppContext';
import { AuthContextProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <AuthContextProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </AuthContextProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <MainLayout /> : <LoginPage />;
}

export default App;
