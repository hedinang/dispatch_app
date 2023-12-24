import { observable, action, computed } from 'mobx';
import api from './api';

class AppealStore {
  constructor(api) {
    this.api = api;
  }

  @action
  getList = (query) => {
    if(!query) return;

    return this.api.post(`/appeals/search`, query);
  };

  @action
  viewFile = (id) => {
    if(!id) return;

    return this.api.get(`/appeals/${id}/files`);
  };

  @action
  addComment = (query) => {
    if(!query) return;

    return this.api.post(`appeals/comments`, query);
  };

  @action
  listComment = (id = null, limit = 10, offset = 0) => {
    if(!id) return;

    return this.api.get(`/appeals/${id}/comments/limit/${limit}/offset/${offset}`);
  };

  @action
  update = (id, status, remark = '') => {
    if(!id || !status) return;

    return this.api.put(`/appeals/${id}/status/${status}/remark/${remark}`);
  };

  @action
  getCategory = () => {
    return this.api.get(`/appeals/categories`);
  }
}

export default AppealStore;
