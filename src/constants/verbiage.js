import {
  CANCELLED,
  DELIVERED,
  UNDELIVERABLE_SH,
  FAILED,
  INFORM_RECIPIENT_COMING_SOON,
  INFORM_RECIPIENT_DROPOFF_FAILED,
  INFORM_RECIPIENT_DROPOFF_SUCCEEDED,
  INFORM_RECIPIENT_NEXT_IN_LINE,
  INFORM_RECIPIENT_PICKUP_FAILED,
  INFORM_RECIPIENT_PICKUP_SUCCEEDED,
  NEXT_IN_QUEUE,
  OUT_FOR_DELIVERY,
  REATTEMPTING,
  PROCESSED,
  PROCESSING,
  RECEIVED,
  RETURNED,
  DAMAGED,
  LEAKING,
  NOT_FOUND
} from "./shipmentStatus";

export const EDIT_NOTICE = 'While AxleHire will make attempt to complete your delivery change requests, requests made on scheduled delivery date may not be possible.';

export const VERBIAGE = {
  // PLANNING
  CREATED: {milestone: PROCESSING, get description(){return `We have received information about your delivery.`}},
  GEOCODE_FAILED: null,
  GEOCODE_FAILED_PICKUP: null,
  GEOCODE_FAILED_DROPOFF: null,
  GEOCODED: {milestone: PROCESSED, get description(){return `Your order has been confirmed for delivery by ${this.dropoff_latest}.`}},

  // INBOUND
  RECEIVED_OK: {milestone: RECEIVED, get description(){return `Your package has been received at an AxleHire facility.`}},
  RECEIVED_OK__GEOCODE_FAILED: {milestone: FAILED, get description(){return `There's a problem with the address we have on file. Please contact us for more information: ${this.axlehire_email}.`}},
  RECEIVED_DAMAGED: {milestone: FAILED, get description(){return `Your package was unable to be delivered. Please contact us at 855-249-7447 or email us at ${this.axlehire_email} for more information.`}},
  MISSING: {milestone: FAILED, get description(){return `There is a problem with retrieving your order. Please contact ${this.client_company} for further assistance.`}},

  // CANCELLATION
  CANCELLED_BEFORE_PICKUP: {milestone: CANCELLED, get description(){return `Your order has been cancelled.`}},
  CANCELLED_AFTER_PICKUP: {milestone: CANCELLED, get description(){return `Your order has been cancelled.`}},

  // DISPATCH
  ASSIGNED: null,
  RESCHEDULED: null,

  // OUTBOUND QA
  DAMAGED: null,
  LEAKING: null,
  NOT_FOUND: null,

  // OUTBOUND PICKUP
  PICKUP_FAILED__MISSING: {milestone: FAILED, get description(){return `There was an issue with your order. Please contact ${this.client_company} for assistance.`}},
  PICKUP_FAILED__RECEIVED_OK: null,
  PICKUP_FAILED__RECEIVED_DAMAGED: {milestone: FAILED, get description(){return `Your package was unable to be delivered. Please contact us at 855-249-7447 or email us at ${this.axlehire_email} for more information.`}},
  PICKUP_FAILED__UNSCANNED: {milestone: FAILED, get description(){return `There is a problem with your order. Please contact support for further assistance.`}},
  PICKUP_READY: null,
  PICKUP_DELAY: null,
  PICKUP_EN_ROUTE: null,
  PICKUP_SUCCEEDED: {milestone: OUT_FOR_DELIVERY, get description(){return `Your package is on its way to be delivered by ${this.dropoff_latest}.`}},
  PICKUP_SUCCEEDED__REATTEMPT: {milestone: OUT_FOR_DELIVERY, get description(){return `We are reattempting delivery. Your order is on its way to be delivered by ${this.event_latest_ts}.`}},

  // OUTBOUND DROPOFF
  DROPOFF_READY: {milestone: OUT_FOR_DELIVERY, get description(){return `Your driver is outside.`}},
  DROPOFF_DELAY: {milestone: OUT_FOR_DELIVERY, get description(){return `There has been a delay with the delivery. We will deliver by ${this.dropoff_latest}.`}},
  DROPOFF_EN_ROUTE: {milestone: NEXT_IN_QUEUE, get description(){return `Your stop is next. The driver will be there in ${this.eta_in_minutes} minutes.`}},
  DROPOFF_SUCCEEDED: {milestone: DELIVERED, get description(){return `Your order was successfully delivered.`}},

  DROPOFF_REATTEMPTING: {milestone: REATTEMPTING, get description(){return `Your driver is re-attempting to deliver your order again.`}},
  DROPOFF_SUCCEEDED__REATTEMPT: {milestone: DELIVERED, get description(){return `Your order has been successfully delivered on a subsequent attempt.`}},
  DROPOFF_FAILED: {milestone: FAILED, get description(){return `Our delivery attempt was unsuccessful. We’ll be reattempting delivery your package again.`}},
  DROPOFF_FAILED__REATTEMPT: {milestone: FAILED, get description(){return `Your order cannot be delivered. Please contact support for further assistance.`}},
  UNDELIVERABLE: {milestone: FAILED, get description(){return `Your package was unable to be delivered. Please contact us at 855-249-7447 or email us at ${this.axlehire_email} for more information.`}},
  DISPOSABLE: {milestone: FAILED, get description(){return `Your package was unable to be delivered. Please contact us at 855-249-7447 or email us at ${this.axlehire_email} for more information.`}},

  // OUTBOUND RETURN
  RETURN_READY: null,
  RETURN_DELAY: null,
  RETURN_EN_ROUTE: null,
  RETURN_FAILED: {milestone: FAILED, get description(){return `Your order cannot be returned to the store. Please contact support for further assistance.`}},
  RETURN_SUCCEEDED: {milestone: RETURNED, get description(){return `Your order has been successfully returned.`}},

  // COMMUNICATION
  INFORM_RECIPIENT_SHIPMENT_CONFIRMED: null,
  INFORM_RECIPIENT_PICKUP_SUCCEEDED: null,
  INFORM_RECIPIENT_PICKUP_FAILED: null,
  INFORM_RECIPIENT_COMING_SOON: null,
  INFORM_RECIPIENT_NEXT_IN_LINE: null,
  INFORM_RECIPIENT_DROPOFF_SUCCEEDED: null,
  INFORM_RECIPIENT_DROPOFF_FAILED: null
};