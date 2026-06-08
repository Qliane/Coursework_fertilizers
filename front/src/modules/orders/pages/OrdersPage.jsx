// src/modules/orders/pages/OrdersPage.jsx (дополняем)
import { useState } from 'react';
import { Box, Snackbar, Alert, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useOrders } from '../hooks/useOrders';
import { OrdersFilters } from '../components/OrdersFilters';
import { OrdersTable } from '../components/OrdersTable';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { usePermissions } from '@/hooks/usePermissions';

export const OrdersPage = () => {
  const {
    orders,
    loading,
    error,
    filters,
    pagination,
    storages,
    updateFilter,
    resetFilters,
    setPage,
    receiveOrder,
    refetch,
  } = useOrders();

  const { hasPermission } = usePermissions();
  const canReceiveOrders = hasPermission('RECEIVE_ORDERS');
  const canCreateOrder = hasPermission('MANAGE_ORDERS'); // или VIEW_ORDERS + MANAGE_ORDERS

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleReceive = async (orderId) => {
    try {
      await receiveOrder(orderId);
      setSnackbar({ open: true, message: 'Приёмка успешно проведена', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleCreateSuccess = () => {
    setSnackbar({ open: true, message: 'Ордер успешно создан', severity: 'success' });
    refetch();
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Приходные ордера</Typography>
        {canCreateOrder && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Создать ордер
          </Button>
        )}
      </Box>

      <OrdersFilters
        filters={filters}
        storages={storages}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        onApply={refetch}
        disabled={loading}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <OrdersTable
        orders={orders}
        loading={loading}
        pagination={pagination}
        canReceive={canReceiveOrders}
        onViewDetails={handleViewDetails}
        onReceive={handleReceive}
        onPageChange={setPage}
      />

      <OrderDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        order={selectedOrder}
        loading={false}
      />

      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};