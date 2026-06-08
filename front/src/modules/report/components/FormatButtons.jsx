// src/modules/report/components/FormatButtons.jsx
import { Button, ButtonGroup } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const FormatButtons = ({ onView, onDownloadCsv, onDownloadPdf, disabled }) => (
  <ButtonGroup variant="contained" size="small">
    <Button onClick={onView} disabled={disabled} startIcon={<VisibilityIcon />}>
      Показать
    </Button>
    <Button onClick={onDownloadCsv} disabled={disabled} startIcon={<TableChartIcon />}>
      CSV
    </Button>
    <Button onClick={onDownloadPdf} disabled={disabled} startIcon={<PictureAsPdfIcon />}>
      PDF
    </Button>
  </ButtonGroup>
);