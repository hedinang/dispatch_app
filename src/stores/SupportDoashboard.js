import { observable, action, computed } from 'mobx';
import {dashboardAPI} from "./api";

export default class SupportDoashboard {
  constructor(api) {
    this.api = api;
  }

  @action
  getMessages = (params, id) => this.api.get(`/cs/messages/${id}`, params);

  @action
  getConversationInfo = (id) => this.api.get(`/cs/messages/${id}/info`);

  @action
  getConversationMember = (id) => this.api.get(`/cs/messages/${id}/member`);

  @action
  getConversationHistory = (id) => this.api.get(`/cs/messages/${id}/history`);
}