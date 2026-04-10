import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Payment from "./pages/payment";
import Login from "./pages/login";
import Signup from "./pages/signup";
import About from "./pages/About";
import ForgotPassword from "./pages/forgotpassword";
import ResetPassword from "./pages/resetpassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;