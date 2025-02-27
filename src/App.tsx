import { useEffect, useState } from "react";
import "./App.css";
import { AddPage } from "./components/AddPage";
import { BrowsePage } from "./components/BrowsePage";
import { Page, PriceEntry } from "./types";

const seedData: PriceEntry[] = [];

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
    // const seedIds = new Set(seedData.map((entry) => entry.id));
    // const filteredExistingEntries = existingEntries.filter(
    //   (entry) => !seedIds.has(entry.id)
    // );

    // setEntries([...seedData, ...filteredExistingEntries]);
    // setIsLoading(false);
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
