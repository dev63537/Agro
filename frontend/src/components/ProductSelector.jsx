import React from 'react';
import SearchableDropdown from './SearchableDropdown';

/**
 * ProductSelector — Thin wrapper around SearchableDropdown for product lists.
 * Renders: "Product Name — ₹price/unit"
 */
export default function ProductSelector({ products, value, onChange }) {
  return (
    <SearchableDropdown
      options={products}
      value={value}
      onChange={onChange}
      placeholder="Select a product..."
      valueKey="_id"
      labelKey="name"
      renderLabel={(p) => `${p.name} — ₹${p.price}/${p.unit}`}
    />
  );
}
