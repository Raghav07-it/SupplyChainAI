import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login initialMode="signin" />} />
        <Route path="/register" element={<Login initialMode="register" />} />
        <Route element={<MainLayout />}>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
