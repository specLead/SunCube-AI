import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => Promise<void> | void;
  disabled?: boolean;
  label?: string;
  id?: string;
  ariaLabel?: string;
  testId?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  disabled = false, 
  label, 
  id, 
  ariaLabel,
  testId 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      {label && (
        <span className="text-sm text-gray-300" id={`${id}-label`}>
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label && id ? `${id}-label` : undefined}
        aria-label={ariaLabel || label}
        data-testid={testId}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`
          relative w-[44px] h-[24px] rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#88EF39] focus:ring-opacity-50
          ${checked 
            ? 'bg-gradient-to-r from-[#88EF39] to-[#FF7A2D]' 
            : 'bg-white/5 border border-white/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            block w-[20px] h-[20px] bg-white rounded-full shadow-[0_2px_4px_rgba(13,34,24,0.2)] transform transition-transform duration-200 cubic-bezier(.2,.8,.2,1)
            ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
          `}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;