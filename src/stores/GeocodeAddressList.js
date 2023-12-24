import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";
import _ from 'lodash';

class GeocodeAddressListStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/geocode/addresses",
    fields: [
      {name: "street", orderField: "street", label: "Street", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "city", label: "City"},
      {name: "state", label: "State"},
      {name: "zipcode", label: "Zipcode"},
      {name: "latlng", label: "Lat/Lng"},
      {name: "source", orderField: "source", label: "Source", toggleOrder: this.toggleOrder},
      {name: "access_code", label: "Access Code"},
      {name: "additional_instruction", label: "Additional Instruction"},
      {name: "navigation_difficulty", label: "Difficulty"},
      {name: "rdi", label: "RDI"},
      {name: "uncharted", label: "Uncharted"},
      {name: "actions", label: "#"},
    ],
    filters: {
      order_by: "_id",
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

  @observable address;

  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);
    this.formStore = new FormStore(this);
  }

  normalizeFormData(fd) {
    const fdClone = _.clone(fd);
    Object.keys(fdClone).forEach(k => {
      if (typeof fdClone[k] === 'string'){
        fdClone[k] = (fdClone[k] && fdClone[k].trim() !== '') ? fdClone[k].trim() : null;
      }
    });
    return fdClone;
  }

  create(cb) {
    const data = this.normalizeFormData(this.formStore.data);
    this.api.post(this.baseUrl, data)
      .then(response => {
        if (response.status === 201 && cb) {
          cb(response.data)
        }
      })
  }

  edit(id, cb) {
    const data = this.normalizeFormData(this.formStore.data);
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
          this.address = response.data;
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

  geocode(address, cb) {
    this.api.post(`${this.baseUrl}/geocode`, address).then(res => {
      if (cb) cb(res);
    })
  }
}

export default GeocodeAddressListStore;
