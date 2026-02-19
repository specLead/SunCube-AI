import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleSwitch from '../../components/ToggleSwitch';
import '@testing-library/jest-dom';

describe('ToggleSwitch', () => {
  it('renders correctly with label', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} label="Test Toggle" id="test-toggle" />);
    expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    const { rerender } = render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

    rerender(<ToggleSwitch checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);
    
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('is accessible via keyboard', () => {
    const handleChange = jest.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);
    
    const switchEl = screen.getByRole('switch');
    switchEl.focus();
    fireEvent.keyDown(switchEl, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(switchEl, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('does not fire when disabled', () => {
    const handleChange = jest.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} disabled />);
    
    const switchEl = screen.getByRole('switch');
    fireEvent.click(switchEl);
    expect(handleChange).not.toHaveBeenCalled();
    
    fireEvent.keyDown(switchEl, { key: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
  });
});