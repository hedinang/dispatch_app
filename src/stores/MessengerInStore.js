import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import {searchInObject} from "axl-js-utils";
import moment from "moment";

export default class MessengerInStore {
  constructor(api) {
    this.api = api;
  }

  @action
  getTopic = () => this.api.get(`/messenger/topics?ref_id=185775&ref_type=ASSIGNMENT_CONVERSATION`);

  @action
  getMessages = (id, query = {}) => {
    if(!id) return;
    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/messenger/topics/${id}/messages?${params}`);
  }

  @action
  getAssignmentConversationSummary = (
    query = {
      driver_id: 343,
      start_ts: moment().startOf('day').unix() * 1000,
      end_ts: moment().add(1).endOf('day').unix() * 1000,
    }) => {
    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/messenger/assignment_with_conversations?${params}`);
  }

  @action
  getDriverByIds(ids = []) {
    if(!ids.length) return;

    return this.api.post(`/users/drivers`, ids);
  }

  @action
  getActivityLogs(topicId) {
    if(!topicId) return;

    const query = {
      topic_id: topicId
    };
    let params = new URLSearchParams();
    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/messenger/activity_logs`, params);
  }

  @action
  getAssignmentEvent(id) {
    if(!id) return;

    return this.api.get(`/events/assignments/${id}`);
  }

  @action
  getAssignmentDetail(id) {
    if(!id) return;

    return this.api.get(`/assignments/${id}/detail?show_soft_deleted=true`);
  }
}