export const TICKET_STATUS = {
  CLAIMED: {
    color: '#77b45c',
  },
  READY: {
    color: '#f2c063',
  },
  IN_PROGRESS: {
    color: '#eb7035',
  },
  PENDING: {
    color: '#bebebe',
  },
  UNBOOKED: {
    color: '#f23',
  },
  COMPLETED: {
    color: '#297fc9',
  },
};

export const MAP_SHIPMENT_STATUS_TO_COLORS = {
  CREATED: '#d0c8c8',
  EN_ROUTE: '#21a1cf',
  GEOCODED: '#7119db',
  ASSIGNED: '#be29ec',
  PICKUP_SUCCEEDED: '#4abc4e',
  DROPOFF_SUCCEEDED: '#4abc4e',
  DROPOFF_READY: '#f2c063',
  IN_PROGRESS: '#ecb54b',
  PENDING: '#ffe31f',
  DELIVERED: '#4abc4e',
  RETURN_SUCCEEDED: '#96fd29',
  PICKUP_FAILED: '#f23',
  DROPOFF_FAILED: '#f23',
  CANCELLED_AFTER_PICKUP: '#f23',
  CANCELLED_BEFORE_PICKUP: '#f23',
  GEOCODE_FAILED: '#f23',
  INVALID_ADDRESS: '#f23',
  DISPOSABLE: '#741b47',
  UNSERVICEABLE: '#741b47',
  RESCHEDULED: '#ff6c00',
  UNDELIVERABLE: '#f23',
};
