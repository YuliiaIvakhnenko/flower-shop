import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const disabled = items.length === 0;

  return (
    <header className="header-bar">
      <div className="header-left">🌸 Flower Shop</div>
      <nav className="header-right">
        <button className="btn-ghost" onClick={() => navigate("/")}>
          Shop
        </button>
        <button
          className="btn-ghost"
          onClick={() => !disabled && navigate("/cart")}
          disabled={disabled}
          title={disabled ? "Cart is empty" : "Go to cart"}
        >
          Cart ({items.length})
        </button>
      </nav>
    </header>
  );
};

export default Header;
