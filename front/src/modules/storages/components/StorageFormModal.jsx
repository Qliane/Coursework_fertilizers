import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField } from '@mui/material';

export const StorageFormModal = ({ open, onClose, storage, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: storage?.fullname || '',
    address: storage?.address || '',
    phone: (storage?.phone || '').trim(),
    capacity: storage?.capacity || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Название обязательно';
    if (!formData.address.trim()) newErrors.address = 'Адрес обязателен';
    if (formData.capacity && Number(formData.capacity) < 0) {
      newErrors.capacity = 'Вместимость не может быть отрицательной';
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
      fullName: formData.fullName.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim() || null,
      capacity: formData.capacity ? Number(formData.capacity) : null,
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{storage ? 'Редактировать склад' : 'Добавить склад'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Название"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Адрес"
            value={formData.address}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Телефон"
            value={formData.phone}
            onChange={handleChange('phone')}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Вместимость (мешков)"
            type="number"
            value={formData.capacity}
            onChange={handleChange('capacity')}
            error={!!errors.capacity}
            helperText={errors.capacity}
            inputProps={{ min: 0 }}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : (storage ? 'Сохранить' : 'Добавить')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};