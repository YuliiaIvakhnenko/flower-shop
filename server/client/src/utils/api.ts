import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const getShops = () => axios.get(`${API_URL}/shops`);
export const getFlowers = (shopId?: string, sort?: string) =>
  axios.get(`${API_URL}/flowers`, { params: { shopId, sort } });
export const getBouquets = (shopId?: string, sort?: string, favorites?: boolean) =>
  axios.get(`${API_URL}/bouquets`, { params: { shopId, sort, favorites } });
