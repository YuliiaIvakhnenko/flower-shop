import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uaPhoneRe = /^\+?380\d{9}$/; 
const addressRe = /[A-Za-zА-Яа-яІіЇїЄєҐґ0-9]{5,}/; 

export default function CartPage() {
  const { items, total, inc, dec, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("checkout:v1") || "{}");
      if (saved.name) setName(saved.name);
      if (saved.email) setEmail(saved.email);
      if (saved.phone) setPhone(saved.phone);
      if (saved.address) setAddress(saved.address);
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { name, email, phone, address };
    localStorage.setItem("checkout:v1", JSON.stringify(payload));
  }, [name, email, phone, address]);

  const emailOk = emailRe.test(email.trim());
  const phoneOk = uaPhoneRe.test(phone.trim());
  const addressOk = addressRe.test(address.trim());
  const nameOk = name.trim().length >= 2;

  const canSubmit = useMemo(
    () => items.length > 0 && nameOk && emailOk && phoneOk && addressOk && !submitting,
    [items.length, nameOk, emailOk, phoneOk, addressOk, submitting]
  );

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        email,
        phone,
        address,
        products: items.map((i) => ({
          productType: i.productType,
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await axios.post<{ _id: string }>("/api/orders", payload);

      const pretty = makePrettyOrderId(res.data._id);
      localStorage.setItem("lastOrderPretty", pretty);

      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setTouched({ name: false, email: false, phone: false, address: false });
      localStorage.removeItem("checkout:v1");

      clear(); 
      navigate(`/order/${res.data._id}`, { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Shopping Cart</h1>
      </div>

      <div className="cart-layout">
        <div className="panel form-panel">
          <label className="label">Name</label>
          <input
            className={`input input-sm ${!nameOk && touched.name ? "input--error" : ""}`}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          {!nameOk && touched.name && <small className="field-hint">Введіть ім’я (мін. 2 символи)</small>}

          <label className="label">Email</label>
          <input
            className={`input input-sm ${!emailOk && touched.email ? "input--error" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="you@email.com"
          />
          {!emailOk && touched.email && <small className="field-hint">Введіть коректну пошту</small>}

          <label className="label">Phone</label>
          <input
            className={`input input-sm ${!phoneOk && touched.phone ? "input--error" : ""}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="+380XXXXXXXXX"
          />
          {!phoneOk && touched.phone && <small className="field-hint">Телефон у форматі +380XXXXXXXXX</small>}

          <label className="label">Address</label>
          <input
            className={`input input-sm ${!addressOk && touched.address ? "input--error" : ""}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, address: true }))}
            placeholder="Street, City"
          />
          {!addressOk && touched.address && <small className="field-hint">Введіть коректну адресу</small>}
        </div>

        <div className="panel items-panel">
          <span className="label">Items</span>
          <div className="cart-items scroll">
            {items.length === 0 && <div className="helper">Cart is empty</div>}

            {items.map((it) => (
              <div key={it.productType + it.productId} className="cart-item">
                {it.imageUrl ? (
                  <img className="thumb" src={it.imageUrl} alt={it.name} />
                ) : (
                  <div className="thumb thumb--ph" />
                )}

                <div className="info">
                  <div className="top">
                    <strong className="name">{it.name}</strong>
                    <span className="price">${it.price}</span>
                  </div>

                  <div className="tags" style={{ justifyContent: "flex-start" }}>
                    <div className="badge">{it.productType}</div>
                  </div>
                </div>

                <div className="actions">
                  <div className="qty">
                    <button onClick={() => dec(it.productId, it.productType)} aria-label="Decrease">
                      −
                    </button>
                    <span className="qty-value">{it.quantity}</span>
                    <button onClick={() => inc(it.productId, it.productType)} aria-label="Increase">
                      +
                    </button>
                  </div>

                  <button className="btn-remove" onClick={() => remove(it.productId, it.productType)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="row total">
              <strong>Total price:</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>

            {error && <div className="helper error">{error}</div>}

            <button className="btn-primary" disabled={!canSubmit} onClick={submit}>
              {submitting ? "Submitting..." : "Submit order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function makePrettyOrderId(id: string) {
  const tail = id.slice(-6).toUpperCase();
  return `ORD-${tail}`;
}
