import TICKETS from './ActionPatternTicket';
import ASSIGNMENTS from './ActionPatternAssignment';
import DRIVER_CREWS from './ActionPatternDriverCrew';
import BOOKING_SESSIONS from './ActionPatternBookingSession';

export const ACTIONS = {
  TICKETS,
  ASSIGNMENTS,
  DRIVER_CREWS,
  BOOKING_SESSIONS,
  VIEW_DASHBOARD: [
    {
      method: 'GET',
      path: 'statistics/regions/{region}/date/{date}/projection',
    },
    {
      method: 'GET',
      path: 'statistics/regions/{region}/date/{date}',
    },
  ],
};
