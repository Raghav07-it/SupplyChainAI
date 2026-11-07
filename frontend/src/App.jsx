import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Alerts from "./pages/Alerts";
import PlanShipment from "./pages/PlanShipment";
import CompareOptions from "./pages/CompareOptions";
import MyShipments from "./pages/MyShipments";
import Disruptions from "./pages/Disruptions";
import RoutesPage from "./pages/routes";
import RouteResult from "./pages/RouteResult";
import AutonomousRerouting from "./pages/AutonomousRerouting";
import AIAgents from "./pages/AIAgents";
import LiveIntelligence from "./pages/LiveIntelligence";
import Operations from "./pages/operations";
import SystemHealth from "./pages/SystemHealth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--canvas-base)] flex items-center justify-center p-6 text-[var(--text-body)]">
        <LoadingSpinner message="Checking authentication session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--canvas-base)] flex items-center justify-center p-6 text-[var(--text-body)]">
        <LoadingSpinner message="Loading…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes (no sidebar) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes (wrapped in ProtectedRoute & MainLayout) */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/plan-shipment" element={<PlanShipment />} />
            <Route path="/compare-options" element={<CompareOptions />} />
            <Route path="/my-shipments" element={<MyShipments />} />
            <Route path="/disruptions" element={<Disruptions />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/route-result" element={<RouteResult />} />
            <Route path="/rerouting" element={<AutonomousRerouting />} />
            <Route path="/agents" element={<AIAgents />} />
            <Route path="/live" element={<LiveIntelligence />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/health" element={<SystemHealth />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
