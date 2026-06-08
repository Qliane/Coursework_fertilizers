import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField } from '@mui/material';
import UserSelect from '@/components/common/UserSelect';

export const PartnerFormModal = ({ open, onClose, partner, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    inn: partner?.inn || '',
    fullname: partner?.fullname || '',
    phone: (partner?.phone || '').trim(),
    factaddress: partner?.factaddress || '',
    postaddress: partner?.postaddress || '',
    userId: partner?.userid || '',  // добавлено поле userId
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.inn.trim()) newErrors.inn = 'ИНН обязателен';
    else if (!/^\d{10}$|^\d{12}$/.test(formData.inn.replace(/\D/g, ''))) {
      newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
    }
    if (!formData.fullname.trim()) newErrors.fullname = 'Наименование обязательно';
    if (!formData.postaddress.trim()) newErrors.postaddress = 'Юридический адрес обязателен';
    if (!formData.userId) newErrors.userId = 'Выберите доверенное лицо';
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      inn: formData.inn.trim(),
      fullName: formData.fullname.trim(),
      phone: formData.phone.trim() || null,
      factAddress: formData.factaddress.trim() || null,
      postAddress: formData.postaddress.trim(),
      userId: formData.userId,
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{partner ? 'Редактировать партнёра' : 'Добавить партнёра'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="ИНН"
            value={formData.inn}
            onChange={handleChange('inn')}
            error={!!errors.inn}
            helperText={errors.inn}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Полное наименование"
            value={formData.fullname}
            onChange={handleChange('fullname')}
            error={!!errors.fullname}
            helperText={errors.fullname}
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
            label="Фактический адрес"
            value={formData.factaddress}
            onChange={handleChange('factaddress')}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Юридический адрес"
            value={formData.postaddress}
            onChange={handleChange('postaddress')}
            error={!!errors.postaddress}
            helperText={errors.postaddress}
            required
            disabled={loading}
          />
          {/* Компонент выбора доверенного лица */}
          <UserSelect
            value={formData.userId}
            onChange={(userId) => {
              setFormData(prev => ({ ...prev, userId }));
              if (errors.userId) setErrors(prev => ({ ...prev, userId: '' }));
            }}
            roleFilter={4}
            label="Доверенное лицо"
            required
            disabled={loading}
          />
          {errors.userId && (
            <Typography variant="caption" color="error">{errors.userId}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : (partner ? 'Сохранить' : 'Добавить')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};