import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AboutProvider } from "./components/AboutContext";
import { Overview } from "./pages/Overview";
import { CrimeTrends } from "./pages/CrimeTrends";
import { Representation } from "./pages/Representation";
import { Population } from "./pages/Population";
import { Parliament } from "./pages/Parliament";
import { IncomeConsumption } from "./pages/IncomeConsumption";
import { Unemployment } from "./pages/Unemployment";
import { Wealth } from "./pages/Wealth";
import { DataSources } from "./pages/DataSources";
import { SocialAttitudes } from "./pages/SocialAttitudes";
import { Juxtaposition } from "./pages/Juxtaposition";

export default function App() {
  return (
    <HashRouter>
      <AboutProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="crime" element={<CrimeTrends />} />
            <Route path="attitudes" element={<SocialAttitudes />} />
            <Route path="representation" element={<Representation />} />
            <Route path="population" element={<Population />} />
            <Route path="parliament" element={<Parliament />} />
            <Route path="income" element={<IncomeConsumption />} />
            <Route path="unemployment" element={<Unemployment />} />
            <Route path="wealth" element={<Wealth />} />
            <Route path="data-sources" element={<DataSources />} />
            <Route path="juxtaposition" element={<Juxtaposition />} />
          </Route>
        </Routes>
      </AboutProvider>
    </HashRouter>
  );
}
