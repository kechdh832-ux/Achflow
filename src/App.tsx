import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Shorts } from './pages/Shorts';
import { Watch } from './pages/Watch';
import { VideoUpload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Downloads } from './pages/Downloads';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './AuthContext';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shorts" element={<Shorts />} />
              <Route path="watch/:id" element={<Watch />} />
              <Route path="upload" element={<VideoUpload />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="downloads" element={<Downloads />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster position="top-center" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
