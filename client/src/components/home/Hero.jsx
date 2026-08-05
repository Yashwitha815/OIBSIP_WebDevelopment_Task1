import "../../styles/Hero.css";
function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">🔥 Hot & Fresh Pizza</span>

        <h1>
          Delicious Pizza <br />
          Delivered To Your Door
        </h1>

        <p>
          <i>
            Fresh ingredients, cheesy toppings and lightning-fast delivery.
            Order your favourite pizza anytime, anywhere.
          </i>
        </p>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000"
          alt="Pizza"
        />
      </div>
    </section>
  );
}

export default Hero;
