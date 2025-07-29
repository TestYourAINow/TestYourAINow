"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface PremiumDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: any }[];
  placeholder?: string;
  icon?: any;
}

export default function PremiumDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  icon: Icon
}: PremiumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer la position du dropdown
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: Math.max(rect.width, 160) // Minimum 160px width
        });
      }
    };

    if (isOpen) {
      updatePosition();
      
      // Mettre à jour la position quand on scroll ou resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as Node;
      
      // Vérifier si on clique dans le bouton principal
      if (buttonRef.current && buttonRef.current.contains(clickedElement)) {
        return;
      }
      
      // Vérifier si on clique dans le dropdown portal
      const dropdowns = document.querySelectorAll('[data-search-dropdown]');
      for (let dropdown of dropdowns) {
        if (dropdown.contains(clickedElement)) {
          return;
        }
      }
      
      // Sinon, fermer le dropdown
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-gray-800/80 hover:border-gray-600/60 flex items-center justify-between min-w-[140px] backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className="text-gray-400" />}
            <span className="text-sm font-medium">{selectedOption?.label || placeholder}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
          />
        </button>
      </div>

      {/* Portal Dropdown */}
      {mounted && isOpen && createPortal(
        <div 
          data-search-dropdown="main"
          className="fixed bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[99999] py-2 animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                  isSelected 
                    ? 'text-blue-300 bg-blue-600/20 border-r-2 border-blue-400' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {OptionIcon && <OptionIcon size={14} className={isSelected ? 'text-blue-400' : 'text-gray-400'} />}
                <span className="font-medium">{option.label}</span>
                {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400"></div>}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}