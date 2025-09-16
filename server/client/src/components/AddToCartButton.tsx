import React from "react";
import { useCart } from "../context/CartContext";
import { ProductKind } from "../interfaces/types";

export default function AddToCartButton(props: {
  productType: ProductKind;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
}) {
  const { add } = useCart();

  return (
    <button
      className="btn-primary"
      onClick={() =>
        add(
          {
            productType: props.productType,
            productId: props.productId,
            name: props.name,
            price: props.price,
            imageUrl: props.imageUrl,
          },
          1
        )
      }
    >
      + Add to cart
    </button>
  );
}
