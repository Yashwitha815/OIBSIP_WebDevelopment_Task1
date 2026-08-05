import "../styles/auth/Register.css";

import AuthHero from "../components/auth/AuthHero";
import RegisterForm from "../components/auth/RegisterForm";

function Register() {
  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side */}
        <div className="register-left">
          <AuthHero />
        </div>

        {/* Right Side */}
        <div className="register-right">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default Register;
