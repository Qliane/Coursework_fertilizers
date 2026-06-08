// src/modules/report/pages/ReportsPage.jsx
import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { StockReport } from '../components/StockReport';
import { IncomingReport } from '../components/IncomingReport';
import { OutgoingReport } from '../components/OutgoingReport';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ROLES } from '@/utils/constants';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ marginTop: 16 }}>
    {value === index && children}
  </div>
);

export const ReportsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  const isTrustedPerson = user?.roleId === ROLES.TRUSTED_PERSON;

  const activeTab = isTrustedPerson ? 2 : tab;

  const handleTabChange = (e, newValue) => {
    if (!isTrustedPerson) setTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отчёты
      </Typography>

      <Paper sx={{ width: '100%' }}>
        {!isTrustedPerson && (
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Состояние склада" />
            <Tab label="Приход" />
            <Tab label="Отгрузки" />
          </Tabs>
        )}

        <TabPanel value={activeTab} index={0}>
          <StockReport />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <IncomingReport />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <OutgoingReport />
        </TabPanel>
      </Paper>
    </Box>
  );
};