// src/modules/partners/components/DriverFormModal.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import UserSelect from "@/components/common/UserSelect";
import DriverCategoriesSelect from "./DriverCategoriesSelect";

export const DriverFormModal = ({
  open,
  onClose,
  driver,
  onSubmit,
  loading,
}) => {
  console.log("DRIVER", driver, driver?.categories);
  const [formData, setFormData] = useState({
    userId: driver?.userid || "",
    license: driver?.license?.trim() || "",
    categoriesMask: driver?.categories?.trim() || 0, // битовая маска
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("ABOBA", driver?.categories?.trim());
    setFormData({
      userId: driver?.userid || "",
      license: driver?.license?.trim() || "",
      categoriesMask: driver?.categories?.trim() || 0,
    });
  }, [driver, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = "Выберите водителя";
    if (!formData.license.trim())
      newErrors.license = "Номер водительского удостоверения обязателен";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      userId: formData.userId,
      license: formData.license.trim(),
      categories: formData.categoriesMask, // отправляем число
    });
  };

  const handleUserChange = (userId) => {
    setFormData((prev) => ({ ...prev, userId }));
    if (errors.userId) setErrors((prev) => ({ ...prev, userId: "" }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {driver ? "Редактировать водителя" : "Добавить водителя"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <UserSelect
            value={formData.userId}
            onChange={handleUserChange}
            roleFilter={5}
            label="Водитель"
            required
            disabled={loading}
          />
          {errors.userId && (
            <Typography variant="caption" color="error">
              {errors.userId}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Номер водительского удостоверения"
            value={formData.license}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, license: e.target.value }));
              if (errors.license)
                setErrors((prev) => ({ ...prev, license: "" }));
            }}
            error={!!errors.license}
            helperText={errors.license}
            required
            disabled={loading}
          />

          <DriverCategoriesSelect
            value={formData.categoriesMask}
            onChange={(mask) => {
              setFormData((prev) => ({ ...prev, categoriesMask: mask }));
              if (errors.categories)
                setErrors((prev) => ({ ...prev, categories: "" }));
            }}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Сохранение..." : driver ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
