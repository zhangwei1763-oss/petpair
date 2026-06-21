import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PetProfilePage from './pages/PetProfilePage'
import PetDetailPage from './pages/PetDetailPage'
import InvitationsPage from './pages/InvitationsPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ActivityFeedPage from './pages/ActivityFeedPage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage from './pages/SearchPage'
import MapExplorePage from './pages/MapExplorePage'
import LeaderboardPage from './pages/LeaderboardPage'
import StatsPage from './pages/StatsPage'
import ThemePage from './pages/ThemePage'
import ErrorBoundary from './components/ErrorBoundary'
import { currentUser } from './data/mockData'
import { isSupabaseConfigured } from './api/client'
import { getSession, onAuthStateChange, getUserProfile, createUserProfile, signOut } from './api/auth'

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Supabase 模式
      getSession().then(session => {
        if (session?.user) {
          getUserProfile(session.user.id).then(profile => {
            if (profile) {
              setUser({ ...session.user, ...profile });
              setIsLoggedIn(true);
            } else {
              // 首次登录，创建 profile
              createUserProfile(session.user.id, session.user.user_metadata?.name || '宠物爱好者', session.user.phone || undefined).then(profile => {
                setUser({ ...session.user, ...profile });
                setIsLoggedIn(true);
              });
            }
          });
        }
        setLoading(false);
      });

      onAuthStateChange((authUser) => {
        if (authUser) {
          getUserProfile(authUser.id).then(profile => {
            setUser({ ...authUser, ...profile });
            setIsLoggedIn(true);
          });
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      }).then(unsubscribe => {
        unsubscribeRef.current = unsubscribe;
      });

      return () => { unsubscribeRef.current?.(); };
    } else {
      // Mock 模式
      setUser(currentUser);
      setIsLoggedIn(true);
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await signOut();
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          element={
            isLoggedIn ? (
              <Layout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pets" element={<PetProfilePage />} />
          <Route path="/pets/:petId" element={<PetDetailPage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />
          <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
          {/* V1.5 */}
          <Route path="/community" element={<ActivityFeedPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchPage />} />
          {/* V2.0 */}
          <Route path="/explore" element={<MapExplorePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/theme" element={<ThemePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
