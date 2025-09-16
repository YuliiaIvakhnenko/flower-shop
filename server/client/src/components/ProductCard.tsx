import React from "react";
import AddToCartButton from "./AddToCartButton";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  type: "flower" | "bouquet";
  createdAt?: string;
  flowers?: { _id: string; name: string }[]; 
  isFavorite?: boolean;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const isFlower = product.type === "flower";

  return (
    <div className="product-card">
      <img
        src={product.imageUrl}
        alt={product.name}
        className={`product-img ${isFlower ? "flower" : "bouquet"}`}
      />

      <div className="product-name">{product.name}</div>
      <div className="product-price">${product.price}</div>

      <AddToCartButton
        productType={product.type}
        productId={product._id}
        name={product.name}
        price={product.price}
        imageUrl={product.imageUrl}
      />

      <div className="tags" style={{ marginTop: 6 }}>
        <span className={`badge ${product.isFavorite ? "badge--fav" : ""}`}>
          {isFlower ? "Flower" : "Bouquet"}
        </span>
        {product.createdAt && (
          <span className="badge">
            {new Date(product.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {!isFlower && product.flowers?.length ? (
        <div className="product-flowers">
          {product.flowers.map((f) => (
            <span key={f._id}>{f.name}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ProductCard;
