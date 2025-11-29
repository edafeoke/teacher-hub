"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseFloat(e.target.value)];
      onValueChange?.(newValue);
    };

    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
          "accent-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        value={value[0]}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider };

