export default {
  CREATE_OR_EDIT: [
    {
      method: 'POST',
      path: 'driver-crews',
    },
    {
      method: 'PUT',
      path: 'driver-crew/{crew_id}',
    },
  ],
  EDIT: [
    {
      method: 'POST',
      path: 'driver-crews',
    },
    {
      method: 'PUT',
      path: 'driver-crew/{crew_id}',
    },
  ],
  ADD_DRIVER: [
    {
      method: 'POST',
      path: 'driver-crews/{crew_id}/drivers',
    },
  ],
  REMOVE_DRIVER: [
    {
      method: 'DELETE',
      path: 'driver-crews/{crew_id}/drivers/{driver_id}',
    },
    {
      method: 'POST',
      path: 'driver-crews/drivers/{driver_id}',
    },
  ],
};
