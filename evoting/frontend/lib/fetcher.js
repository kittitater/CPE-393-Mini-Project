import { api } from "./api";
export const fetcher = (url) => api.get(url).then((r) => r.data);
