import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GoogleSignIn from "./components/GoogleSignIn";
import Onboarding from "./pages/Onboarding";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GoogleSignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}

export default App;