import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class HistoryStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/histories",
    filters: {
      order_by: "name",
      desc: false,
      page: 1,
      size: 20
    },
    result: {
      count: 0,
      items: [],
      total_pages: 0
    },
    listField: "items",
    idField: "id"
  };


  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);
    if (!parent) {
      this.assignment = new HistoryStore(api, this);
      this.shipment = new HistoryStore(api, this);
    }
  }

  @observable history;

  create(cb) {
    const data = this.formStore.data;
    this.api.post(this.baseUrl, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        }
      })
  }

  edit(id, cb) {
    const data = this.formStore.data;
    this.api.put(`${this.baseUrl}/${id}`, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        }
      })
  }

  get(id, cb) {
    this.api.get(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          this.driverAnnouncement = response.data;
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  delete(id, cb) {
    this.api.delete(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          if (cb) {
            cb(response.data);
          }
        }
      })
  }
}

export default HistoryStore;
