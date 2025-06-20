import { Box, Typography, Paper, Chip, MenuItem, Select, FormControl, InputLabel, Button, Stack, TextField, IconButton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { addMessage, updateTicket } from './ticketSlice';
import { useSnackbar } from '../../App';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { websocket } from '../../services/websocket';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

export default function TicketDetailPage() {
  const { id } = useParams();
  const ticketFromRedux = useSelector((state: RootState) =>
    state.tickets.find(t => String(t.id) === id || String(t._id) === id)
  );
  const [ticket, setTicket] = useState(ticketFromRedux || null);
  const [loading, setLoading] = useState(!ticketFromRedux);
  const { user } = useAuth();
  const isAgent = user?.role === 'AGENT';
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = isAgent || isAdmin;
  const canEditAssignee = isAdmin;
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const allAssignees = Array.from(new Set((ticket?.assignee ? [ticket.assignee] : []).concat(['Alice', 'Bob', 'Charlie'])));

  const messageSchema = z.object({
    text: z.string().min(1, 'Message cannot be empty'),
  });
  type MessageForm = z.infer<typeof messageSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    mode: 'onTouched',
    defaultValues: { text: '' },
  });

  useEffect(() => {
    if (!ticketFromRedux && id) {
      setLoading(true);
      api.get(`/tickets/${id}`)
        .then(res => {
          setTicket(res.data);
        })
        .catch(() => {
          setTicket(null);
        })
        .finally(() => setLoading(false));
    }
  }, [id, ticketFromRedux]);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || '');
      setPriority(ticket.priority || '');
      setAssignee(ticket.assignee || ticket.assignedTo?.email || '');
      setMessages(ticket.messages || []);
    }
  }, [ticket]);

  useEffect(() => {
    if (!ticket) return;
    websocket.connect();
    const ticketId = ticket.id || ticket._id;
    const unsubMsg = websocket.subscribe(`/topic/ticket/${ticketId}/messages`, (msg) => {
      if (msg.type === 'NEW_MESSAGE' && (msg.ticketId === ticket.id || msg.ticketId === ticket._id)) {
        setMessages((prev) => [...prev, msg.message]);
      }
    });
    const unsubTicket = websocket.subscribe('/topic/tickets', (msg) => {
      if (msg.ticket && (msg.ticket.id === (ticket.id || ticket._id) || msg.ticket._id === (ticket.id || ticket._id))) {
        if (msg.type === 'ticket_status_update') {
          setStatus(msg.status);
          showSnackbar('Ticket status updated!', 'info');
        }
        if (msg.type === 'ticket_assigned') {
          setAssignee(msg.assignee?.email || '');
          showSnackbar('Ticket assigned!', 'info');
        }
      }
    });
    return () => {
      unsubMsg();
      unsubTicket();
      websocket.disconnect();
    };
  }, [ticket, showSnackbar]);

  const ticketId = ticket?.id || ticket?._id;
  const submitter = ticket?.submitter || ticket?.createdBy?.email || '';

  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  if (!ticket) {
    return <Typography>Ticket not found.</Typography>;
  }

  const handleSend = handleSubmit(async (data) => {
    if (!user) return;
    if (!data.text.trim() && !file) {
      showSnackbar('Message cannot be empty', 'error');
      return;
    }
    const newMsg = {
      sender: user.email,
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileName: file ? file.name : undefined,
    };
    try {
      dispatch(addMessage({
        ticketId: ticketId,
        message: newMsg,
      }));
      setMessages((prev) => [...prev, newMsg]);
      reset();
      setFile(null);
      showSnackbar('Message sent!', 'success');
      websocket.connect();
      websocket.subscribe(`/topic/ticket/${ticketId}/messages`, () => {});
    } catch (err) {
      showSnackbar('Failed to send message', 'error');
    }
  });

  const handleSave = () => {
    if (!canEdit) return;
    if (status === ticket.status && priority === ticket.priority && assignee === (ticket.assignee || ticket.assignedTo?.email || '')) return;
    setSaving(true);
    dispatch(updateTicket({ ticketId: ticketId, status, priority }));
    setTimeout(() => {
      setSaving(false);
      showSnackbar('Ticket updated!', 'success');
    }, 500);
  };

  return (
    <Box maxWidth="md" mx="auto" sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary.main">Ticket #{ticketId}: {ticket.subject}</Typography>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2, borderRadius: 1, background: (theme) => theme.palette.mode === 'dark' ? '#23272b' : '#f6fafb' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Typography>Status:</Typography>
          {canEdit ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={status} onChange={e => setStatus(e.target.value)}>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Chip label={ticket.status} />
          )}
          <Typography>Priority:</Typography>
          {canEdit ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={priority} onChange={e => setPriority(e.target.value)}>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Chip label={ticket.priority} />
          )}
          <Typography>Assignee:</Typography>
          {canEditAssignee ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={assignee} onChange={e => setAssignee(e.target.value)}>
                {allAssignees.map(a => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Chip label={ticket.assignee || ticket.assignedTo?.email || 'Unassigned'} />
          )}
        </Stack>
        <Typography mt={2}>Description: {ticket.description}</Typography>
        <Typography mt={1} color="text.secondary">Submitter: {submitter}</Typography>
      </Paper>
      {/* Only show messages section if there are messages */}
      {messages.length > 0 && <>
        <Typography variant="h6" fontWeight={700} mb={1} color="primary.main">Messages</Typography>
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2, minHeight: 200, borderRadius: 1 }}>
          <Stack spacing={2}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ textAlign: msg.sender === submitter ? 'left' : 'right' }}>
                <Typography variant="body2" color="text.secondary">{msg.sender} ({msg.time})</Typography>
                <Typography>{msg.text}</Typography>
                {msg.fileName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <AttachFileIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">{msg.fileName}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      </>}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }} component="form" onSubmit={handleSend}>
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <IconButton component="label" htmlFor="file-upload" sx={{ bgcolor: file ? '#00b87c' : undefined, color: file ? '#fff' : undefined }}>
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Type a message..."
          size="small"
          sx={{ borderRadius: 2, background: '#fff' }}
          {...register('text')}
          error={!!errors.text}
          helperText={errors.text?.message}
          inputProps={{ maxLength: 1000 }}
          disabled={isSubmitting}
        />
        <IconButton color="primary" type="submit" disabled={isSubmitting} sx={{ bgcolor: '#00b87c', color: '#fff', '&:hover': { bgcolor: '#009e6d' } }}>
          <SendIcon />
        </IconButton>
      </Box>
      {canEdit && (
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSave}
          disabled={saving || (status === ticket.status && priority === ticket.priority && assignee === (ticket.assignee || ticket.assignedTo?.email || ''))}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </Box>
  );
} 