import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton, Typography, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const renameFields = (item)=>({declaredCount: item.declaredcount,
      factCount: item.factcount,
      fertilizerId: item.fertilizerid,
      fertilizerName: item.fertilizername});

export const BillFormModal = ({
  open,
  onClose,
  bill,
  vehicles,
  drivers,
  fertilizers,
  onSubmit,
  loading
}) => {
  console.log(bill);
  const [formData, setFormData] = useState({
    driverId: bill?.driverid || '',
    vehicleIds: bill?.vehicleids || [],
    items: bill?.items.map(renameFields) || [],
  });
  const [errors, setErrors] = useState({});

  useEffect(()=>{
    setFormData({
    driverId: bill?.driverid || '',
    vehicleIds: bill?.vehicleids || [],
    items: bill?.items.map(renameFields) || [],
  })
  }, [bill])

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { fertilizerId: '', declaredCount: 1 }],
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'declaredCount' ? Number(value) : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.driverId) newErrors.driverId = 'Выберите водителя';
    if (formData.vehicleIds.length === 0) newErrors.vehicleIds = 'Выберите хотя бы одно ТС';
    if (formData.items.length === 0) newErrors.items = 'Добавьте хотя бы одно удобрение';
    formData.items.forEach((item, idx) => {
      if (!item.fertilizerId) newErrors[`item_${idx}_fertilizer`] = 'Выберите удобрение';
      if (!item.declaredCount || item.declaredCount <= 0) newErrors[`item_${idx}_count`] = 'Количество > 0';
    });
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{bill ? 'Редактировать накладную' : 'Создать транспортную накладную'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth error={!!errors.driverId}>
            <InputLabel>Водитель</InputLabel>
            <Select
              value={formData.driverId}
              label="Водитель"
              onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
              disabled={loading}
            >
              <MenuItem value="">Выберите водителя</MenuItem>
              {drivers && drivers.map(d => (
                <MenuItem key={d.userid} value={d.userid}>{`${d.surname} ${d.name} (${d.license})`}</MenuItem>
              ))}
            </Select>
            {errors.driverId && <Typography variant="caption" color="error">{errors.driverId}</Typography>}
          </FormControl>

          <FormControl fullWidth error={!!errors.vehicleIds}>
            <InputLabel>Транспортные средства</InputLabel>
            <Select
              multiple
              value={formData.vehicleIds}
              label="Транспортные средства"
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleIds: e.target.value }))}
              disabled={loading}
              renderValue={(selected) => selected.map(id => vehicles.find(v => v.id === id)?.registrationmark).join(', ')}
            >
              {vehicles && vehicles.map(v => (
                <MenuItem key={v.id} value={v.id}>{`${v.registrationmark} (${v.capacity} кг)`}</MenuItem>
              ))}
            </Select>
            {errors.vehicleIds && <Typography variant="caption" color="error">{errors.vehicleIds}</Typography>}
          </FormControl>

          <Divider><Typography>Удобрения</Typography></Divider>
          {formData.items.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth size="small" error={!!errors[`item_${idx}_fertilizer`]}>
                <InputLabel>Удобрение</InputLabel>
                <Select
                  value={item.fertilizerId}
                  label="Удобрение"
                  onChange={(e) => updateItem(idx, 'fertilizerId', e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="">Выберите</MenuItem>
                  {fertilizers.map(f => (
                    <MenuItem key={f.id} value={f.id}>{`${f.name} (${f.weight} кг/мешок)`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="number"
                label="Кол-во мешков"
                value={item.declaredCount}
                onChange={(e) => updateItem(idx, 'declaredCount', e.target.value)}
                error={!!errors[`item_${idx}_count`]}
                helperText={errors[`item_${idx}_count`]}
                disabled={loading}
                sx={{ width: 150 }}
              />
              <IconButton color="error" onClick={() => removeItem(idx)} disabled={loading}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addItem} disabled={loading}>
            Добавить удобрение
          </Button>
          {errors.items && <Typography variant="caption" color="error">{errors.items}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Сохранение...' : (bill ? 'Сохранить' : 'Создать')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};