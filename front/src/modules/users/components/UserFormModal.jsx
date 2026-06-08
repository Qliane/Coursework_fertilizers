// src/modules/users/components/UserFormModal.jsx
import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Box, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';

const ROLE_OPTIONS = [
    { id: 1, name: 'Кладовщик' },
    { id: 2, name: 'Директор склада' },
    { id: 3, name: 'Работник офиса' },
    { id: 4, name: 'Доверенное лицо' },
    { id: 5, name: 'Водитель' }
];

export const UserFormModal = ({ open, onClose, user, onSubmit, loading }) => {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        name: user?.name || '',
        surname: user?.surname || '',
        patronymic: user?.patronymic || '',
        password: '',
        roleId: user?.roleid || 3
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
        if (!formData.surname.trim()) newErrors.surname = 'Фамилия обязательна';
        if (!isEdit && !formData.password) newErrors.password = 'Пароль обязателен';
        if (!formData.roleId) newErrors.roleId = 'Роль обязательна';
        return newErrors;
    };

    const handleSubmit = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const submitData = {
            name: formData.name.trim(),
            surname: formData.surname.trim(),
            patronymic: formData.patronymic.trim() || null,
            roleId: formData.roleId
        };
        if (!isEdit && formData.password) submitData.password = formData.password;
        if (isEdit && formData.password) submitData.password = formData.password;
        onSubmit(submitData);
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? 'Редактировать пользователя' : 'Добавить пользователя'}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Имя пользователя"
                        value={formData.name}
                        onChange={handleChange('name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Фамилия"
                        value={formData.surname}
                        onChange={handleChange('surname')}
                        error={!!errors.surname}
                        helperText={errors.surname}
                        required
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Отчество"
                        value={formData.patronymic}
                        onChange={handleChange('patronymic')}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Пароль"
                        type="password"
                        value={formData.password}
                        onChange={handleChange('password')}
                        error={!!errors.password}
                        helperText={isEdit ? (errors.password || 'Оставьте пустым, чтобы не менять') : errors.password}
                        required={!isEdit}
                        disabled={loading}
                    />
                    <FormControl fullWidth error={!!errors.roleId} disabled={loading || isEdit}>
                        <InputLabel>Роль</InputLabel>
                        <Select
                            value={formData.roleId}
                            label="Роль"
                            onChange={handleChange('roleId')}
                        >
                            {ROLE_OPTIONS.map(role => (
                                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                            ))}
                        </Select>
                        {errors.roleId && <Typography variant="caption" color="error">{errors.roleId}</Typography>}
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};