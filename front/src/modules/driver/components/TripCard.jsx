// src/modules/driver/components/TripCard.jsx
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { ELECTRONIC_BILL_STATUS_LABELS } from '@/utils/constants';

const getStatusColor = (status) => {
  switch (status) {
    case 0: return 'warning';
    case 1: return 'info';
    case 2: return 'primary';
    case 3: return 'success';
    default: return 'default';
  }
};

export const TripCard = ({ upd }) => {
  const conclDate = upd.conclDate ? new Date(upd.conclDate).toLocaleDateString('ru-RU') : '—';
  const shipDate = upd.shipDate ? new Date(upd.shipDate).toLocaleDateString('ru-RU') : '—';

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Партнёр</Typography>
            <Typography variant="body1">{upd.partner?.fullName || '—'}</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Склад</Typography>
            <Typography variant="body1">{upd.storage?.fullName || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Дата заключения</Typography>
            <Typography variant="body1">{conclDate}</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Дата отгрузки</Typography>
            <Typography variant="body1">{shipDate}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Транспортные накладные</Typography>
        {upd.bills && upd.bills.length > 0 ? (
          upd.bills.map((bill, idx) => (
            <Accordion key={bill.billId || idx} disableGutters elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                  <LocalShippingIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Накладная #{bill.billId}</strong>
                  </Typography>
                  {bill.electronicBill && (
                    <Chip
                      label={ELECTRONIC_BILL_STATUS_LABELS[bill.electronicBill.status] || 'Неизвестно'}
                      size="small"
                      color={getStatusColor(bill.electronicBill.status)}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Водитель: {bill.driver?.name || '—'}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>Транспортные средства:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {bill.vehicles?.map(veh => (
                    <Chip key={veh.id} label={`${veh.registrationmark} (${veh.capacity} кг)`} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>Удобрения:</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Удобрение</TableCell>
                        <TableCell align="right">Заявлено (мешков)</TableCell>
                        <TableCell align="right">Фактически (мешков)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bill.items?.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.fertilizername}</TableCell>
                          <TableCell align="right">{item.declaredcount}</TableCell>
                          <TableCell align="right">{item.factcount ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">Нет накладных</Typography>
        )}
      </CardContent>
    </Card>
  );
};