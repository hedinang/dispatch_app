import React from 'react';
import { useTheme } from '@material-ui/core/styles';

export const EVENT_STATUSES = {
  FAILED: 'FAILED',
};

export function EVENT_STATUS_TO_COLORS() {
  const theme = useTheme();

  return {
    CREATED: theme.palette.primary.periwinkle,
    FAILED: theme.palette.primary.red,
    CANCELLED: theme.palette.primary.red,
    DELIVERED: theme.palette.primary.green,
    UNDELIVERABLE_SH: theme.palette.primary.red,
    DROPOFF_SUCCEEDED: theme.palette.primary.green,
  };
}

export const EVENT_OBJECT_TYPES = {
  DR: 'Driver',
  AS: 'Assignment',
  SH: 'Shipment',
  ST: 'Stop',
  US: 'User',
  CL: 'Client',
  AP: 'Application',
  WO: 'Worker',
  EH: 'Event Handler',
  DS: 'DSP',
  DB: 'Direct Booking',
  SC: 'Schedule',
  TK: 'Ticket',
  TB: 'Ticket Book',
  BS: 'Booking Session',
};
