import "../../styles/SortDropdown.css";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

function SortDropdown({ sortOption, setSortOption }) {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();

  const options = [
    {
      value: "default",
      label: "🍕 Featured",
    },
    {
      value: "priceLow",
      label: "🟠 Price: Low to High",
    },
    {
      value: "priceHigh",
      label: "🟠 Price: High to Low",
    },
    {
      value: "nameAZ",
      label: "🟠 Name: A to Z",
    },
  ];

  const selected =
    options.find((item) => item.value === sortOption) || options[0];

  useEffect(() => {
    const close = (e) => {
      if (!dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", close);

    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="sort-container">
      <label>Sort By:</label>

      <div className="custom-select" ref={dropdownRef}>
        <button className="select-btn" onClick={() => setOpen(!open)}>
          {selected.label}

          <FaChevronDown className={open ? "rotate" : ""} />
        </button>

        {open && (
          <div className="options">
            {options.map((option) => (
              <div
                key={option.value}
                className={`option ${
                  sortOption === option.value ? "selected" : ""
                }`}
                onClick={() => {
                  setSortOption(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SortDropdown;
