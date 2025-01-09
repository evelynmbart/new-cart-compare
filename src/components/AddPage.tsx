import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { PriceEntry } from "../types";
import { getItemColor } from "../utils/colors";
import "./AddPage.css";

interface AddPageProps {
  entries: PriceEntry[];
  onAddEntry: (entry: PriceEntry) => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: PriceEntry) => void;
}

export function AddPage({
  entries,
  onAddEntry,
  onDeleteEntry,
  onEditEntry,
}: AddPageProps) {
  const [store, setStore] = useState("");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PriceEntry>>({});
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);

  const { stores, items, storeFuse, itemFuse } = useMemo(() => {
    const uniqueStores = Array.from(
      new Set(entries.map((entry) => entry.store))
    ).sort();
    const uniqueItems = Array.from(
      new Set(entries.map((entry) => entry.item))
    ).sort();

    const fuseOptions = {
      threshold: 0.3,
      distance: 100,
    };

    return {
      stores: uniqueStores,
      items: uniqueItems,
      storeFuse: new Fuse(uniqueStores, fuseOptions),
      itemFuse: new Fuse(uniqueItems, fuseOptions),
    };
  }, [entries]);

  const storeSuggestions = useMemo(() => {
    if (!store) return stores;
    return storeFuse.search(store).map((result) => result.item);
  }, [store, stores, storeFuse]);

  const itemSuggestions = useMemo(() => {
    if (!item) return items;
    return itemFuse.search(item).map((result) => result.item);
  }, [item, items, itemFuse]);

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStore(e.target.value);
    setShowStoreSuggestions(true);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItem(e.target.value);
    setShowItemSuggestions(true);
  };

  const handleSuggestionClick = (
    value: string,
    setter: (value: string) => void,
    hideDropdown: () => void
  ) => {
    setter(value);
    hideDropdown();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PriceEntry = {
      id: Date.now().toString(),
      store,
      item,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      unit,
      date: new Date().toISOString(),
    };
    onAddEntry(newEntry);
    setStore("");
    setItem("");
    setPrice("");
    setQuantity("");
    setUnit("");
  };

  const startEditing = (entry: PriceEntry) => {
    setEditingId(entry.id);
    setEditForm(entry);
  };

  const handleEditChange = (
    field: keyof PriceEntry,
    value: string | number
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.store || !editForm.item || !editForm.unit)
      return;

    const updatedEntry: PriceEntry = {
      id: editingId,
      store: editForm.store,
      item: editForm.item,
      price:
        typeof editForm.price === "string"
          ? parseFloat(editForm.price)
          : editForm.price || 0,
      quantity:
        typeof editForm.quantity === "string"
          ? parseFloat(editForm.quantity)
          : editForm.quantity || 0,
      unit: editForm.unit,
      date: new Date().toISOString(),
    };
    onEditEntry(updatedEntry);
    setEditingId(null);
    setEditForm({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".autocomplete")) {
        setShowStoreSuggestions(false);
        setShowItemSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="add-page">
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label htmlFor="store">Store</label>
          <div className="autocomplete">
            <input
              type="text"
              id="store"
              value={store}
              onChange={handleStoreChange}
              onFocus={() => setShowStoreSuggestions(true)}
              required
              placeholder="e.g. Publix"
              autoComplete="off"
            />
            {showStoreSuggestions && storeSuggestions.length > 0 && (
              <ul className="suggestions">
                {storeSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    onClick={() =>
                      handleSuggestionClick(suggestion, setStore, () =>
                        setShowStoreSuggestions(false)
                      )
                    }
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="item">Item</label>
          <div className="autocomplete">
            <input
              type="text"
              id="item"
              value={item}
              onChange={handleItemChange}
              onFocus={() => setShowItemSuggestions(true)}
              required
              placeholder="e.g. Carrots"
              autoComplete="off"
            />
            {showItemSuggestions && itemSuggestions.length > 0 && (
              <ul className="suggestions">
                {itemSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    onClick={() =>
                      handleSuggestionClick(suggestion, setItem, () =>
                        setShowItemSuggestions(false)
                      )
                    }
                    style={{ backgroundColor: getItemColor(suggestion) }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              step="0.01"
              min="0"
              placeholder="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            >
              <option value="">Select unit</option>
              <option value="lb">lb</option>
              <option value="oz">oz</option>
              <option value="each">each</option>
              <option value="pack">pack</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Add Price Entry
        </button>
      </form>

      <div className="entries-list">
        <h2>Recent Entries</h2>
        {entries
          .slice()
          .reverse()
          .map((entry) => (
            <div
              key={entry.id}
              className="entry-card"
              style={{ backgroundColor: getItemColor(entry.item) }}
            >
              {editingId === entry.id ? (
                <form onSubmit={handleUpdate} className="edit-form">
                  <div className="edit-form-row">
                    <div className="edit-form-group">
                      <label htmlFor={`store-${entry.id}`}>Store</label>
                      <input
                        id={`store-${entry.id}`}
                        type="text"
                        value={editForm.store}
                        onChange={(e) =>
                          handleEditChange("store", e.target.value)
                        }
                        placeholder="Store"
                        required
                      />
                    </div>
                    <div className="edit-form-group">
                      <label htmlFor={`item-${entry.id}`}>Item</label>
                      <input
                        id={`item-${entry.id}`}
                        type="text"
                        value={editForm.item}
                        onChange={(e) =>
                          handleEditChange("item", e.target.value)
                        }
                        placeholder="Item"
                        required
                      />
                    </div>
                  </div>
                  <div className="edit-form-row">
                    <div className="edit-form-group">
                      <label htmlFor={`price-${entry.id}`}>Price ($)</label>
                      <input
                        id={`price-${entry.id}`}
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          handleEditChange("price", e.target.value)
                        }
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        required
                      />
                    </div>
                    <div className="edit-form-group">
                      <label htmlFor={`quantity-${entry.id}`}>Quantity</label>
                      <input
                        id={`quantity-${entry.id}`}
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) =>
                          handleEditChange("quantity", e.target.value)
                        }
                        step="0.01"
                        min="0"
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <div className="edit-form-group">
                      <label htmlFor={`unit-${entry.id}`}>Unit</label>
                      <select
                        id={`unit-${entry.id}`}
                        value={editForm.unit}
                        onChange={(e) =>
                          handleEditChange("unit", e.target.value)
                        }
                        required
                      >
                        <option value="">Select unit</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                        <option value="each">each</option>
                        <option value="pack">pack</option>
                      </select>
                    </div>
                  </div>
                  <div className="edit-form-actions">
                    <button type="submit" className="save-button">
                      Save
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="entry-header">
                    <h3>{entry.item}</h3>
                    <div className="entry-actions">
                      <button
                        onClick={() => startEditing(entry)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="entry-details">
                    ${entry.price.toFixed(2)} for {entry.quantity} {entry.unit}
                  </p>
                  <p className="entry-store">{entry.store}</p>
                  <p className="entry-date">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
