// src/components/common/DriverCategoriesChips.jsx
import { Box, Chip, Tooltip } from '@mui/material';

// Определение категорий и их битовых значений (должно совпадать с DriverCategoriesSelect)
const CATEGORIES = [
  { value: 1, label: 'A' },
  { value: 2, label: 'B' },
  { value: 4, label: 'C' },
  { value: 8, label: 'D' },
  { value: 16, label: 'E' },
  { value: 32, label: 'BE' },
  { value: 64, label: 'CE' },
  { value: 128, label: 'DE' },
  { value: 256, label: 'C1' },
  { value: 512, label: 'D1' },
  { value: 1024, label: 'C1E' },
  { value: 2048, label: 'D1E' },
  { value: 4096, label: 'M' },
  { value: 8192, label: 'Tm' },
  { value: 16384, label: 'Tb' },
];

/**
 * Преобразует битовую маску (число или строку) в массив названий категорий
 */
const maskToLabels = (mask) => {
  if (!mask) return [];
  const numericMask = typeof mask === 'string' ? parseInt(mask, 10) : mask;
  if (isNaN(numericMask)) return [];
  return CATEGORIES.filter(cat => (numericMask & cat.value) === cat.value).map(cat => cat.label);
};

export const DriverCategoriesChips = ({ value, maxChips = 3, size = "small" }) => {
  const categories = maskToLabels(value);
  
  if (!categories.length) {
    return <span style={{ color: '#9e9e9e' }}>—</span>;
  }

  const visibleChips = categories.slice(0, maxChips);
  const remainingCount = categories.length - maxChips;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {visibleChips.map((label) => (
        <Chip key={label} label={label} size={size} variant="outlined" />
      ))}
      {remainingCount > 0 && (
        <Tooltip title={categories.slice(maxChips).join(', ')}>
          <Chip label={`+${remainingCount}`} size={size} variant="outlined" color="primary" />
        </Tooltip>
      )}
    </Box>
  );
};
