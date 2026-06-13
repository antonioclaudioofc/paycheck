"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  label?: string;
  value?: string | number;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  children: React.ReactNode;
  className?: string;
  name?: string;
  placeholder?: string;
}

export function Select({
  label,
  value,
  onChange,
  children,
  className = "",
  name,
  placeholder = "Selecione uma opção",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = React.Children.toArray(children)
    .map((child) => {
      if (React.isValidElement(child)) {
        const props = (child as any).props;
        return {
          value: String(props.value ?? ""),
          label: String(props.children ?? ""),
        };
      }
      return null;
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null);

  const selectedOption = options.find((opt) => opt.value === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 260);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({
        target: {
          value: optionValue,
          name,
        },
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm cursor-pointer shadow-sm transition-all duration-200 hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            isOpen ? "ring-2 ring-primary border-transparent" : ""
          } ${className}`}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute left-0 right-0 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in-50 duration-200 ${
              openUpward
                ? "bottom-full mb-2 slide-in-from-bottom-2 origin-bottom"
                : "top-full mt-2 slide-in-from-top-2 origin-top"
            }`}
          >
            {options.length === 0 ? (
              <div className="px-4 py-2.5 text-sm text-muted-foreground text-center">
                Sem opções disponíveis
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Select;
