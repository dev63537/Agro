import React, { useState, useEffect } from "react";
import api from "../../lib/apiClient";
import { showError, showSuccess } from "../../lib/toast";

const AVAILABLE_MODELS = [
  "Bill",
  "Farmer",
  "Payment",
  "Product",
  "StockBatch",
  "YearlyLedger"
];

export default function ResetTestData() {
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("ALL");
  const [selectedModels, setSelectedModels] = useState([...AVAILABLE_MODELS]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await api.get("/master/shops");
      setShops(res.data.shops || []);
    } catch (err) {
      showError("Failed to fetch shops");
    }
  };

  const handleModelToggle = (model) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const selectAll = () => setSelectedModels([...AVAILABLE_MODELS]);
  const deselectAll = () => setSelectedModels([]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (selectedModels.length === 0) {
      showError("Please select at least one data type to delete.");
      return;
    }

    if (!window.confirm("WARNING: Are you absolutely sure you want to PERMANENTLY delete this data? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/master/reset-test-data", {
        shopId,
        models: selectedModels
      });
      showSuccess(res.data.message || "Test data reset successfully");
      setResult(res.data.result);
    } catch (err) {
      showError(err.response?.data?.error || "Failed to reset test data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title text-red-600">Reset Test Data</h1>
          <p className="text-secondary-500 mt-1">Permanently remove test data before launch. Proceed with caution.</p>
        </div>
      </div>

      <div className="card max-w-2xl border-red-200 shadow-sm shadow-red-100">
        <div className="card-body">
          <form onSubmit={handleReset} className="space-y-6">
            
            {/* Shop Selection */}
            <div>
              <label className="label text-secondary-800 font-semibold mb-2 block">Target Shop</label>
              <select 
                value={shopId} 
                onChange={(e) => setShopId(e.target.value)} 
                className="select border-red-200 focus:ring-red-500"
              >
                <option value="ALL">🚨 ALL SHOPS (Entire Database)</option>
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name} ({shop.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-secondary-500 mt-1">Select which shop's data you want to delete. Select "ALL SHOPS" to clear data globally.</p>
            </div>

            {/* Data Models Selection */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="label text-secondary-800 font-semibold mb-0 block">Data to Remove</label>
                <div className="space-x-2 text-sm">
                  <button type="button" onClick={selectAll} className="text-primary-600 hover:underline">Select All</button>
                  <span className="text-secondary-300">|</span>
                  <button type="button" onClick={deselectAll} className="text-secondary-600 hover:underline">Deselect All</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
                {AVAILABLE_MODELS.map(model => (
                  <label key={model} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-surface-200">
                    <input 
                      type="checkbox"
                      className="rounded border-secondary-300 text-red-600 focus:ring-red-500 w-4 h-4"
                      checked={selectedModels.includes(model)}
                      onChange={() => handleModelToggle(model)}
                    />
                    <span className="text-sm font-medium text-secondary-700">{model}s</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-surface-200">
              <button 
                type="submit" 
                className="btn-danger w-full py-3 text-lg font-bold flex justify-center items-center gap-2" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Deletion...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🗑️</span>
                    Permanently Delete Selected Data
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result Display */}
          {result && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4">
              <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                <span>✅</span> Deletion Summary
              </h3>
              <ul className="space-y-2">
                {Object.entries(result).map(([model, count]) => (
                  <li key={model} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-red-100 text-sm">
                    <span className="font-medium text-secondary-700">{model}s Removed:</span>
                    <span className="font-bold text-red-600">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
