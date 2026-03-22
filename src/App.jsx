import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminDelete from "./components/AdminDelete";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";
import CodeCurse from "./pages/Landing";
import UserDashboard from "./pages/UserDashboard";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show spinner while checking auth — MUST be before <Routes>
  // so no routes mount until we know auth status
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#03020a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 42, height: 42,
          border: '3px solid rgba(255,45,45,.15)',
          borderTop: '3px solid #ff2d2d',
          borderRadius: '50%',
          animation: 'cc-spin .7s linear infinite',
        }} />
        <style>{`@keyframes cc-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* "/" always shows landing page — no auth check */}
      <Route path="/" element={<CodeCurse />} />

      {/* "/home" is the protected dashboard */}
      <Route
        path="/home"
        element={isAuthenticated ? <Homepage /> : <Navigate to="/" replace />}
      />

      {/* Auth pages — redirect to /home if already logged in */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Signup />}
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/create"
        element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/delete"
        element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/video"
        element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/upload/:problemId"
        element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" replace />}
      />

      <Route path="/problem/:problemId" element={<ProblemPage />} />

      <Route
  path="/dashboard"
  element={isAuthenticated ? <UserDashboard /> : <Navigate to="/" replace />}
/>
    </Routes>
  );
}

export default App;
