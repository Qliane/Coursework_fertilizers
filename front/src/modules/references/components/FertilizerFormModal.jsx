import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const FertilizerFormModal = ({ open, onClose, fertilizer, containers, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: fertilizer?.name || '',
    weight: fertilizer?.weight || '',
    containerId: fertilizer?.containerId || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Название обязательно';
    if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = 'Вес должен быть положительным числом';
    if (!formData.containerId) newErrors.containerId = 'Выберите тару';
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      name: formData.name.trim(),
      weight: Number(formData.weight),
      containerId: Number(formData.containerId),
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{fertilizer ? 'Редактировать удобрение' : 'Добавить удобрение'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Название"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Вес (кг)"
            type="number"
            value={formData.weight}
            onChange={handleChange('weight')}
            error={!!errors.weight}
            helperText={errors.weight}
            required
            inputProps={{ min: 0.1, step: 0.1 }}
            disabled={loading}
          />
          <FormControl fullWidth error={!!errors.containerId} disabled={loading}>
            <InputLabel>Тара</InputLabel>
            <Select
              value={formData.containerId}
              label="Тара"
              onChange={handleChange('containerId')}
            >
              <MenuItem value="">Выберите тару</MenuItem>
              {containers.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
            {errors.containerId && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {errors.containerId}
              </Box>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : (fertilizer ? 'Сохранить' : 'Добавить')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};