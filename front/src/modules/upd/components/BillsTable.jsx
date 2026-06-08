import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Chip, Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ELECTRONIC_BILL_STATUS, ELECTRONIC_BILL_STATUS_LABELS, ROLES } from '@/utils/constants';

export const BillsTable = ({ bills, canManage, canSign, onEdit, onDelete, onSign, userRoleId }) => {
  const getActionButton = (bill) => {
    const status = bill.electronicBillStatus;
    if (!canSign) return null;

    if (userRoleId === ROLES.DIRECTOR && status === ELECTRONIC_BILL_STATUS.PENDING_SHIPMENT) {
      return (
        <Button size="small" variant="outlined" onClick={() => onSign(bill.id)}>
          Подписать
        </Button>
      );
    }

    if (userRoleId === ROLES.TRUSTED_PERSON) {
      if (status === ELECTRONIC_BILL_STATUS.SIGNED_BY_DIRECTOR) {
        return (
          <Button size="small" variant="outlined" onClick={() => onSign(bill.id)}>
            Подписать
          </Button>
        );
      }
      if (status === ELECTRONIC_BILL_STATUS.SIGNED_BY_CLIENT) {
        return (
          <Button size="small" variant="contained" color="success" onClick={() => onSign(bill.id)}>
            Принять
          </Button>
        );
      }
    }

    return null;
  };

  if (bills.length === 0) {
    return <Box sx={{ p: 2, textAlign: 'center' }}><Typography>Нет транспортных накладных</Typography></Box>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Водитель</TableCell>
            <TableCell>Удобрения</TableCell>
            <TableCell>Статус ЭТрН</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.drivername}</TableCell>
              <TableCell>
                {bill.items?.map(i => `${i.fertilizername} x${i.declaredcount}`).join(', ') || '—'}
              </TableCell>
              <TableCell>
                <Chip
                  label={ELECTRONIC_BILL_STATUS_LABELS[bill.electronicBillStatus] || 'Не создана'}
                  color={bill.electronicBillStatus === ELECTRONIC_BILL_STATUS.ACCEPTED ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {canManage && (
                    <>
                      <IconButton size="small" onClick={() => onEdit(bill)} title="Редактировать">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete(bill.id)} title="Удалить">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                  {getActionButton(bill)}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};