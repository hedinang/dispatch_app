import { observable, action, computed } from 'mobx';
import _ from 'lodash'
import api from './api';

const RolesAllowed = {
  'split_route': ['super-admin', 'admin', 'lead-dispatcher', 'dispatcher', 'warehouse-manager'],
  'remove_photo': ['super-admin', 'photos-admin']
}

class UserStore {
  @observable user = {};
  @observable isFetchedUser = false;

  @action getUser() {
    this.isFetchedUser = false;
    api.get('/me')
      .then(response => {
        if (response.status === 200) {
          if (response.data.userInfo) {
            if (response.data.userInfo.avatar_url !== null ) {
              response.data.user.logo_url = response.data.userInfo.avatar_url;
            }
            if (response.data.userInfo.nickname ) {
              response.data.user.name = response.data.userInfo.nickname;
            }
          }
          this.user = response.data.user;
        }
        this.isFetchedUser = true;
      })
  }

  @action getAdminDispatcher(cb) {
    api.post('/users/admins_or_dispatchers')
      .then(response => {
        if (response.status === 200) {
          if (cb) {
            cb(response.data)
          }
          return response.data
        }
      })
  }

  @action getUserByAnyRoles(params, cb) {
    api.get('/users/list-by-any-roles', params)
      .then(r => {
        if (r.ok) {
          if (cb) {
            cb(r.data)
          }
          return r.data
        }
      })
  }

  @computed
  get isAdmin() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('admin') >= 0
  }

  @computed
  get isSuperAdmin() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('super-admin') >= 0
  }

  @computed
  get isDispatcher() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('dispatcher') >= 0
  }

  @computed
  get isLeadDispatcher() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('lead-dispatcher') >= 0
  }

  @computed
  get isHr() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('hr') >= 0
  }

  @computed
  get isWarehouseManger() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('warehouse-manager') >= 0
  }

  @computed
  get isDriverManager() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('driver-manager') >= 0
  }

  @computed
  get isDriverAdmin() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('driver-admin') >= 0
  }

  @computed
  get isReportsManager() {
    return this.user && this.user.scopes && this.user.scopes.indexOf('reports') >= 0
  }

  cando (action) {
    if (!this.user || !this.user.scopes) return false;
    const roles = RolesAllowed[action] || []
    return _.some(roles, (r) => this.user.scopes.indexOf(r) >= 0)
  }

  @computed
  get canSplitRoute() {
    return this.cando('split_route')
  }

  @computed
  get canRemovePhoto() {
    return this.cando('remove_photo')
  }
}

export default UserStore;
