import "../../styles/PizzaCard.css";

import { FaHeart, FaRegHeart, FaShoppingCart, FaStar } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";

import { toggleWishlist } from "../../features/wishlist/wishlistSlice";
import { openPizza } from "../../features/pizza/pizzaSlice";

import toast from "react-hot-toast";

function PizzaCard({ pizza }) {
  const dispatch = useDispatch();

  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  const isFavourite = wishlistItems.some((item) => item._id === pizza._id);

  // ==========================
  // Open Pizza Customization
  // ==========================

  const handleOpenPizza = () => {
    dispatch(openPizza(pizza));
  };

  // ==========================
  // Add To Cart
  // ==========================

  const handleAddToCart = (e) => {
    e.stopPropagation();

    dispatch(openPizza(pizza));

    toast.success(`${pizza.name} added to Cart 🍕`, {
      duration: 1200,
    });
  };

  // ==========================
  // Wishlist
  // ==========================

  const handleWishlist = (e) => {
    e.stopPropagation();

    console.log("Heart Clicked ❤️");

    dispatch(toggleWishlist(pizza));

    if (isFavourite) {
      toast(`${pizza.name} removed from Wishlist 💔`, {
        duration: 1200,
      });
    } else {
      toast.success(`${pizza.name} added to Wishlist ❤️`, {
        duration: 1200,
      });
    }
  };

  return (
    <div className="pizza-card" onClick={handleOpenPizza}>
      {/* ==========================
          IMAGE
      ========================== */}

      <div className="card-image">
        <button
          className={`favorite-btn ${isFavourite ? "active-heart" : ""}`}
          onClick={handleWishlist}
        >
          {isFavourite ? (
            <FaHeart className="heart-icon liked" />
          ) : (
            <FaRegHeart className="heart-icon" />
          )}
        </button>

        <img src={pizza.image} alt={pizza.name} />
      </div>

      {/* ==========================
          CONTENT
      ========================== */}

      <div className="pizza-content">
        <div className="pizza-top">
          <h3>{pizza.name}</h3>

          <span className="rating">
            <FaStar />
            <span>4.8</span>
          </span>
        </div>

        <span
          className={
            pizza.category === "Veg" ? "category veg" : "category nonveg"
          }
        >
          {pizza.category}
        </span>

        <p className="description">{pizza.description}</p>

        <div className="pizza-bottom">
          <h2 className="price">₹{pizza.price}</h2>

          <button className="add-btn" onClick={handleAddToCart}>
            <FaShoppingCart />

            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PizzaCard;
