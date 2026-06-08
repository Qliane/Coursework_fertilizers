import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const VehicleFormModal = ({ open, onClose, vehicle, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    registrationMark: vehicle?.registrationmark || '',
    type: vehicle?.type || 'T',
    capacity: vehicle?.capacity || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.registrationMark.trim()) {
      newErrors.registrationMark = 'Регистрационный номер обязателен';
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Грузоподъёмность должна быть положительным числом';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      registrationMark: formData.registrationMark.trim(),
      type: formData.type,
      capacity: Number(formData.capacity),
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{vehicle ? 'Редактировать ТС' : 'Добавить ТС'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Регистрационный номер"
            value={formData.registrationMark}
            onChange={handleChange('registrationMark')}
            error={!!errors.registrationMark}
            helperText={errors.registrationMark}
            required
            disabled={loading}
          />
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Тип ТС</InputLabel>
            <Select
              value={formData.type}
              label="Тип ТС"
              onChange={handleChange('type')}
            >
              <MenuItem value="T">Грузовой</MenuItem>
              <MenuItem value="R">Прицеп</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Грузоподъёмность (кг)"
            type="number"
            value={formData.capacity}
            onChange={handleChange('capacity')}
            error={!!errors.capacity}
            helperText={errors.capacity}
            required
            inputProps={{ min: 0.1, step: 0.1 }}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : (vehicle ? 'Сохранить' : 'Добавить')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};