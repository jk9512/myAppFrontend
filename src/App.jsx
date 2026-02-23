import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

const App = () => (
  <AuthProvider>
    <AppRoutes />
    <Analytics />
  </AuthProvider>
);

export default App;
