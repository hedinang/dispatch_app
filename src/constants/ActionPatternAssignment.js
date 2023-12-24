export default {
  ASSIGN: [
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign-dsp',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/reassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign-dsp',
    },
  ],
  ASSIGN_ALL: [
    {
      method: 'POST',
      path: 'driver-schedules/{schedule_id}/assignments/all',
    },
  ],
  ASSIGN_DSP: [
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign-dsp',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/reassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign-dsp',
    },
  ],
  UNASSIGN: [
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign-dsp',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/reassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign-dsp',
    },
  ],
  UNASSIGN_DSP: [
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign-dsp',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/reassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign-dsp',
    },
  ],
  REASSIGN: [
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/assign-dsp',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/reassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign',
    },
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/unassign-dsp',
    },
  ],
  EDIT_ETA: [
    {
      method: 'POST',
      path: 'assignments/{assignment_id}/eta',
    },
  ],
  SPLIT: [
    {
      method: 'PUT',
      path: 'assignments/{assignment_id}/split/{shipment_id}',
    },
  ],
  EDIT_CUSTOMER_INFO: [
    {
      method: 'PUT',
      path: 'shipments/{shipment_id}/customer',
    },
  ],
  EDIT_PICKUP_STATUS: [
    {
      method: 'PUT',
      path: 'stops/{stop_id}/pickup',
    },
  ],
  EDIT_DROPOFF_STATUS: [
    {
      method: 'PUT',
      path: 'stops/{stop_id}/dropoff',
    },
  ],
  BONUS_ROUTE: [
    {
      method: 'POST',
      path: 'assignments/{assignment_id}/bonus',
    },
  ],
};
