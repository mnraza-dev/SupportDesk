import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { websocket } from '../../services/websocket';
import { useNavigate } from 'react-router-dom';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import api from '../../services/api';
import { useSnackbar } from '../../App';

export default function TicketListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  // Only show tickets submitted by the current customer if role is CUSTOMER
  const isCustomer = user?.role === 'CUSTOMER';
  const isAgent = user?.role === 'AGENT';
  const customerEmail = user?.email;
  const agentEmail = user?.email;

  // Fetch tickets from backend with pagination
  useEffect(() => {
    let ignore = false;
    async function fetchTickets() {
      setLoading(true);
      try {
        const params: any = { page: page + 1, limit: rowsPerPage };
        // Optionally add filters here if backend supports
        const res = await api.get('/tickets', { params });
        if (!ignore) {
          setTickets(res.data.tickets);
          setTotal(res.data.total);
        }
      } catch (err) {
        // Optionally show error
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchTickets();
    return () => { ignore = true; };
  }, [page, rowsPerPage]);

  // Filtering and sorting (client-side for now)
  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilters =
      (statusFilter ? ticket.status === statusFilter : true) &&
      (priorityFilter ? ticket.priority === priorityFilter : true) &&
      (assigneeFilter ? ticket.assignee === assigneeFilter : true);
    if (isCustomer) {
      return matchesFilters && ticket.submitter === customerEmail;
    }
    if (isAgent) {
      return matchesFilters && (ticket.assignee === agentEmail || ticket.assignedTo?.email === agentEmail);
    }
    // For admin, show all tickets (no filtering by user)
    return matchesFilters;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // uniqueValues helper for filters
  const uniqueValues = (key: keyof typeof tickets[0]) =>
    [...new Set(tickets.map((ticket) => ticket[key]))].filter(
      (val): val is string | number => typeof val === 'string' || typeof val === 'number'
    );

  useEffect(() => {
    websocket.connect();
    const unsubscribe = websocket.subscribe('/topic/tickets', (msg) => {
      if (msg.type === 'NEW_TICKET' || msg.type === 'ticket_status_update' || msg.type === 'ticket_assigned' || msg.type === 'ticket_updated') {
        // Refetch tickets for real-time update
        setLoading(true);
        api.get('/tickets', { params: { page: page + 1, limit: rowsPerPage } })
          .then(res => {
            setTickets(res.data.tickets);
            setTotal(res.data.total);
            setLoading(false);
          });
        if (msg.type === 'ticket_status_update') {
          showSnackbar('Ticket status updated!', 'info');
        }
        if (msg.type === 'ticket_assigned') {
          showSnackbar('Ticket assigned!', 'info');
        }
      }
    });
    return () => {
      unsubscribe();
      websocket.disconnect();
    };
  }, [page, rowsPerPage, showSnackbar]);

  // Debug logs for troubleshooting
  console.log('User:', user);
  console.log('Tickets:', tickets);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary.main">
        Tickets
      </Typography>
      <Paper
        elevation={2}
        sx={{
          mb: 2,
          p: { xs: 1, md: 2 },
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark' ? '#23272b' : '#f6fafb',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={1} alignItems="center">
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              color={statusFilter ? 'primary' : undefined}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueValues('status').map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
              color={priorityFilter ? 'primary' : undefined}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueValues('priority').map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={assigneeFilter}
              label="Assignee"
              onChange={(e) => setAssigneeFilter(e.target.value)}
              color={assigneeFilter ? 'primary' : undefined}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueValues('assignee').map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : filteredTickets.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No tickets found.</Typography>
          </Box>
        ) : (
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ background: (theme) => theme.palette.mode === 'dark' ? '#23272b' : '#e8f5e9', position: 'sticky', top: 0, zIndex: 1 }}>
                {['id', 'subject', 'status', 'priority', 'assignee'].map((col) => (
                  <TableCell key={col} sortDirection={sortBy === col ? sortDirection : false} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    <TableSortLabel
                      active={sortBy === col}
                      direction={sortBy === col ? sortDirection : 'asc'}
                      onClick={() => {
                        if (sortBy === col) {
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(col);
                          setSortDirection('asc');
                        }
                      }}
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTickets.map((ticket) => (
                <TableRow
                  key={ticket.id || ticket._id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: (theme) => theme.palette.action.hover,
                    },
                  }}
                  onClick={() => navigate(`/dashboard/tickets/${ticket.id || ticket._id}`)}
                >
                  <TableCell>{ticket.id || ticket._id}</TableCell>
                  <TableCell>{ticket.subject || ticket.title}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>{ticket.priority}</TableCell>
                  <TableCell>{ticket.assignee || (ticket.assignedTo?.email || '')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
