export default {
  CREATE: [
    {
      method: 'PUT',
      path: 'tickets/{session_id}/tickets',
    },
  ],
  ASSIGN: [
    {
      method: 'PUT',
      path: 'tickets/{TK_ticket_id}/assign/{DR_driver_id}',
    },
  ],
  REASSIGN: [
    {
      method: 'PUT',
      path: 'tickets/{TK_ticket_id}/reassign/{DR_driver_id}',
    },
  ],
  UNASSIGN: [
    {
      method: 'POST',
      path: 'tickets/{TK_ticket_id}/unassign/{DR_driver_id}',
    },
  ],
  VOID: [
    {
      method: 'POST',
      path: 'tickets/{TK_ticket_id}/void',
    },
  ],
  DISCARD: [
    {
      method: 'POST',
      path: 'tickets/{TK_ticket_id}/discard',
    },
  ],
  EDIT_ETA: [
    {
      method: 'POST',
      path: 'tickets/{TK_ticket_id}/eta',
    },
  ],
  CLAIM: [
    {
      method: 'POST',
      path: 'tickets/{TK_ticket_id}/force-assign',
    },
    {
      method: 'POST',
      path: 'tickets/{id}/unassign/{subject_id}',
    },
  ],
  UNCLAIM: [
    {
      method: 'POST',
      path: 'tickets/{TK_ticket_id}/force-assign',
    },
    {
      method: 'POST',
      path: 'tickets/{id}/unassign/{subject_id}',
    },
  ],
  UPDATE_ENFORCER: [
    {
      method: 'PUT',
      path: 'tickets/booking-sessions/{session_id}/pickup-enforce',
    },
    {
      method: 'PUT',
      path: 'tickets/booking-sessions/{session_id}/ticket-book/{ticket_id}/pickup-enforce',
    },
  ],
};
