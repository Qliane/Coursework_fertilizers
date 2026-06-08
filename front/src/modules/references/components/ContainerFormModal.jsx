import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
} from "@mui/material";

export const ContainerFormModal = ({
  open,
  onClose,
  container,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: container?.name || "",
    weight: container?.weight || "",
    width: container?.width || "",
    height: container?.height || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Название обязательно";
    if (!formData.weight && formData.weight !== 0) {
      newErrors.weight = "Вес обязателен";
    } else {
      const weightStr = formData.weight.toString().trim();
      const regex = /^(?:[0-9]|[1-9][0-9])(?:\.[0-9]{1,4})?$/;
      const num = Number(weightStr);

      if (!regex.test(weightStr) || num > 99.9999) {
        newErrors.weight =
          "Вес должен быть двузначным числом";
      } else if (num < 0) {
        newErrors.weight = "Вес не может быть отрицательным";
      }
    }
    if (!formData.width || Number(formData.width) < 0)
      newErrors.width = "Ширина должна быть неотрицательным числом";
    if (!formData.height || Number(formData.height) < 0)
      newErrors.height = "Высота должна быть неотрицательным числом";
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
      width: Number(formData.width),
      height: Number(formData.height),
    });
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {container ? "Редактировать тару" : "Добавить тару"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Название"
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Вес (кг)"
            pattern="^\\d{1,2}(\\.\\d{1,4})?$"
            type="number"
            value={formData.weight}
            onChange={handleChange("weight")}
            error={!!errors.weight}
            step="0.0001"
            min="0"
            max="99.9999"
            helperText={errors.weight}
            required
            inputProps={{ min: 0, step: 0.01 }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Ширина (м)"
            type="number"
            value={formData.width}
            onChange={handleChange("width")}
            error={!!errors.width}
            helperText={errors.width}
            required
            inputProps={{ min: 0, step: 0.01 }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Высота (м)"
            type="number"
            value={formData.height}
            onChange={handleChange("height")}
            error={!!errors.height}
            helperText={errors.height}
            required
            inputProps={{ min: 0, step: 0.01 }}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Сохранение..." : container ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
