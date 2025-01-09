import { useEffect, useState } from "react";
import "./App.css";
import { AddPage } from "./components/AddPage";
import { BrowsePage } from "./components/BrowsePage";
import { Page, PriceEntry } from "./types";

const seedData: PriceEntry[] = [
  {
    id: "1",
    store: "Publix",
    item: "Carrots",
    price: 2.99,
    quantity: 2,
    unit: "lb",
    date: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    store: "Walmart",
    item: "Carrots",
    price: 2.49,
    quantity: 2,
    unit: "lb",
    date: "2024-01-20T12:00:00Z",
  },
  {
    id: "3",
    store: "Kroger",
    item: "Carrots",
    price: 1.99,
    quantity: 1,
    unit: "lb",
    date: "2024-02-01T12:00:00Z",
  },
  {
    id: "4",
    store: "Publix",
    item: "Milk",
    price: 4.99,
    quantity: 1,
    unit: "each",
    date: "2024-01-15T12:00:00Z",
  },
  {
    id: "5",
    store: "Walmart",
    item: "Milk",
    price: 3.99,
    quantity: 1,
    unit: "each",
    date: "2024-01-25T12:00:00Z",
  },
  {
    id: "6",
    store: "Kroger",
    item: "Milk",
    price: 4.49,
    quantity: 1,
    unit: "each",
    date: "2024-02-01T12:00:00Z",
  },
  {
    id: "7",
    store: "Publix",
    item: "Bananas",
    price: 2.49,
    quantity: 3,
    unit: "lb",
    date: "2024-01-10T12:00:00Z",
  },
  {
    id: "8",
    store: "Walmart",
    item: "Bananas",
    price: 1.99,
    quantity: 3,
    unit: "lb",
    date: "2024-01-20T12:00:00Z",
  },
  {
    id: "9",
    store: "Kroger",
    item: "Bananas",
    price: 2.29,
    quantity: 3,
    unit: "lb",
    date: "2024-01-30T12:00:00Z",
  },
  {
    id: "10",
    store: "Publix",
    item: "Bread",
    price: 3.99,
    quantity: 1,
    unit: "each",
    date: "2024-01-15T12:00:00Z",
  },
  {
    id: "11",
    store: "Walmart",
    item: "Bread",
    price: 2.99,
    quantity: 1,
    unit: "each",
    date: "2024-01-25T12:00:00Z",
  },
  {
    id: "12",
    store: "Kroger",
    item: "Bread",
    price: 3.49,
    quantity: 1,
    unit: "each",
    date: "2024-02-01T12:00:00Z",
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("add");
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from localStorage and merge with seed data on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("priceEntries");
    let existingEntries: PriceEntry[] = [];

    if (savedEntries) {
      existingEntries = JSON.parse(savedEntries);
    }

    // Merge seed data with existing entries, avoiding duplicates
    const seedIds = new Set(seedData.map((entry) => entry.id));
    const filteredExistingEntries = existingEntries.filter(
      (entry) => !seedIds.has(entry.id)
    );

    setEntries([...seedData, ...filteredExistingEntries]);
    setIsLoading(false);
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("priceEntries", JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  const handleAddEntry = (entry: PriceEntry) => {
    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
  };

  const handleEditEntry = (updatedEntry: PriceEntry) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setEntries(updatedEntries);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Cart Compare</h1>
        <nav>
          <button
            className={currentPage === "add" ? "active" : ""}
            onClick={() => setCurrentPage("add")}
          >
            Add Price
          </button>
          <button
            className={currentPage === "browse" ? "active" : ""}
            onClick={() => setCurrentPage("browse")}
          >
            Browse
          </button>
        </nav>
      </header>

      <main>
        {currentPage === "add" ? (
          <AddPage
            entries={entries}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={handleEditEntry}
          />
        ) : (
          <BrowsePage entries={entries} />
        )}
      </main>
    </div>
  );
}

export default App;
