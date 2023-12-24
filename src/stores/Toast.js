import { observable, action, computed } from 'mobx';
import api from './api';

class ToastStore {
  constructor(api) {
    this.api = api;
  }

  @action
  getList = (query) => {
    if(!query) return;

    let params = new URLSearchParams();
    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/toasts?${params}`);
  }

  @action
  getDetail = (id) => {
    if(!id) return;

    return this.api.get(`/toasts/${id}`);
  }

  @action
  update = (id, query) => {
    if(!query) return;

    return this.api.put(`/toasts/${id}`, query);
  }
}

export default ToastStore;
