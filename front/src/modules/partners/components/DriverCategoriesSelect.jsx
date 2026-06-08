// src/components/common/DriverCategoriesSelect.jsx
import { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Checkbox,
  ListItemText,
} from "@mui/material";

// Определение категорий и их битовых значений
const CATEGORIES = [
  { value: 1, label: "A" },
  { value: 2, label: "B" },
  { value: 4, label: "C" },
  { value: 8, label: "D" },
  { value: 16, label: "E" },
  { value: 32, label: "BE" },
  { value: 64, label: "CE" },
  { value: 128, label: "DE" },
  { value: 256, label: "C1" },
  { value: 512, label: "D1" },
  { value: 1024, label: "C1E" },
  { value: 2048, label: "D1E" },
  { value: 4096, label: "M" },
  { value: 8192, label: "Tm" },
  { value: 16384, label: "Tb" },
];

/**
 * Преобразует битовую маску (число или строку) в массив значений категорий
 * @param {number|string} mask - битовая маска (может быть числом или строкой)
 * @returns {number[]} массив выбранных значений (например [1,2,4])
 */
const maskToArray = (mask) => {
  if (!mask) return [];
  const numericMask = typeof mask === "string" ? parseInt(mask, 10) : mask;
  console.log(numericMask, numericMask & 2)
  if (isNaN(numericMask)) return [];
  return CATEGORIES.filter(
    (cat) => (numericMask & cat.value) === cat.value,
  ).map((cat) => cat.value);
};

/**
 * Преобразует массив значений категорий в битовую маску
 * @param {number[]} arr - массив выбранных значений
 * @returns {number} битовая маска
 */
const arrayToMask = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0);
};

const DriverCategoriesSelect = ({
  value,
  onChange,
  label = "Категории прав",
  disabled = false,
  size = "small",
}) => {
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    console.log(value, maskToArray(value));
    setSelectedValues(maskToArray(value));
  }, [value]);

  const handleChange = (event) => {
    const newSelectedValues = event.target.value;
    setSelectedValues(newSelectedValues);
    const newMask = arrayToMask(newSelectedValues);
    onChange(newMask);
  };

  return (
    <FormControl fullWidth size={size} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedValues}
        onChange={handleChange}
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((val) => (
              <Chip
                key={val}
                label={CATEGORIES.find((c) => c.value === val)?.label || val}
                size="small"
              />
            ))}
          </Box>
        )}
      >
        {CATEGORIES.map((category) => (
          <MenuItem key={category.value} value={category.value}>
            <Checkbox checked={selectedValues.indexOf(category.value) > -1} />
            <ListItemText primary={category.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DriverCategoriesSelect;
