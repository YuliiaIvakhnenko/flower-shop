import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AddToCartButton from "./AddToCartButton";
import { Flower, Bouquet } from "../interfaces/types";

type FavMap = Record<string, boolean>;

function readFav(key: "flowers" | "bouquets"): FavMap {
  try {
    return JSON.parse(localStorage.getItem(`fav:${key}`) || "{}");
  } catch {
    return {};
  }
}
function writeFav(key: "flowers" | "bouquets", map: FavMap) {
  localStorage.setItem(`fav:${key}`, JSON.stringify(map));
}
interface ProductListProps {
  shopId: string;
  sort: "price" | "date";
  show: "flowers" | "bouquets";
  favorites?: boolean;     
  flowerIds?: string[];       
  match?: "all" | "any";     
}
function favFirstComparator<T extends { isFavorite?: boolean; price: number; createdAt: string }>(
  sort: "price" | "date"
) {
  return (a: T, b: T) => {
    const favDiff = Number(!!b.isFavorite) - Number(!!a.isFavorite);
    if (favDiff !== 0) return favDiff;

    if (sort === "price") {
      return a.price - b.price;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };
}

const ProductList: React.FC<ProductListProps> = ({
  shopId, sort, show, favorites, flowerIds, match
}) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [favFlowers, setFavFlowers] = useState<FavMap>(() => readFav("flowers"));
  const [favBouquets, setFavBouquets] = useState<FavMap>(() => readFav("bouquets"));


  useEffect(() => {
    const url = show === "flowers" ? "/api/flowers" : "/api/bouquets";

    const params: Record<string, string | boolean> = { sort, shopId };
    if (favorites) params.favorites = true;
    if (flowerIds && flowerIds.length > 0) params.flowerId = flowerIds.join(",");
    if (match) params.match = match;

    if (show === "flowers") {
      axios.get<Flower[]>(url, { params })
        .then(res => setFlowers(res.data))
        .catch(console.error);
    } else {
      axios.get<Bouquet[]>(url, { params })
        .then(res => setBouquets(res.data))
        .catch(console.error);
    }
  }, [shopId, sort, show, favorites, flowerIds, match]);

  const flowersView = useMemo(() => {
    const merged = flowers.map(f => ({
      ...f,
      isFavorite: favFlowers[f._id] ?? (f as any).isFavorite ?? false,
    }));
    const filtered = favorites ? merged.filter(f => f.isFavorite) : merged;
    return filtered.sort(favFirstComparator<Flower>(sort));
  }, [flowers, favFlowers, favorites, sort]);

  const bouquetsView = useMemo(() => {
    const merged = bouquets.map(b => ({
      ...b,
      isFavorite: favBouquets[b._id] ?? b.isFavorite ?? false,
    }));
    const filtered = favorites ? merged.filter(b => b.isFavorite) : merged;
    return filtered.sort(favFirstComparator<Bouquet>(sort));
  }, [bouquets, favBouquets, favorites, sort]);

  const toggleFavFlower = (id: string) => {
    setFavFlowers(prev => {
      const next = { ...prev, [id]: !prev[id] };
      writeFav("flowers", next);
      return next;
    });
  };
  const toggleFavBouquet = (id: string) => {
    setFavBouquets(prev => {
      const next = { ...prev, [id]: !prev[id] };
      writeFav("bouquets", next);
      return next;
    });
  };

  if (show === "flowers") {
    return (
      <div className="grid">
        {flowersView.map((f) => (
          <div className="product-card" key={f._id}>
            <button
              className={`fav-btn ${f.isFavorite ? "on" : ""}`}
              aria-label="Toggle favorite"
              onClick={() => toggleFavFlower(f._id)}
              title={f.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              ♥
            </button>

            <img className="product-img flower" src={f.imageUrl} alt={f.name} />
            <div className="product-name">{f.name}</div>
            <div className="product-price">${f.price}</div>

            <AddToCartButton
              productType="flower"
              productId={f._id}
              name={f.name}
              price={f.price}
              imageUrl={f.imageUrl}
            />

            <div className="tags" style={{ marginTop: 6 }}>
              <span className="badge">Flower</span>
              <span className="badge">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid">
      {bouquetsView.map((b) => (
        <div className="product-card" key={b._id}>
          <button
            className={`fav-btn ${b.isFavorite ? "on" : ""}`}
            aria-label="Toggle favorite"
            onClick={() => toggleFavBouquet(b._id)}
            title={b.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            ♥
          </button>

          <img className="product-img bouquet" src={b.imageUrl} alt={b.name} />
          <div className="product-name">{b.name}</div>
          <div className="product-price">${b.price}</div>

          <AddToCartButton
            productType="bouquet"
            productId={b._id}
            name={b.name}
            price={b.price}
            imageUrl={b.imageUrl}
          />

          <div className="tags" style={{ marginTop: 6 }}>
            <span className="badge">Bouquet</span>
            <span className="badge">{new Date(b.createdAt).toLocaleDateString()}</span>
          </div>

          {!!b.flowers?.length && (
            <div className="product-flowers">
              {b.flowers.map((f) => (
                <span key={f._id}>{f.name}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
