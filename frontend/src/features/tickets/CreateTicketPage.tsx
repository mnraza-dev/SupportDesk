import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    MenuItem,
    FormControl,
  } from '@mui/material';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { z } from 'zod';
  import { useDispatch } from 'react-redux';
  import { useNavigate } from 'react-router-dom';
  import { addTicket } from './ticketSlice';
  import { useAuth } from '../../hooks/useAuth';
  import { useSnackbar } from '../../App';
  import api from '../../services/api';
  
  const priorities = ['Low', 'Medium', 'High'];
  
  const ticketSchema = z.object({
    subject: z.string().min(3, 'Subject is required'),
    priority: z.enum(['Low', 'Medium', 'High'], { required_error: 'Priority is required' }),
    description: z.string().min(10, 'Description must be at least 10 characters'),
  });
  type TicketForm = z.infer<typeof ticketSchema>;
  
  export default function CreateTicketPage() {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<TicketForm>({
      resolver: zodResolver(ticketSchema),
      mode: 'onTouched',
    });
  
    // Only allow customers
    if (!user || user.role !== 'CUSTOMER') {
      navigate('/dashboard/tickets');
      return null;
    }
  
    const onSubmit = async (data: TicketForm) => {
      try {
        const res = await api.post('/tickets', {
          ...data,
          submitter: user.email,
        });
        dispatch(addTicket(res.data));
        showSnackbar('Ticket created!', 'success');
        reset();
        navigate('/dashboard/tickets');
      } catch (err: any) {
        showSnackbar(err.response?.data?.message || 'Failed to create ticket', 'error');
      }
    };
  
    return (
      <Container maxWidth="sm">
        <Box mt={5}>
          <Typography variant="h5" gutterBottom>
            Create New Ticket
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Subject"
              fullWidth
              margin="normal"
              {...register('subject')}
              error={!!errors.subject}
              helperText={errors.subject?.message}
              inputProps={{ maxLength: 100 }}
              required
            />
            <TextField
              select
              label="Priority"
              fullWidth
              margin="normal"
              {...register('priority')}
              error={!!errors.priority}
              helperText={errors.priority?.message}
              required
              defaultValue=""
            >
              <MenuItem value="" disabled>
                Select priority
              </MenuItem>
              {priorities.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              inputProps={{ maxLength: 1000 }}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </form>
        </Box>
      </Container>
    );
  }
  