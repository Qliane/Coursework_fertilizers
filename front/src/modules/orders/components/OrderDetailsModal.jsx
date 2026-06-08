import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent,
  Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, CircularProgress, Alert
} from '@mui/material';

export const OrderDetailsModal = ({ open, onClose, order, loading }) => {
  if (!order && !loading) return null;

  const getFertilizerDetails = (fertilizers) => {
    return fertilizers.map(f => ({
      name: f.name,
      declared: f.declaredCount,
      fact: f.factCount,
      status: f.factCount !== null ? 'Проведён' : 'Ожидает',
      difference: f.factCount !== null ? f.factCount - f.declaredCount : null,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>Детали приходного ордера #{order?.id}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : order ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Основная информация</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Номер ордера</Typography>
                      <Typography variant="body1">#{order.id}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Статус</Typography>
                      <Chip
                        label={order.realizedAt ? 'Проведён' : 'Ожидает приёмки'}
                        color={order.realizedAt ? 'success' : 'warning'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Дата создания</Typography>
                      <Typography variant="body1">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Дата разгрузки</Typography>
                      <Typography variant="body1">
                        {order.realizedAt ? new Date(order.realizedAt).toLocaleDateString('ru-RU') : 'Не проведена'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Склад</Typography>
                      <Typography variant="body1">{order.storageName || 'Не указан'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Создатель</Typography>
                      <Typography variant="body1">{order.creatorName || 'Не указан'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Список удобрений</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Удобрение</TableCell>
                          <TableCell align="right">Заявлено (мешков)</TableCell>
                          <TableCell align="right">Фактически (мешков)</TableCell>
                          <TableCell align="right">Разница</TableCell>
                          <TableCell>Статус</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFertilizerDetails(order.fertilizers || []).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.declared}</TableCell>
                            <TableCell align="right">{item.fact !== null ? item.fact : '-'}</TableCell>
                            <TableCell align="right">
                              {item.difference !== null ? (
                                <Typography color={item.difference === 0 ? 'inherit' : (item.difference > 0 ? 'success.main' : 'error.main')}>
                                  {item.difference > 0 ? '+' : ''}{item.difference}
                                </Typography>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip label={item.status} size="small" color={item.fact !== null ? 'success' : 'warning'} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Итого: {order.fertilizers?.length || 0} позиций
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {order.realizedAt && (
              <Grid item xs={12}>
                <Alert severity="success">
                  Ордер успешно проведён {new Date(order.realizedAt).toLocaleDateString('ru-RU')}
                </Alert>
              </Grid>
            )}
          </Grid>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};