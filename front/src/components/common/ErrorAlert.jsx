import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const ErrorAlert = ({ error, onClose, title = 'Ошибка' }) => {
  if (!error) return null;
  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        action={
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>{title}</AlertTitle>
        {error}
      </Alert>
    </Collapse>
  );
};