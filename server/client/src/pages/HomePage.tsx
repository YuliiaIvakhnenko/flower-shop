import React, { useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import ShopSelector from "../components/ShopSelector";
import FlowerSelector from "../components/FlowerSelector";
const SKEY = {
  shopId: "ui:shopId",
  sort: "ui:sort",
  show: "ui:show",
  favMode: "ui:favMode",
  flowerIds: "ui:flowerIds",
  match: "ui:match",
} as const;

function readSS<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function writeSS<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const HomePage: React.FC = () => {

  const [shopId, setShopId] = useState<string>(() => readSS(SKEY.shopId, ""));
  const [sort, setSort] = useState<"price" | "date">(() => readSS(SKEY.sort, "date"));
  const [show, setShow] = useState<"flowers" | "bouquets">(() => readSS(SKEY.show, "flowers"));
  const [favMode, setFavMode] = useState<"all" | "only">(() => readSS(SKEY.favMode, "all"));
  const [flowerIds, setFlowerIds] = useState<string[]>(() => readSS<string[]>(SKEY.flowerIds, []));

  useEffect(() => { writeSS(SKEY.shopId, shopId); }, [shopId]);
  useEffect(() => { writeSS(SKEY.sort, sort); }, [sort]);
  useEffect(() => { writeSS(SKEY.show, show); }, [show]);
  useEffect(() => { writeSS(SKEY.favMode, favMode); }, [favMode]);
  useEffect(() => { writeSS(SKEY.flowerIds, flowerIds); }, [flowerIds]);
  const favorites = favMode === "only";

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Flower Shop</h1>
      </div>

      <div className="controls">
        <div className="control">
          <span className="label">Shop</span>
          <ShopSelector onSelect={setShopId} />
        </div>

        <div className="control">
          <span className="label">Sort by</span>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as "price" | "date")}>
            <option value="date">Date</option>
            <option value="price">Price</option>
          </select>
        </div>

        <div className="control">
          <span className="label">Show</span>
          <select className="select" value={show} onChange={(e) => setShow(e.target.value as "flowers" | "bouquets")}>
            <option value="flowers">Flowers</option>
            <option value="bouquets">Bouquets</option>
          </select>
        </div>

        <div className="control">
          <span className="label">Favorites</span>
          <select className="select" value={favMode} onChange={(e) => setFavMode(e.target.value as "all" | "only")}>
            <option value="all">All products</option>
            <option value="only">Favorites only</option>
          </select>
        </div>

        {show === "bouquets" && (
          <>
            <div className="control">
              <span className="label">Filter bouquets by flowers</span>
              <FlowerSelector value={flowerIds} onSelect={setFlowerIds} />
            </div>
          </>
        )}
      </div>

      {shopId ? (
        <ProductList
          shopId={shopId}
          sort={sort}
          show={show}
          favorites={favorites}
          flowerIds={flowerIds}
        />
      ) : (
        <div className="helper">Оберіть магазин, щоб побачити товари.</div>
      )}
    </div>
  );
};

export default HomePage;
