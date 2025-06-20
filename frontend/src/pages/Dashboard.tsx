import { Typography, Box, Paper, Grid, Stack, Divider, Card, CardContent, List, ListItem, ListItemText, Chip, ListItemButton, InputAdornment, TextField, Avatar, Button } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useMemo, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, isAfter, isBefore, isEqual, startOfToday, startOfMonth, endOfToday, subDays, eachDayOfInterval, addDays } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';
import { LineChart, Line, CartesianGrid } from 'recharts';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';
import { setTickets } from '../features/tickets/ticketSlice';

const COLORS = ['#00b87c', '#009e6d', '#B7ECB7'];

function ticketsToCSV(tickets: any[]) {
  if (!tickets.length) return '';
  const header = ['ID', 'Subject', 'Status', 'Priority', 'Assignee', 'Submitter', 'Created'];
  const rows = tickets.map(t => [
    t.id,
    '"' + t.subject.replace(/"/g, '""') + '"',
    t.status,
    t.priority,
    t.assignee || '',
    t.submitter,
    t.id ? new Date(t.id).toLocaleString() : '',
  ]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const tickets = useSelector((state: RootState) => state.tickets);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [start, end] = dateRange;
  const presets = [
    {
      label: 'Today',
      range: [startOfToday(), endOfToday()] as [Date, Date],
    },
    {
      label: 'Last 7 Days',
      range: [subDays(startOfToday(), 6), endOfToday()] as [Date, Date],
    },
    {
      label: 'This Month',
      range: [startOfMonth(new Date()), endOfToday()] as [Date, Date],
    },
    {
      label: 'All Time',
      range: [null, null] as [Date | null, Date | null],
    },
  ];
  const isPresetActive = (range: [Date | null, Date | null]) => {
    if (!start && !end && !range[0] && !range[1]) return true;
    return (
      (start?.toDateString() === range[0]?.toDateString() || (!start && !range[0])) &&
      (end?.toDateString() === range[1]?.toDateString() || (!end && !range[1]))
    );
  };
  const handlePreset = (range: [Date | null, Date | null]) => setDateRange(range);
  const handleStartChange = (date: Date | null) => setDateRange([date, end]);
  const handleEndChange = (date: Date | null) => setDateRange([start, date]);
  const getCreatedDate = (ticket: any) => {
    if (ticket.createdAt) return new Date(ticket.createdAt);
    if (ticket.id) return new Date(ticket.id);
    return new Date();
  };

  // Filter tickets by date range
  const filteredByDate = useMemo(() => {
    if (!start && !end) return tickets;
    return tickets.filter(t => {
      const created = getCreatedDate(t);
      if (start && isBefore(created, start)) return false;
      if (end && isAfter(created, end)) return false;
      return true;
    });
  }, [tickets, start, end]);

  // Compute stats from filtered ticket data
  const openCount = filteredByDate.filter(t => t.status === 'Open' || t.status === 'OPEN').length;
  const inProgressCount = filteredByDate.filter(t => t.status === 'In Progress' || t.status === 'IN_PROGRESS').length;
  const closedCount = filteredByDate.filter(t => t.status === 'Closed' || t.status === 'CLOSED').length;

  const ticketStats = [
    { status: 'Open', count: openCount },
    { status: 'In Progress', count: inProgressCount },
    { status: 'Closed', count: closedCount },
  ];

  const priorityCounts = filteredByDate.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const priorityStats = [
    { name: 'High', value: priorityCounts['High'] || 0 },
    { name: 'Medium', value: priorityCounts['Medium'] || 0 },
    { name: 'Low', value: priorityCounts['Low'] || 0 },
  ];
  const filteredTickets = useMemo(() => {
    return [...filteredByDate]
      .filter(t =>
        (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        ((t.status || '').toLowerCase().includes(search.toLowerCase())) ||
        ((t.priority || '').toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        const aId = a.id || a._id;
        const bId = b.id || b._id;
        if (!aId || !bId) return 0;
        return String(bId).localeCompare(String(aId));
      })
      .slice(0, 5);
  }, [filteredByDate, search]);

  // Recent activity: last 10 ticket creations and messages
  const recentActivity: { who: string; action: string; time: string }[] = [];
  filteredByDate.forEach(ticket => {
    recentActivity.push({
      who: ticket.submitter || ticket.createdBy?.email || '',
      action: `Created ticket "${ticket.subject}"`,
      time: ticket.createdAt ? format(getCreatedDate(ticket), 'HH:mm') : '',
    });
    if (ticket.messages) {
      ticket.messages.slice(-2).forEach(msg => {
        recentActivity.push({
          who: msg.sender,
          action: `Messaged on ticket "${ticket.subject}"`,
          time: msg.time,
        });
      });
    }
  });
  recentActivity.reverse();
  const agentMessageCounts: Record<string, { name: string; count: number }> = {};
  filteredByDate.forEach(ticket => {
    if (ticket.messages) {
      ticket.messages.forEach(msg => {
        if (msg.sender && msg.sender.includes('@support.com')) {
          if (!agentMessageCounts[msg.sender]) agentMessageCounts[msg.sender] = { name: msg.sender.split('@')[0], count: 0 };
          agentMessageCounts[msg.sender].count++;
        }
      });
    }
  });
  const topAgents = Object.entries(agentMessageCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  const days = useMemo(() => {
    if (!start || !end) return [];
    return eachDayOfInterval({ start, end });
  }, [start, end]);
  const ticketsByDay = days.map(day => {
    const count = filteredByDate.filter(t => {
      const created = getCreatedDate(t);
      return created.toDateString() === day.toDateString();
    }).length;
    return { date: format(day, 'MMM d'), count };
  });
  const movingAvg = ticketsByDay.map((d, i, arr) => {
    const window = arr.slice(Math.max(0, i - 3), i + 4);
    const avg = window.reduce((sum, v) => sum + v.count, 0) / window.length;
    return { ...d, avg: Math.round(avg * 100) / 100 };
  });

  const handleExport = () => {
    const csv = ticketsToCSV(filteredByDate);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Fetch tickets from backend on mount
  useEffect(() => {
    api.get('/tickets').then(res => {
      dispatch(setTickets(res.data.tickets));
    });
  }, [dispatch]);

  // Add a debug log to check tickets array
  console.log('Dashboard tickets:', tickets);

  // In the render, show a fallback if tickets is empty or undefined
  if (!tickets || tickets.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">No tickets found.</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 1, md: 3 }, minHeight: '100vh' }}>
        <Typography variant="h4" fontWeight={700} mb={3} color="#00b87c">Admin Dashboard</Typography>
        <Box sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Stack direction="row" spacing={1}>
              {presets.map(preset => (
                <Chip
                  key={preset.label}
                  label={preset.label}
                  clickable
                  color={isPresetActive(preset.range) ? 'primary' : 'default'}
                  variant={isPresetActive(preset.range) ? 'filled' : 'outlined'}
                  onClick={() => handlePreset(preset.range)}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <DatePicker
                label="Start Date"
                value={start}
                onChange={handleStartChange}
                maxDate={end || undefined}
                slotProps={{ textField: { size: 'small', sx: { bgcolor: isDark ? '#fff' : '#fff', color: isDark ? '#111' : undefined, borderRadius: 2, minWidth: 120, '& .MuiInputBase-input': { color: isDark ? '#111' : undefined } } } }}
              />
              <DatePicker
                label="End Date"
                value={end}
                onChange={handleEndChange}
                minDate={start || undefined}
                slotProps={{ textField: { size: 'small', sx: { bgcolor: isDark ? '#fff' : '#fff', color: isDark ? '#111' : undefined, borderRadius: 2, minWidth: 120, '& .MuiInputBase-input': { color: isDark ? '#111' : undefined } } } }}
              />
            </Stack>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ ml: { sm: 2 }, fontWeight: 600 }}
            >
              Export CSV
            </Button>
          </Stack>
        </Box>
        <Grid container spacing={4} mb={2}>
          {[{ label: 'Total Tickets', value: filteredByDate.length, color: '#1976d2' }, { label: 'Open Tickets', value: openCount, color: '#00b87c' }, { label: 'In Progress', value: inProgressCount, color: '#009e6d' }, { label: 'Closed Tickets', value: closedCount, color: '#888' }].map((stat, idx) => {
            let valueColor = stat.color;
            if (isDark) {
              if (stat.label === 'Closed Tickets') valueColor = '#111';
              else if (stat.label === 'Total Tickets') valueColor = '#1976d2';
              else valueColor = '#00b87c';
            }
            return (
              <Grid item xs={12} md={3} key={stat.label}>
                <Paper sx={{ p: 3, borderRadius: 1, minWidth: 270, boxShadow: 4, textAlign: 'center', background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.95)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
                  <Typography variant="subtitle1" color="text.secondary" mb={1} fontWeight={600} letterSpacing={0.5} sx={isDark ? { color: '#111' } : {}}>{stat.label}</Typography>
                  <Typography variant="h2" fontWeight={700} color={valueColor} sx={{ textShadow: '0 2px 8px #e0f7fa' }}>{stat.value}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        <Grid container spacing={4} mb={2} mt={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 1, minWidth: 360, maxWidth: 400, height: 480, boxShadow: 3, textAlign: 'center', background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.97)', mx: 'auto', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
              <Typography variant="h6" mb={2} fontWeight={700} color={isDark ? '#111' : '#009e6d'}>Tickets by Status</Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ticketStats}>
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e0f7fa', boxShadow: '0 2px 8px #e0f7fa' }} cursor={{ fill: 'transparent' }} />
                  <Bar 
                    dataKey="count"
                    fill="#45a87c"
                    radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 1, minWidth: 360, maxWidth: 400, height: 480, boxShadow: 3, textAlign: 'center', background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.97)', mx: 'auto', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
              <Typography variant="h6" mb={2} fontWeight={700} color={isDark ? '#111' : '#009e6d'}>Tickets by Priority</Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={priorityStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#00b87c"
                    label
                  >
                    {priorityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 1, boxShadow: 2, minWidth: 300, maxWidth: 400, height: 480, background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.98)', mb: 4, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={700} flex={1} color={isDark ? '#111' : '#00b87c'}>Recent Tickets</Typography>
                  <TextField
                    size="small"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: '100%', sm: 300 }, bgcolor: isDark ? '#fff' : '#f6fafb', color: isDark ? '#111' : undefined, borderRadius: 2, boxShadow: 1, '& .MuiInputBase-input': { color: isDark ? '#111' : undefined } }}
                  />
                </Stack>
                <List sx={{ flex: 1, overflow: 'auto' }}>
                  {filteredTickets.length === 0 && <ListItem><ListItemText primary="No tickets found." /></ListItem>}
                  {filteredTickets.map(ticket => (
                    <ListItemButton key={ticket.id || ticket._id} onClick={() => navigate(`/dashboard/tickets/${ticket.id || ticket._id}`)} sx={{ borderRadius: 2, mb: 1, transition: 'background 0.2s', '&:hover': { bgcolor: '#e0f7fa' } }}>
                      <ListItemText
                        primary={<span style={{ fontWeight: 600, color: isDark ? '#111' : undefined }}>{ticket.subject}</span>}
                        secondary={
                          <span style={{ color: isDark ? '#111' : '#888' }}>
                            <Chip size="small" label={ticket.status} sx={{ mr: 1, bgcolor: (ticket.status === 'Open' || ticket.status === 'OPEN') ? '#e0f7fa' : (ticket.status === 'Closed' || ticket.status === 'CLOSED') ? '#eee' : '#f5f5f5', color: '#00b87c', fontWeight: 700 }} />
                            <Chip size="small" label={ticket.priority} sx={{ mr: 1, bgcolor: ticket.priority === 'High' ? '#ffebee' : ticket.priority === 'Medium' ? '#fffde7' : '#e8f5e9', color: '#009e6d', fontWeight: 700 }} />
                            <span style={{ color: isDark ? '#111' : '#888' }}>#{ticket.id || ticket._id}</span>
                          </span>
                        }
                        secondaryTypographyProps={{ component: 'span' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Time Series Chart */}
        {days.length > 0 && (
          <Grid container spacing={4} mb={2} justifyContent="center">
            <Grid item xs={12} md={10}>
              <Paper sx={{ p: 3, borderRadius: 1, boxShadow: 3, background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.97)', maxWidth: 900, mx: 'auto', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
                <Typography variant="h6" mb={2} fontWeight={700} color={isDark ? '#111' : '#009e6d'}>Tickets Created Per Day (Trend)</Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={movingAvg} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#00b87c" strokeWidth={2} dot />
                    <Line type="monotone" dataKey="avg" stroke="#8884d8" strokeWidth={2} dot={false} name="7-day Moving Avg" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
        <Grid container spacing={4} mt={2} justifyContent="center">
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <Card sx={{ width: '100%', height: '100%', borderRadius: 1, boxShadow: 2, background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.98)', mb: { xs: 4, md: 0 }, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 }, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight={700} mb={2} color={isDark ? '#111' : '#00b87c'}>Top Agents</Typography>
                <List sx={{ flex: 1 }}>
                  {topAgents.length === 0 && <ListItem><ListItemText primary={<span style={{ color: isDark ? '#111' : undefined }}>No agent activity yet.</span>} /></ListItem>}
                  {topAgents.map(([email, agent], idx) => (
                    <ListItem key={email}>
                      <Avatar sx={{ bgcolor: '#00b87c', mr: 2 }}><PersonIcon /></Avatar>
                      <ListItemText
                        primary={<span style={{ fontWeight: 600, color: isDark ? '#111' : undefined }}>{agent.name}</span>}
                        secondary={<span style={{ color: isDark ? '#111' : undefined }}>{agent.count} messages</span>}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <Card sx={{ width: '100%', height: '100%', borderRadius: 1, boxShadow: 2, background: isDark ? '#d2f1e7' : 'rgba(255,255,255,0.98)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 }, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight={700} mb={2} color={isDark ? '#111' : '#00b87c'}>Recent Activity</Typography>
                <List sx={{ flex: 1 }}>
                  {recentActivity.length === 0 && <ListItem><ListItemText primary="No recent activity." /></ListItem>}
                  {recentActivity.slice(0, 10).map((act, idx) => (
                    <ListItem key={idx}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0f7fa', color: '#00b87c', fontWeight: 700, fontSize: 18 }}>{act.who[0]}</Avatar>
                      <ListItemText
                        primary={<span style={{ color: isDark ? '#111' : undefined }}><b>{act.who}</b> {act.action}</span>}
                        secondary={<span style={{ color: isDark ? '#111' : '#888' }}>{act.time}</span>}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Paper sx={{ mt: 4, p: 3, borderRadius: 1, boxShadow: 0, background: 'transparent' }}>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700} color={isDark ? '#111' : '#009e6d'}>Welcome to SupportDesk Admin Dashboard</Typography>
            <Typography variant="body1" color="text.secondary">Use the sidebar to manage tickets, agents, and settings. The charts above show a summary of ticket activity.</Typography>
          </Stack>
        </Paper>
    </Box>
    </LocalizationProvider>
  );
}