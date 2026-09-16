import { Route, Routes } from "react-router-dom";
import PortfolioLayout from "../layouts/PortfolioLayout";
import HomePage from "../pages/HomePage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PortfolioLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
