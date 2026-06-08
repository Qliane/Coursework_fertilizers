/* eslint-disable react-hooks/set-state-in-effect */
// src/modules/partners/components/UpdFormModal.jsx
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import { storageService } from '@/api/endpoints/storage';

export const UpdFormModal = ({ open, onClose, upd, onSubmit, loading }) => {
  const [storages, setStorages] = useState([]);
  const [loadingStorages, setLoadingStorages] = useState(false);
  const [formData, setFormData] = useState({
    conclDate: upd?.concldate ? upd.concldate.split('T')[0] : '',
    storageId: upd?.storageId || '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && !upd) {
      setLoadingStorages(true);
      storageService.getAll()
        .then(data => setStorages(data))
        .catch(err => console.error('Ошибка загрузки складов:', err))
        .finally(() => setLoadingStorages(false));
    }
  }, [open, upd]);

  const validate = () => {
    const newErrors = {};
    if (!formData.conclDate) {
      newErrors.conclDate = 'Дата заключения обязательна';
    }
    if (!formData.storageId) {
      newErrors.storageId = 'Выберите склад';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    console.log(formData, validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      conclDate: formData.conclDate,
      storageId: formData.storageId,
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{upd ? 'Редактировать УПД' : 'Создать УПД'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Дата заключения"
            type="date"
            value={formData.conclDate}
            onChange={handleChange('conclDate')}
            error={!!errors.conclDate}
            helperText={errors.conclDate}
            InputLabelProps={{ shrink: true }}
            required
            disabled={loading}
          />
          
          {!upd ? (
            <FormControl fullWidth error={!!errors.storageId} disabled={loading || loadingStorages}>
              <InputLabel>Склад</InputLabel>
              <Select
                value={formData.storageId}
                label="Склад"
                onChange={handleChange('storageId')}
              >
                {loadingStorages ? (
                  <MenuItem disabled>Загрузка...</MenuItem>
                ) : (
                  storages.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.fullname}</MenuItem>
                  ))
                )}
              </Select>
              {errors.storageId && <Typography variant="caption" color="error">{errors.storageId}</Typography>}
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label="Склад"
              value={upd.storageName || ''}
              disabled
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : (upd ? 'Сохранить' : 'Создать')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};