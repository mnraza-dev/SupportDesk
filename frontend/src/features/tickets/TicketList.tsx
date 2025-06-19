
import { Box, Typography, Paper } from "@mui/material";

export default function TicketListPage() {
  const mockTickets = [
    { id: 1, subject: "Login Issue", status: "Open" },
    { id: 2, subject: "Bug in dashboard", status: "In Progress" },
    { id: 3, subject: "Feature request", status: "Closed" },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Ticket List
      </Typography>
      {mockTickets.map((ticket) => (
        <Paper key={ticket.id} sx={{ p: 2, mb: 1 }}>
          <Typography variant="subtitle1">{ticket.subject}</Typography>
          <Typography variant="body2">Status: {ticket.status}</Typography>
        </Paper>
      ))}
    </Box>
  );
}
