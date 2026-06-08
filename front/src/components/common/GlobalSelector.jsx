// src/components/common/GlobalSelector.jsx
import { Box, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import BusinessIcon from '@mui/icons-material/Business';
import { useGlobalSelection } from '@/contexts/GlobalSelectionContext';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const GlobalSelector = () => {
  const { user } = useAuth();
  const {
    storages,
    partners,
    selectedStorageId,
    selectedPartnerId,
    setSelectedStorageId,
    setSelectedPartnerId,
    mode,
    setMode,
  } = useGlobalSelection();

  if (user?.roleId === 1) {
    const storage = storages.find(s => s.id === selectedStorageId);
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 0.5, borderRadius: 2 }}>
        <WarehouseIcon fontSize="small" />
        <span>{storage?.fullname || 'Склад'}</span>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ToggleButtonGroup
        size="small"
        value={mode}
        exclusive
        onChange={(e, newMode) => newMode && setMode(newMode)}
        sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
      >
        <ToggleButton value="storage">
          <WarehouseIcon fontSize="small" sx={{ mr: 0.5 }} /> Склад
        </ToggleButton>
        <ToggleButton value="partner">
          <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} /> Партнёр
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === 'storage' && (
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
          <InputLabel sx={{ color: 'white' }}>Склад</InputLabel>
          <Select
            value={selectedStorageId || ''}
            label="Склад"
            onChange={(e) => setSelectedStorageId(e.target.value)}
            sx={{ color: 'white' }}
          >
            {storages.map(storage => (
              <MenuItem key={storage.id} value={storage.id}>{storage.fullname}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {mode === 'partner' && (
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
          <InputLabel sx={{ color: 'white' }}>Партнёр</InputLabel>
          <Select
            value={selectedPartnerId || ''}
            label="Партнёр"
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            sx={{ color: 'white' }}
          >
            {partners.map(partner => (
              <MenuItem key={partner.id} value={partner.id}>{partner.fullname}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default GlobalSelector;