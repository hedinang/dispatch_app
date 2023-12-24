import { observable, action, computed } from 'mobx';
import { STATUS, STOP_STATUS } from '../constants/status';
import moment from 'moment';
import _ from 'lodash';
import polyline from 'google-polyline';
import {searchInObject} from 'axl-js-utils';
import FormStore from "./FormStore";

class CallCenterStore {
  constructor(api) {
    this.api = api;
  }

  //Todo
  @observable assignmentLoading = false;
  @observable selectedAssignment = null;

  @action
  loadAssignment(id = null, cb = () => {}) {
    if(!id) return false;

    this.assignmentLoading = true;

    this.api.get(`/assignments/${id}/detail?show_soft_deleted=true`).then(res => {
      if(res.ok || res.status === 200) {
        this.selectedAssignment = res.data;
      }

      if(cb) cb(res);

      this.assignmentLoading = false;
    })
  }

  //Todo generateSession
  @observable generatingSession = false;
  @observable callSession = null;

  generateSession(callObject = {}, cb = () => {}) {
    this.generatingSession = true;

    this.api.post(`/call_center/`, callObject).then(res => {
      if(res.ok || res.status === 200) {
        this.callSession = res.data;
      }

      this.generatingSession = false;

      if(cb) cb(res);
    })
  }
}

export default  CallCenterStore