import "../../styles/Services.css";
import {
  FaPizzaSlice,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUtensils,
  FaArrowRight,
} from "react-icons/fa";

function Services() {
  const services = [
    {
      icon: <FaPizzaSlice />,
      title: "Our Menu",
      text: "Explore handcrafted pizzas, cheesy delights and delicious sides.",
      button: "Explore Menu",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Find Store",
      text: "Locate the nearest PizzaVerse outlet around your location.",
      button: "Locate Store",
    },
    {
      icon: <FaBirthdayCake />,
      title: "Party Orders",
      text: "Celebrate birthdays and events with exclusive pizza combos.",
      button: "Book Event",
    },
    {
      icon: <FaUtensils />,
      title: "Corporate Catering",
      text: "Fresh pizzas for offices, weddings and special occasions.",
      button: "Contact Us",
    },
  ];

  return (
    <section className="services">
      <div className="section-header">
        <h2>Discover PizzaVerse</h2>
        <p>Everything you need for an unforgettable pizza experience.</p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.text}</p>

            <button>
              {service.button}
              <FaArrowRight />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;
