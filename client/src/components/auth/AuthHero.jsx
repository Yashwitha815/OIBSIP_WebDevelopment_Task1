import logo from "../../assets/auth/logo.png";
import pizza from "../../assets/auth/hero-pizza.png";
import tomato from "../../assets/auth/tomato.png";
import basil from "../../assets/auth/basil.png";
import mushroom from "../../assets/auth/mushroom.png";
import cheese from "../../assets/auth/cheese.png";
import chilli from "../../assets/auth/chilli.png";

import FeatureStats from "./FeatureStats";

function AuthHero() {
  return (
    <div className="auth-hero">
      {/* Logo */}
      <img src={logo} alt="PizzaVerse" className="hero-logo" />

      {/* Main Content */}
      <div className="hero-content">
        <h1>
          Hot.
          <br />
          Fresh.
          <br />
          <span>Delivered.</span>
        </h1>

        <div className="hero-line"></div>

        <p>
          Every slice is crafted with love and delivered fresh to your doorstep.
        </p>
      </div>

      {/* Floating Ingredients */}

      <img src={tomato} alt="" className="floating tomato" />

      <img src={basil} alt="" className="floating basil" />

      <img src={mushroom} alt="" className="floating mushroom" />

      <img src={cheese} alt="" className="floating cheese" />

      <img src={chilli} alt="" className="floating chilli" />

      {/* Pizza */}

      <div className="love-badge">
        ❤️
        <span>Made With Love</span>
      </div>

      <div className="pizza-wrapper">
        <img src={pizza} className="hero-pizza" alt="Pizza" />
      </div>

      {/* Bottom Stats */}

      <FeatureStats />
    </div>
  );
}

export default AuthHero;
