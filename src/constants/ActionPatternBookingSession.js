export default {
  CHANGE_BOOKING_LIMIT: [
    {
      method: 'PATCH',
      path: 'booking/{session_id}',
    },
  ],
  ADD_ASSIGNMENT_TO_BOOKING_SESSION: [
    {
      method: 'POST',
      path: 'driver-schedules/{schedule_id}/assignments',
    },
    {
      method: 'POST',
      path: 'driver-schedules/{schedule_id}/solutions',
    },
  ],
  REMOVE_ASSIGNMENTS_FROM_BOOKING_SESSION: [
    {
      method: 'DELETE',
      path: 'driver-schedules/{schedule_id}/assignments/{assignment_id}',
    },
    {
      method: 'DELETE',
      path: 'driver-schedules/{schedule_id}/assignments',
    },
  ],
  CREATE_DIRECT_BOOKING_SESSION: [
    {
      method: 'POST',
      path: 'driver-schedules',
    },
  ],
};
