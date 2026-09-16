import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import logo from "./assets/logo.png";

function App() {
  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');

    if (favicon) {
      favicon.href = logo;
      favicon.type = "image/png";
    }
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
