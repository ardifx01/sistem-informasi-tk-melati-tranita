"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

// Fungsi untuk memformat angka menjadi format Rupiah (tanpa "Rp")
const formatCurrency = (value: number | string): string => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(/[^\d]/g, "")) : value;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

// Fungsi untuk mengubah format Rupiah kembali menjadi angka
const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
};

// Interface props untuk komponen kita
export interface CurrencyInputProps
  extends Omit<InputProps, "onChange" | "value"> {
  value: number | string; // Nilai yang diterima bisa berupa angka atau string
  onChange: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    // State untuk nilai yang ditampilkan di input (string yang diformat)
    const [displayValue, setDisplayValue] = React.useState(
      formatCurrency(value)
    );

    // Sinkronkan displayValue jika nilai dari parent berubah
    React.useEffect(() => {
      setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numericValue = parseCurrency(rawValue);

      // Update state form di parent dengan nilai angka
      onChange(numericValue);

      // Update nilai yang ditampilkan di input dengan format
      setDisplayValue(formatCurrency(rawValue));
    };

    return (
      <Input
        type="text"
        inputMode="numeric" // Menampilkan keyboard numerik di perangkat mobile
        value={displayValue}
        onChange={handleInputChange}
        ref={ref}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
