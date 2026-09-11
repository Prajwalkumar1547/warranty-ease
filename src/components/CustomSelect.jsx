import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export default function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  searchable = true,
  icon: GroupIcon,
  required = false,
  style = {},
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(
    opt => (typeof opt === 'object' ? opt.value === value || opt.label === value : opt === value)
  );

  const getOptionLabel = (opt) => (typeof opt === 'object' ? opt.label || opt.value : opt);
  const getOptionValue = (opt) => (typeof opt === 'object' ? opt.value || opt.label : opt);
  const getOptionBrand = (opt) => (typeof opt === 'object' ? opt.brand || opt.label || opt.value : opt);
  const getOptionSubtitle = (opt) => (typeof opt === 'object' ? opt.subtitle || opt.description || null : null);
  const getOptionIcon = (opt) => (typeof opt === 'object' ? opt.icon || null : null);

  const filteredOptions = options.filter(opt => {
    if (!searchQuery.trim()) return true;
    const labelText = getOptionLabel(opt).toLowerCase();
    const subText = (getOptionSubtitle(opt) || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return labelText.includes(query) || subText.includes(query);
  });

  const handleSelect = (opt) => {
    const val = getOptionValue(opt);
    onChange(val, opt);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : value || placeholder;
  const selectedBrand = selectedOption ? getOptionBrand(selectedOption) : value;
  const selectedIcon = selectedOption ? getOptionIcon(selectedOption) : null;

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {label && (
        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.85rem',
          borderRadius: '0.65rem',
          border: isOpen ? '1.5px solid #0066cc' : '1px solid #cbd5e1',
          background: '#ffffff',
          color: value ? '#0f172a' : '#94a3b8',
          fontSize: '0.88rem',
          fontWeight: value ? 700 : 500,
          boxShadow: isOpen ? '0 0 0 3px rgba(0, 102, 204, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
          {/* Render Brand Logo or Icon if available */}
          {selectedBrand && !selectedIcon && (
            <div style={{ width: 22, height: 22, borderRadius: '4px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BrandLogoIcon brand={selectedBrand} size={18} />
            </div>
          )}
          {selectedIcon && (
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{selectedIcon}</span>
          )}
          {GroupIcon && !selectedBrand && !selectedIcon && (
            <GroupIcon size={16} color="#64748b" style={{ flexShrink: 0 }} />
          )}

          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedLabel}
          </span>
        </div>

        <ChevronDown
          size={16}
          color="#64748b"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '0.4rem'
          }}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1050,
            background: '#ffffff',
            borderRadius: '0.85rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search Box */}
          {searchable && options.length > 4 && (
            <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.6rem' }} />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '0.35rem 0.6rem 0.35rem 2rem',
                    fontSize: '0.78rem',
                    borderRadius: '0.45rem',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div style={{ overflowY: 'auto', padding: '0.35rem 0', flex: 1, scrollbarWidth: 'thin' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const optVal = getOptionValue(opt);
                const optLabel = getOptionLabel(opt);
                const optBrand = getOptionBrand(opt);
                const optSubtitle = getOptionSubtitle(opt);
                const optIcon = getOptionIcon(opt);
                const isSelected = value === optVal || value === optLabel;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? '#0066cc' : '#0f172a',
                      fontSize: '0.85rem',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      {/* Logo or Icon */}
                      {optIcon ? (
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{optIcon}</span>
                      ) : (
                        <div style={{ width: 24, height: 24, borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 1 }}>
                          <BrandLogoIcon brand={optBrand} size={20} />
                        </div>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0066cc' : '#0f172a', lineHeight: 1.2 }}>
                          {optLabel}
                        </div>
                        {optSubtitle && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {optSubtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check size={16} color="#0066cc" strokeWidth={2.5} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
