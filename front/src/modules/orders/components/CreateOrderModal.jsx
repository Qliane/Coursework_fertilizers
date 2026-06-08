// src/modules/orders/components/CreateOrderModal.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { storageService } from '@/api/endpoints/storage';
import { fertilizerService } from '@/api/endpoints/fertilizer';
import { orderService } from '@/api/endpoints/order';

export const CreateOrderModal = ({ open, onClose, onSuccess }) => {
  const [storages, setStorages] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedStorageId, setSelectedStorageId] = useState('');
  const [items, setItems] = useState([{ fertilizerId: '', declaredCount: 1 }]);

  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedStorageId('');
      setItems([{ fertilizerId: '', declaredCount: 1 }]);
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storagesData, fertilizersData] = await Promise.all([
        storageService.getAll(),
        fertilizerService.getAll()
      ]);
      setStorages(storagesData);
      setFertilizers(fertilizersData);
      if (storagesData.length > 0) {
        setSelectedStorageId(storagesData[0].id);
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { fertilizerId: '', declaredCount: 1 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'declaredCount' ? parseInt(value) || 0 : value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!selectedStorageId) {
      setError('Выберите склад');
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].fertilizerId) {
        setError(`В строке ${i + 1} не выбрано удобрение`);
        return false;
      }
      if (items[i].declaredCount <= 0) {
        setError(`В строке ${i + 1} количество должно быть больше 0`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const orderData = {
        storageId: selectedStorageId,
        fertilizers: items.map(item => ({
          fertilizerId: item.fertilizerId,
          declaredCount: item.declaredCount
        }))
      };
      await orderService.createOrder(orderData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка создания ордера');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Создание приходного ордера</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            <FormControl fullWidth>
              <InputLabel>Склад</InputLabel>
              <Select
                value={selectedStorageId}
                label="Склад"
                onChange={(e) => setSelectedStorageId(e.target.value)}
                disabled={submitting}
              >
                {storages.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.fullname}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1">Удобрения</Typography>
            {items.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth>
                  <InputLabel>Удобрение</InputLabel>
                  <Select
                    value={item.fertilizerId}
                    label="Удобрение"
                    onChange={(e) => updateItem(idx, 'fertilizerId', e.target.value)}
                    disabled={submitting}
                  >
                    <MenuItem value="">Выберите удобрение</MenuItem>
                    {fertilizers.map(f => (
                      <MenuItem key={f.id} value={f.id}>{f.name} (вес {f.weight} кг/мешок)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="number"
                  label="Количество (мешков)"
                  value={item.declaredCount}
                  onChange={(e) => updateItem(idx, 'declaredCount', e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 180 }}
                  disabled={submitting}
                />
                <IconButton
                  color="error"
                  onClick={() => removeItem(idx)}
                  disabled={submitting || items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addItem}
              disabled={submitting}
              sx={{ alignSelf: 'flex-start' }}
            >
              Добавить удобрение
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || submitting}>
          {submitting ? 'Создание...' : 'Создать ордер'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};