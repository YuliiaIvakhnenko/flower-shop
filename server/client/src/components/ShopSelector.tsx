import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { Shop } from "../interfaces/types";

interface ShopSelectorProps { onSelect: (shopId: string) => void; }

const ShopSelector: React.FC<ShopSelectorProps> = ({ onSelect }) => {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    axios.get<Shop[]>("http://localhost:8080/api/shops")
      .then((res) => setShops(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <select className="select shop-select" onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select a shop</option>
      {shops.map((shop) => (
        <option key={shop._id} value={shop._id}>
          {shop.name} ({shop.address})
        </option>
      ))}
    </select>
  );
};

export default ShopSelector;
