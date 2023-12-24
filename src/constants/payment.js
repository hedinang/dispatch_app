export const PAYMENT_STATUS = {
  CREATED: 'CREATED',
  REQUESTED: 'REQUESTED',
  PENDING: 'PENDING',
  CANCELED: 'CANCELED',
  PROCESSING: 'PROCESSING',
  HOLD: 'HOLD',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CORRECTED: 'CORRECTED',
  REQUEST_ERROR: 'REQUEST_ERROR',
  ERROR: 'ERROR',
  RESUBMITTED: 'RESUBMITTED',
  RESUBMIT_FAILED: 'RESUBMIT_FAILED',
  RESUBMIT_SUCCEEDED: 'RESUBMIT_SUCCEEDED',
  UNPROCESSED: 'UNPROCESSED',
}

export const PAYMENT_TYPE = {
  "OUTVOICE_ROUTE_DRIVING": "OUTVOICE - ROUTE_DRIVING",
  "OUTVOICE_TIP": "OUTVOICE - TIP",
  "OUTVOICE_BONUS": "OUTVOICE - BONUS",
  "PAYMENT_DEDUCT": "PAYMENT - DEDUCT",
  "OUTVOICE_REIMBURSEMENT": "OUTVOICE - REIMBURSEMENT",
}

export function mapPaymentStatusToColor(status) {
  switch (status) {
    case PAYMENT_STATUS.CREATED: return '#bfc0c1';break;
    case PAYMENT_STATUS.REQUESTED: return '#bfc0c1';break;
    case PAYMENT_STATUS.PENDING: return '#f5a623';break;
    case PAYMENT_STATUS.CANCELED: return '#d0021b';break;
    case PAYMENT_STATUS.PROCESSING: return '#f5a623';break;
    case PAYMENT_STATUS.HOLD: return '#f5a623';break;
    case PAYMENT_STATUS.SUCCEEDED: return '#4abc4e';break;
    case PAYMENT_STATUS.FAILED: return '#d0021b';break;
    case PAYMENT_STATUS.CORRECTED: return '#4abc4e';break;
    case PAYMENT_STATUS.REQUEST_ERROR: return '#d0021b';break;
    case PAYMENT_STATUS.ERROR: return '#d0021b';break;
    case PAYMENT_STATUS.RESUBMITTED: return '#bfc0c1';break;
    case PAYMENT_STATUS.RESUBMIT_FAILED: return '#d0021b';break;
    case PAYMENT_STATUS.RESUBMIT_SUCCEEDED: return '#4abc4e';break;
    case PAYMENT_STATUS.UNPROCESSED: return '#f5a623';break;
    default: return '#bfc0c1';
  }
}