import { observable, action, computed } from 'mobx';

export default class PaymentStore {
  constructor(api) {
    this.api = api;
  }

  @action
  loadPaystub(paymentId) {
    return this.api.get(`/driver-payments/${paymentId}/summary`);
  }
}