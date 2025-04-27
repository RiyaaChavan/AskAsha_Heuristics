import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GoogleSignIn from "./components/GoogleSignIn";
import Onboarding from "./pages/Onboarding";
import Chatbot from "./pages/Chatbot";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GoogleSignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/profile" element={ <UserProfile  userId="680e115c92d402a8f71dea2f"/>} />
      </Routes>
    </Router>
  );
}

export default App;