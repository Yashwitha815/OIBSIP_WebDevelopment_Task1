import { FaTruck, FaLeaf, FaStar } from "react-icons/fa";

const features = [
  {
    icon: <FaTruck />,
    title: "Fast Delivery",
    text: "Within 30 Minutes",
  },
  {
    icon: <FaLeaf />,
    title: "Fresh Ingredients",
    text: "100% Natural",
  },
  {
    icon: <FaStar />,
    title: "4.9 Rating",
    text: "10K+ Happy Customers",
  },
];

function FeatureStats() {
  return (
    <div className="feature-stats">
      {features.map((feature, index) => (
        <div className="feature-card" key={index}>
          <div className="feature-icon">{feature.icon}</div>

          <div className="feature-text">
            <h4>{feature.title}</h4>
            <p>{feature.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeatureStats;
