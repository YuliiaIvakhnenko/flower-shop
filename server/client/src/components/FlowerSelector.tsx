import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Flower } from "../interfaces/types";

type Props = {
  value?: string[];                           
  onSelect: (flowerIds: string[]) => void;    
};

const FlowerSelector: React.FC<Props> = ({ value, onSelect }) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [inner, setInner] = useState<string[]>([]);
  const selected = value ?? inner;

  useEffect(() => {
    axios
      .get<Flower[]>("/api/flowers")
      .then((res) => setFlowers(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const commit = (next: string[]) => {
    if (value === undefined) setInner(next);
    onSelect(next);
  };

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    commit(next);
  };

  const reset = () => commit([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flowers;
    return flowers.filter((f) => f.name.toLowerCase().includes(q));
  }, [flowers, query]);

  const selectAllFiltered = () => {
    const ids = filtered.map((f) => f._id);
    const union = Array.from(new Set([...selected, ...ids]));
    commit(union);
  };

  const clearFiltered = () => {
    const ids = new Set(filtered.map((f) => f._id));
    commit(selected.filter((id) => !ids.has(id)));
  };

  const summary = useMemo(() => {
    if (!selected.length) return "Any flowers (click to choose)";
    const names = selected
      .map((id) => flowers.find((f) => f._id === id)?.name)
      .filter(Boolean) as string[];
    if (!names.length) return `Selected: ${selected.length}`;
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }, [selected, flowers]);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button type="button" className="select" onClick={() => setOpen((o) => !o)}>
        {summary}
      </button>

      {open && (
        <div className="dropdown-menu" role="listbox" aria-multiselectable>
          <div className="dropdown-tools">
            <input
              className="dropdown-search"
              placeholder="Search flowers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="dropdown-actions">
              <button type="button" className="badge" onClick={selectAllFiltered}>Select all</button>
              <button type="button" className="badge" onClick={clearFiltered}>Clear filtered</button>
              <button type="button" className="badge danger" onClick={reset}>Reset</button>
            </div>
          </div>

          {filtered.map((f) => (
            <label key={f._id} className="dropdown-item">
              <input
                type="checkbox"
                checked={selected.includes(f._id)}
                onChange={() => toggle(f._id)}
              />
              <span className="item-name">{f.name}</span>
              <span className="item-price">${f.price}</span>
            </label>
          ))}

          {!filtered.length && (
            <div className="dropdown-empty">Nothing found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlowerSelector;
