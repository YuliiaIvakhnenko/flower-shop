import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

interface Flower {
  _id: string;
  name: string;
}

interface FlowerFilterDropdownProps {
  selected: string[];
  onChange: (flowerIds: string[]) => void;
}

const FlowerFilterDropdown: React.FC<FlowerFilterDropdownProps> = ({ selected, onChange }) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios
      .get<Flower[]>("http://localhost:8080/api/flowers")
      .then((res) => setFlowers(res.data))
      .catch((err) => console.error("Error fetching flowers", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFlower = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((f) => f !== id)
      : [...selected, id];
    onChange(updated);
  };

  const reset = () => {
    onChange([]);
  };

  return (
    <div className="dropdown filter-dropdown" ref={dropdownRef}>
      <label>Filter bouquets by flowers:</label>
      <button className="select" onClick={() => setOpen((o) => !o)}>
        {selected.length
          ? `Selected: ${selected.length}`
          : "Any flowers (click to choose)"}
      </button>

      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-item reset" onClick={reset}>
            Reset
          </div>
          {flowers.map((f) => (
            <label key={f._id} className="dropdown-item">
              <input
                type="checkbox"
                checked={selected.includes(f._id)}
                onChange={() => toggleFlower(f._id)}
              />
              {f.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlowerFilterDropdown;
