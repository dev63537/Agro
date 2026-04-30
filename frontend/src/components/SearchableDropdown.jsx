import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * SearchableDropdown — A fully reusable, accessible dropdown with search.
 *
 * Props:
 *  options      {Array}    — Array of option objects
 *  value        {string}   — Currently selected valueKey
 *  onChange     {Function} — Called with the selected valueKey (string)
 *  placeholder  {string}   — Placeholder text
 *  labelKey     {string}   — Key to read display label from (default: 'name')
 *  valueKey     {string}   — Key to read value from (default: '_id')
 *  loading      {boolean}  — Show loading spinner
 *  disabled     {boolean}  — Disable the control
 *  error        {boolean}  — Red border on error state
 *  renderLabel  {Function} — Optional custom label renderer: (option) => string
 *  autoFocus    {boolean}  — Auto-focus the trigger on mount
 *  id           {string}   — Optional id for the trigger button
 */
export default function SearchableDropdown({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  labelKey = 'name',
  valueKey = '_id',
  loading = false,
  disabled = false,
  error = false,
  renderLabel,
  autoFocus = false,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);

  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  // Compute display label for an option
  const getLabel = useCallback(
    (opt) => (renderLabel ? renderLabel(opt) : opt[labelKey] ?? ''),
    [renderLabel, labelKey]
  );

  // Selected option object
  const selectedOption = useMemo(
    () => options.find((o) => String(o[valueKey]) === String(value)),
    [options, value, valueKey]
  );

  // Filtered options based on search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      getLabel(o).toLowerCase().includes(q)
    );
  }, [options, search, getLabel]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [filtered.length, open]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [open]);

  // Auto-focus trigger on mount if autoFocus is set
  useEffect(() => {
    if (autoFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [autoFocus]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    if (items[highlightIdx]) {
      items[highlightIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const openDropdown = () => {
    if (disabled || loading) return;
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
    setSearch('');
  };

  const selectOption = (opt) => {
    onChange(opt[valueKey]);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIdx]) selectOption(filtered[highlightIdx]);
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  // Highlight matched text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="sdd-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const triggerLabel = selectedOption ? getLabel(selectedOption) : null;

  return (
    <div
      ref={containerRef}
      className={`sdd-root${error ? ' sdd-error' : ''}${disabled ? ' sdd-disabled' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        className={`sdd-trigger${open ? ' sdd-trigger--open' : ''}${!triggerLabel ? ' sdd-trigger--placeholder' : ''}`}
      >
        <span className="sdd-trigger-label">
          {loading ? (
            <span className="sdd-loading">
              <svg className="sdd-spinner" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </span>
          ) : triggerLabel ?? placeholder}
        </span>

        <span className="sdd-trigger-icons">
          {/* Clear button */}
          {value && !disabled && !loading && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              className="sdd-clear"
              onMouseDown={clearSelection}
            >
              ✕
            </span>
          )}
          {/* Chevron */}
          <svg
            className={`sdd-chevron${open ? ' sdd-chevron--up' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
          </svg>
        </span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="sdd-panel" role="listbox">
          {/* Search Input */}
          <div className="sdd-search-wrap">
            <svg className="sdd-search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M13 13l3 3" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className="sdd-search-input"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search options"
            />
            {search && (
              <button
                type="button"
                className="sdd-search-clear"
                onMouseDown={(e) => { e.preventDefault(); setSearch(''); searchRef.current?.focus(); }}
                tabIndex={-1}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Options List */}
          <ul className="sdd-list" ref={listRef}>
            {filtered.length === 0 ? (
              <li className="sdd-empty">
                <span className="sdd-empty-icon">🔍</span>
                <span>No results for "<strong>{search}</strong>"</span>
              </li>
            ) : (
              filtered.map((opt, idx) => {
                const label = getLabel(opt);
                const isSelected = String(opt[valueKey]) === String(value);
                const isHighlighted = idx === highlightIdx;
                return (
                  <li
                    key={opt[valueKey]}
                    data-option
                    role="option"
                    aria-selected={isSelected}
                    className={`sdd-option${isSelected ? ' sdd-option--selected' : ''}${isHighlighted ? ' sdd-option--highlighted' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    <span className="sdd-option-label">
                      {highlightText(label, search)}
                    </span>
                    {isSelected && (
                      <svg className="sdd-check" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer hint */}
          {filtered.length > 0 && (
            <div className="sdd-footer">
              <kbd>↑↓</kbd> navigate &nbsp;·&nbsp; <kbd>Enter</kbd> select &nbsp;·&nbsp; <kbd>Esc</kbd> close
            </div>
          )}
        </div>
      )}
    </div>
  );
}
