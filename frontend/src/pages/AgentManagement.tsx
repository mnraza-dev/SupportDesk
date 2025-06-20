import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, Stack, Avatar, Divider, Card, CardContent } from '@mui/material';
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from '../App';

const initialAgents = [
  { id: 1, name: 'Alice Smith', email: 'alice@support.com', status: 'Active' },
  { id: 2, name: 'Bob Johnson', email: 'bob@support.com', status: 'Active' },
  { id: 3, name: 'Charlie Lee', email: 'charlie@support.com', status: 'Inactive' },
];

const agentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
});
type AgentForm = z.infer<typeof agentSchema>;

export default function AgentManagement() {
  const [agents, setAgents] = useState(initialAgents);
  const tickets = useSelector((state: RootState) => state.tickets);
  const { showSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AgentForm>({
    resolver: zodResolver(agentSchema),
    mode: 'onTouched',
  });

  // Gather recent activity from ticket actions (last 10 messages or ticket creations by agents)
  const recentActivity: { agent: string; action: string; time: string }[] = [];
  tickets.forEach(ticket => {
    if (ticket.assignee) {
      recentActivity.push({
        agent: ticket.assignee,
        action: `Assigned to ticket #${ticket.id}`,
        time: '—',
      });
    }
    if (ticket.messages) {
      ticket.messages.slice(-2).forEach(msg => {
        // Only show agent actions
        if (agents.some(a => a.email === msg.sender)) {
          recentActivity.push({
            agent: agents.find(a => a.email === msg.sender)?.name || msg.sender,
            action: `Messaged on ticket #${ticket.id}`,
            time: msg.time,
          });
        }
      });
    }
  });
  // Sort by most recent (for demo, just reverse)
  recentActivity.reverse();

  const handleAddAgent = handleSubmit((data) => {
    setAgents([...agents, { id: Date.now(), name: data.name, email: data.email, status: 'Active' }]);
    showSnackbar('Agent added!', 'success');
    reset();
  });

  return (
    <Box>
      <Typography variant="h5" mb={2} fontWeight={700}>Agent Management</Typography>
      <Card sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Add New Agent</Typography>
          <form onSubmit={handleAddAgent} noValidate>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Name"
                size="small"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
              <TextField
                label="Email"
                size="small"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />
              <Button type="submit" variant="contained" sx={{ minWidth: 120 }} disabled={isSubmitting}>
                Add Agent
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
      <Card sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Agent List</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map(agent => (
                <TableRow key={agent.id}>
                  <TableCell><Avatar sx={{ bgcolor: '#00b87c' }}><PersonIcon /></Avatar></TableCell>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Recent Agent Activity</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {recentActivity.length === 0 && <Typography color="text.secondary">No recent activity.</Typography>}
            {recentActivity.slice(0, 10).map((act, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0f7fa', color: '#00b87c', fontWeight: 700, fontSize: 18 }}>{act.agent[0]}</Avatar>
                <Box>
                  <Typography variant="body2"><b>{act.agent}</b> {act.action}</Typography>
                  <Typography variant="caption" color="text.secondary">{act.time}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
} 