import { observable, action, computed } from 'mobx';
import { STATUS, STOP_STATUS } from '../constants/status';
import moment from 'moment';
import _ from 'lodash';
import polyline from 'google-polyline';
import {searchInObject} from 'axl-js-utils';
import FormStore from "./FormStore";

class AbandonedListStore {
  constructor(api) {
    this.api = api;
  }

  @observable filter = {
    page_number: 1,
    page_size: 12,
    from_ts: 1494633682061,
    to_ts: 1694633682061
  };
  @observable searching = false;
  @observable abandoneds = [];

  search(cb) {
    this.searching = true;
    const queryParams = {
      "statuses": ["ABANDONED"]
    };
    let params = new URLSearchParams();
    Object.keys(this.filter).map(t => {
      params.append(t, this.filter[t]);
    });

    this.api.post(`/call_center/all_sessions?${params}`, queryParams).then(res => {
      if(res.ok) {
        this.abandoneds = res.data;
      }

      if(cb) cb(res);
    });
  }

  //Todo create zendesk ticket
  @observable ticketCreating = false;
  @observable ticket = {};
  @observable ticketParams = {
    "comment": "Testing123",
    "requester": {
      "name": "Requester"
    },
    "subject": "Test API",
    "collaborators": [],
    "internal_ref": {
      "uid": null
    }
  };

  createTicket(cb) {
    this.ticketCreating = true;

    this.api.post(`/support_tickets/zendesk`, this.ticketParams).then(res => {
      if(res.status === 200 || res.ok) {
        this.ticket = res.data;
      }

      if(cb) cb(res);

      this.ticketCreating = false;
    });
  }

  //Todo zendesk checking
  @observable internalRef = 'CC_12345679';
  @observable tickets = [];
  @observable checkingZendeskTicket = false;

  checkZendeskTicket(cb) {
    if(!this.internalRef) return false;

    this.checkingZendeskTicket = true;

    this.api.get(`/support_tickets/by_internal_ref/${this.internalRef}`).then(res => {
      if(res.status === 200 || res.ok) {
        this.tickets = res.data;
      }

      if(cb) cb(res);

      this.checkingZendeskTicket = false;
    });
  }
}

export default  AbandonedListStore