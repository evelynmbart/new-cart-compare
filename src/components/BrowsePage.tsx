import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PriceEntry } from "../types";
import "./BrowsePage.css";

interface BrowsePageProps {
  entries: PriceEntry[];
}

interface PriceAnalysis {
  item: string;
  bestPrice: {
    price: number;
    quantity: number;
    unit: string;
    store: string;
    date: string;
  };
  averagePrice: number;
  stores: {
    store: string;
    price: number;
    quantity: number;
    unit: string;
    date: string;
  }[];
}

export function BrowsePage({ entries }: BrowsePageProps) {
  const [selectedItem, setSelectedItem] = useState<string>("");

  // Get unique items from entries
  const items = useMemo(() => {
    const itemSet = new Set(entries.map((entry) => entry.item));
    return Array.from(itemSet).sort();
  }, [entries]);

  // Analyze prices for selected item
  const priceAnalysis: PriceAnalysis | null = useMemo(() => {
    if (!selectedItem) return null;

    const itemEntries = entries.filter((entry) => entry.item === selectedItem);
    if (itemEntries.length === 0) return null;

    // Calculate price per unit for comparison
    const pricesPerUnit = itemEntries.map((entry) => ({
      ...entry,
      pricePerUnit: entry.price / entry.quantity,
    }));

    // Find best price
    const bestPriceEntry = pricesPerUnit.reduce((best, current) =>
      current.pricePerUnit < best.pricePerUnit ? current : best
    );

    // Calculate average price per unit
    const averagePrice =
      pricesPerUnit.reduce((sum, entry) => sum + entry.pricePerUnit, 0) /
      pricesPerUnit.length;

    // Get prices by store
    const storeMap = new Map();
    pricesPerUnit.forEach((entry) => {
      if (
        !storeMap.has(entry.store) ||
        storeMap.get(entry.store).pricePerUnit > entry.pricePerUnit
      ) {
        storeMap.set(entry.store, entry);
      }
    });

    return {
      item: selectedItem,
      bestPrice: {
        price: bestPriceEntry.price,
        quantity: bestPriceEntry.quantity,
        unit: bestPriceEntry.unit,
        store: bestPriceEntry.store,
        date: bestPriceEntry.date,
      },
      averagePrice,
      stores: Array.from(storeMap.values()).map((entry) => ({
        store: entry.store,
        price: entry.price,
        quantity: entry.quantity,
        unit: entry.unit,
        date: entry.date,
      })),
    };
  }, [selectedItem, entries]);

  // Prepare data for the price history chart
  const chartData = useMemo(() => {
    if (!selectedItem) return [];

    return entries
      .filter((entry) => entry.item === selectedItem)
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString(),
        price: entry.price / entry.quantity,
        store: entry.store,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedItem, entries]);

  return (
    <div className="browse-page">
      <div className="item-selector">
        <label htmlFor="item-select">Select an item to analyze</label>
        <select
          id="item-select"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">Choose an item</option>
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {priceAnalysis && (
        <div className="analysis-container">
          <div className="price-summary">
            <h2>{priceAnalysis.item} - Price Analysis</h2>
            <div className="summary-cards">
              <div className="summary-card best-price">
                <h3>Best Price</h3>
                <p className="price">
                  $
                  {(
                    priceAnalysis.bestPrice.price /
                    priceAnalysis.bestPrice.quantity
                  ).toFixed(2)}{" "}
                  per {priceAnalysis.bestPrice.unit}
                </p>
                <p className="store">{priceAnalysis.bestPrice.store}</p>
                <p className="date">
                  {new Date(priceAnalysis.bestPrice.date).toLocaleDateString()}
                </p>
              </div>
              <div className="summary-card average-price">
                <h3>Average Price</h3>
                <p className="price">
                  ${priceAnalysis.averagePrice.toFixed(2)} per{" "}
                  {priceAnalysis.bestPrice.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="price-history">
            <h3>Price History</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    label={{
                      value: `Price per ${priceAnalysis.bestPrice.unit} ($)`,
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--accent-color)"
                    dot={{ fill: "var(--accent-color)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="store-comparison">
            <h3>Store Comparison</h3>
            <div className="store-cards">
              {priceAnalysis.stores.map((store) => (
                <div key={store.store} className="store-card">
                  <h4>{store.store}</h4>
                  <p className="price">
                    ${(store.price / store.quantity).toFixed(2)} per{" "}
                    {store.unit}
                  </p>
                  <p className="date">
                    {new Date(store.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
