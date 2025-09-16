import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

type ExpandedProduct = {
  productType: "flower" | "bouquet";
  productId: string;
  quantity: number;
  name?: string;
  imageUrl?: string;
  price?: number;
};

type OrderResp = {
  _id: string;
  email: string;
  phone: string;
  address: string;
  products: ExpandedProduct[];
  totalPrice: number;
  createdAt: string;
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prettyNo = useMemo(() => {
    const fromLS = localStorage.getItem("lastOrderPretty");
    if (fromLS) return fromLS;
    return id ? `ORD-${id.slice(-6).toUpperCase()}` : "ORD-XXXXXX";
  }, [id]);

  useEffect(() => {
    axios
      .get<OrderResp>(`http://localhost:8080/api/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err?.response?.data?.error || "Error loading order"));
  }, [id]);

  if (error) return <div className="app"><div className="helper">{error}</div></div>;
  if (!order) return <div className="app"><div className="helper">Loading…</div></div>;

  const sumFromLines =
    order.products?.reduce((s, p) => s + (p.price ?? 0) * p.quantity, 0) ?? 0;
  const grandTotal = order.totalPrice || sumFromLines;

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Order Details</h1>
      </div>

      <div className="order-card">
        <div className="order-head">
          <div className="order-no">{prettyNo}</div>
          <div className="order-date">{fmtDateTime(order.createdAt)}</div>
        </div>

        <div className="order-meta">
          <div><strong>Email:</strong> {order.email}</div>
          <div><strong>Phone:</strong> {order.phone}</div>
          <div><strong>Delivery Address:</strong> {order.address}</div>
        </div>

        <hr className="order-sep" />

        <div className="items-header">
          <div className="col col-prod">Product</div>
          <div className="col col-type">Type</div>
          <div className="col col-qty">Qty</div>
          <div className="col col-price">Price</div>
          <div className="col col-total">Line total</div>
        </div>

        <div className="items-body">
          {order.products.map((p: ExpandedProduct, i: number) => {
            const lineTotal = (p.price ?? 0) * p.quantity;
            return (
              <div className="item-row" key={i}>
                <div className="col col-prod">
                  <div className="prod">
                    {p.imageUrl ? (
                      <img className="prod-thumb" src={p.imageUrl} alt={p.name || "Item"} />
                    ) : (
                      <div className="prod-thumb ph" />
                    )}
                    <div className="prod-name">{p.name || "Item"}</div>
                  </div>
                </div>
                <div className="col col-type">
                  <span className="badge">{p.productType}</span>
                </div>
                <div className="col col-qty">x {p.quantity}</div>
                <div className="col col-price">{fmtMoney(p.price ?? 0)}</div>
                <div className="col col-total">{fmtMoney(lineTotal)}</div>
              </div>
            );
          })}
        </div>

        <div className="order-foot">
          <div className="spacer" />
          <div className="grand">
            <span>Total:</span>
            <strong>{fmtMoney(grandTotal)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
