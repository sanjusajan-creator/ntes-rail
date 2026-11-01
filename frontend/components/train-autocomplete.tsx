"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Loader2, Search, TrainFront, X } from "lucide-react";
import { searchTrains } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TrainAutocompleteProps {
  value: string;
  onChange: (trainNumber: string) => void;
  onSelectTrain?: (train: SearchResult) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
}

export function TrainAutocomplete({
  value,
  onChange,
  onSelectTrain,
  label,
  placeholder = "Train number or name, e.g. 12301",
  autoFocus,
  className,
  inputClassName,
  id,
}: TrainAutocompleteProps) {
  const generatedId = useId();
  const inputId = id ?? `train-${generatedId}`;
  const listId = `${inputId}-listbox`;

  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the visible text in sync when the parent changes the value.
  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }
    const numeric = query.match(/\d{4,6}/)?.[0];
    if (numeric !== value) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    const isPlainNumber = /^\d{4,6}$/.test(trimmed);
    if (touched && isPlainNumber) onChange(trimmed);

    if (!touched || trimmed.length < 3 || isPlainNumber) {
      setResults([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const response = await searchTrains(trimmed, { signal: controller.signal });
        setResults(response.trains.slice(0, 8));
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, touched]);

  const showDropdown = open && (loading || results.length > 0 || query.trim().length >= 3);

  const handleSelect = (train: SearchResult) => {
    setQuery(`${train.number} · ${train.name}`);
    onChange(train.number);
    onSelectTrain?.(train);
    setOpen(false);
    setResults([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
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

  const helper = useMemo(() => {
    if (loading) return "Searching trains…";
    if (showDropdown && !loading && results.length === 0 && query.trim().length >= 3 && !/^\d{4,6}$/.test(query.trim())) {
      return "No trains matched. Try a number like 12301.";
    }
    return null;
  }, [loading, showDropdown, results.length, query]);

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
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={showDropdown}
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
            setTouched(true);
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 140);
          }}
          onKeyDown={handleKeyDown}
          className={cn("input-base pl-10 pr-10", inputClassName)}
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-saffron" />
        ) : query ? (
          <button
            type="button"
            aria-label="Clear train"
            onClick={() => {
              setQuery("");
              setResults([]);
              onChange("");
              setOpen(false);
            }}
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {helper ? <p className="mt-2 text-xs text-white/40">{helper}</p> : null}

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-card backdrop-blur-xl"
        >
          {results.map((train, index) => (
            <li key={train.number} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                id={`${inputId}-option-${index}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  handleSelect(train);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                  index === activeIndex ? "bg-white/[0.07]" : "hover:bg-white/[0.05]",
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-saffron">
                  <TrainFront className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white/45">{train.number}</span>
                    <span className="truncate text-sm font-medium text-white">{train.name}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-white/40">
                    {train.source.code} → {train.destination.code} · {train.typeLabel}
                  </span>
                </span>
              </button>
            </li>
          ))}

          {!loading && results.length === 0 && query.trim().length >= 3 && (
            <li className="px-3 py-4 text-center text-xs text-white/40">
              No trains found for “{query.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
