/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  Typography,
} from "@mui/material";
import UserSelect from "@/components/common/UserSelect";

const ROLE_FILTER = [1, 2];

export const EmployeeFormModal = ({
  open,
  onClose,
  employee,
  onSubmit,
  loading,
  loadingUsers,
}) => {
  const [formData, setFormData] = useState({
    userId: employee?.userid || "",
    snils: employee?.snils || "",
    inn: employee?.inn || "",
  });
  const [errors, setErrors] = useState({});

  useEffect(()=>{
    setFormData({
    userId: employee?.userid || "",
    snils: employee?.snils || "",
    inn: employee?.inn || "",
  })
  }, [employee])

  const validate = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userid = "Выберите пользователя";
    if (!formData.snils.trim()) newErrors.snils = "СНИЛС обязателен";
    if (!formData.inn.trim()) newErrors.inn = "ИНН обязателен";
    else if (!/^\d{10}$|^\d{12}$/.test(formData.inn.replace(/\D/g, ""))) {
      newErrors.inn = "ИНН должен содержать 10 или 12 цифр";
    }
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

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleUserChange = (userid) => {
  setFormData((prev) => ({ ...prev, userId: userid }));
  if (errors.userid) setErrors((prev) => ({ ...prev, userId: "" }));
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {employee ? "Редактировать сотрудника" : "Добавить сотрудника"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth error={!!errors.userid}>
            <UserSelect
              value={formData.userId}
              onChange={handleUserChange}
              roleFilter={ROLE_FILTER}
              label="Пользователь"
              disabled={loading || loadingUsers}
            />
            {errors.userid && (
              <Typography variant="caption" color="error">
                {errors.userid}
              </Typography>
            )}
          </FormControl>
          <TextField
            fullWidth
            label="СНИЛС"
            value={formData.snils}
            onChange={handleChange("snils")}
            error={!!errors.snils}
            helperText={errors.snils}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="ИНН"
            value={formData.inn}
            onChange={handleChange("inn")}
            error={!!errors.inn}
            helperText={errors.inn}
            required
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingUsers}
        >
          {loading ? "Сохранение..." : employee ? "Сохранить" : "Добавить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};