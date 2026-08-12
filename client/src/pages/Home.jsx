import "../styles/Home.css";
import { useEffect, useState } from "react";
import axios from "axios";

import Hero from "../components/home/Hero";

import PizzaCard from "../components/home/PizzaCard";

function Home() {
  const [pizzas, setPizzas] = useState([]);

  useEffect(() => {
    const loadPizzas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/pizzas");

        setPizzas(response.data);
      } catch (error) {
        console.error("Error fetching pizzas:", error);
      }
    };

    loadPizzas();
  }, []);

  // Show only featured pizzas on Home page
  const featuredPizzas = pizzas.filter((pizza) => pizza.featured === true);

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Popular Pizzas */}
      <section className="menu-section">
        <h2 className="section-title">🍕 Our Popular Pizzas</h2>

        <p className="section-subtitle">
          Freshly baked pizzas made with premium ingredients.
        </p>

        <div className="pizza-grid">
          {featuredPizzas.length > 0 ? (
            featuredPizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))
          ) : (
            <p className="no-pizzas">🍕 No featured pizzas available.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
