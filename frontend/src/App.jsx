import { BrowserRouter, Route, Routes } from "react-router-dom";
import LiveIntelligence from "./pages/LiveIntelligence";
import MainLayout from "./layouts/MainLayout";
import CommandCenter from "./pages/CommandCenter";
import Disruptions from "./pages/Disruptions";
import RoutesPage from "./pages/routes";
import RouteResult from "./pages/RouteResult";
import AutonomousRerouting from "./pages/AutonomousRerouting";
import AIAgents from "./pages/AIAgents";
import Operations from "./pages/operations";
import SystemHealth from "./pages/SystemHealth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CommandCenter />} />
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