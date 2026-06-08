/* eslint-disable no-unused-vars */
// src/modules/storages/pages/StorageDetailPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useStorageDetails } from '../hooks/useStorageDetails';
import { EmployeesTable } from '../components/EmployeesTable';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { StorageFormModal } from '../components/StorageFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { OrderDetailsModal } from '@/modules/orders/components/OrderDetailsModal';
import { useStorages } from '../hooks/useStorages';

// Временная заглушка для загрузки доступных пользователей (должна быть реализована в API)
const fetchAvailableUsers = async () => {
  return [];
};

export const StorageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { storage, employees, orders, loading, error, addEmployee, updateEmployee, deleteEmployee, refetch } = useStorageDetails(id);
  const { updateStorage } = useStorages();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('MANAGE_STORAGES');

  const [tabValue, setTabValue] = useState(0);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [storageEditModalOpen, setStorageEditModalOpen] = useState(false);
  const [storageEditLoading, setStorageEditLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await fetchAvailableUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.error('Ошибка загрузки пользователей', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    loadAvailableUsers();
    setEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    loadAvailableUsers();
    setEmployeeModalOpen(true);
  };

  const handleDeleteEmployeeClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleSubmitEmployee = async (data) => {
    setFormLoading(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.userId, data);
        setSnackbar({ open: true, message: 'Сотрудник обновлён', severity: 'success' });
      } else {
        await addEmployee(data);
        setSnackbar({ open: true, message: 'Сотрудник добавлен', severity: 'success' });
      }
      setEmployeeModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
    refetch();
  };

  const handleConfirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.userid);
      setSnackbar({ open: true, message: 'Сотрудник удалён', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
    refetch();
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleEditStorage = () => {
    setStorageEditModalOpen(true);
  };

  const handleStorageUpdate = async (data) => {
    setStorageEditLoading(true);
    try {
      await updateStorage(id, data);
      setSnackbar({ open: true, message: 'Склад обновлён', severity: 'success' });
      setStorageEditModalOpen(false);
      refetch();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setStorageEditLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!storage) return <Alert severity="error">Склад не найден</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/storages')}><ArrowBackIcon /></IconButton>
          <Typography variant="h4">{storage.fullname}</Typography>
        </Box>
        {canManage && (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditStorage}>
            Редактировать склад
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">Адрес</Typography>
        <Typography>{storage.address}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Телефон</Typography>
        <Typography>{storage.phone || '—'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Вместимость</Typography>
        <Typography>{storage.capacity ? `${storage.capacity} мешков` : '—'}</Typography>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Сотрудники" />
          <Tab label="Приходные ордера" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <EmployeesTable
              employees={employees}
              onAdd={handleAddEmployee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployeeClick}
              canManage={canManage}
            />
          )}
          {tabValue === 1 && (
            <Box>
              {orders.length === 0 ? (
                <Typography color="text.secondary">Нет приходных ордеров</Typography>
              ) : (
                <List>
                  {orders.map((order, index) => (
                    <Box key={order.id}>
                      <ListItemButton onClick={() => handleViewOrder(order)}>
                        <ListItemText
                          primary={`Ордер #${order.id}`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                Дата создания: {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Создатель: {order.creatorName || 'Не указан'}
                              </Typography>
                              <br />
                              <Chip
                                label={order.realizedAt ? 'Проведён' : 'Ожидает приёмки'}
                                color={order.realizedAt ? 'success' : 'warning'}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </>
                          }
                        />
                      </ListItemButton>
                      {index < orders.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Модалка редактирования склада */}
      <StorageFormModal
        open={storageEditModalOpen}
        onClose={() => setStorageEditModalOpen(false)}
        storage={storage}
        onSubmit={handleStorageUpdate}
        loading={storageEditLoading}
      />

      <EmployeeFormModal
        key={editingEmployee?.userId || 'new'}
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        employee={editingEmployee}
        onSubmit={handleSubmitEmployee}
        loading={formLoading}
        availableUsers={availableUsers}
        loadingUsers={loadingUsers}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteEmployee}
        title="Удаление сотрудника"
        content={`Удалить сотрудника ${employeeToDelete?.surname} ${employeeToDelete?.name}?`}
        confirmText="Удалить"
      />

      <OrderDetailsModal
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
        loading={orderLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};