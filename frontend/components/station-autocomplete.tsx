"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { MapPin, Search, X } from "lucide-react";
import { searchStations, stationByCode, type StationEntry } from "@/lib/stations";
import { cn } from "@/lib/utils";

interface StationAutocompleteProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  autoFocus?: boolean;
}

export function StationAutocomplete({
  value,
  onChange,
  label,
  placeholder = "Station code or city, e.g. NDLS",
  className,
  inputClassName,
  id,
  autoFocus,
}: StationAutocompleteProps) {
  const generatedId = useId();
  const inputId = id ?? `station-${generatedId}`;
  const listId = `${inputId}-listbox`;

  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = searchStations(query, 8);

  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }
    if (!query.toUpperCase().startsWith(value.toUpperCase())) {
      const station = stationByCode(value);
      setQuery(station ? `${station.code} · ${station.name}` : value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (station: StationEntry) => {
    setQuery(`${station.code} · ${station.name}`);
    onChange(station.code);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `${inputId}-option-${activeIndex}`
              : undefined
          }
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            const code = next.split("·")[0].trim().toUpperCase();
            if (/^[A-Z]{2,5}$/.test(code)) onChange(code);
            else if (!next.trim()) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 140)}
          onKeyDown={handleKeyDown}
          className={cn("input-base pl-10 pr-10 uppercase placeholder:normal-case", inputClassName)}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear station"
            onClick={() => {
              setQuery("");
              onChange("");
              setOpen(false);
            }}
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-card backdrop-blur-xl"
        >
          {results.map((station, index) => (
            <li key={station.code} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                id={`${inputId}-option-${index}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(station);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                  index === activeIndex ? "bg-white/[0.07]" : "hover:bg-white/[0.05]",
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-electric-soft">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white/45">{station.code}</span>
                    <span className="truncate text-sm font-medium text-white">{station.name}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-white/40">
                    {station.city} · {station.state}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
