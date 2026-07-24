import { useState } from "react";

import MenuHero from "../components/menu/MenuHero";
import SearchBar from "../components/menu/SearchBar";
import CategoryFilter from "../components/menu/CategoryFilter";
import SortDropdown from "../components/menu/SortDropdown";
import MenuGrid from "../components/menu/MenuGrid";

function Menu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  return (
    <>
      <MenuHero />

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <CategoryFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />

      <MenuGrid
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        sortOption={sortOption}
      />
    </>
  );
}

export default Menu;
