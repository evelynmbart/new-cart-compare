export interface PriceEntry {
  id: string;
  store: string;
  item: string;
  price: number;
  quantity: number;
  unit: string;
  date: string;
}

export type Page = "add" | "browse";
