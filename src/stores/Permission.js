import _ from 'lodash';
import { observable, action } from 'mobx';
import api from './api';
import { ACTIONS } from '../constants/ActionPattern';
import { REQUEST_STATUS_IDLE, REQUEST_STATUS_LOADING, REQUEST_STATUS_LOADED, isDeniedAction } from '../constants/common';

class Permission {
  @observable deniedPatterns = [];

  state = REQUEST_STATUS_IDLE;

  constructor() {
    this.state = REQUEST_STATUS_IDLE;
    this.deniedPatterns = [];
  }

  @action
  getPermissionSetting() {
    if (this.state === REQUEST_STATUS_LOADING) return;

    this.state = REQUEST_STATUS_LOADING;

    api.get('acl/setting/denied').then((response) => {
      this.state = REQUEST_STATUS_LOADED;

      if (response.ok) this.deniedPatterns = response.data.map((item) => ({ method: item.http_method, path: item.path }));
    });
  }

  isDenied(actionPatterns) {
    if (_.isEmpty(actionPatterns) || _.isEmpty(this.deniedPatterns)) return false;

    return isDeniedAction(actionPatterns, this.deniedPatterns);
  }
}

export default Permission;
