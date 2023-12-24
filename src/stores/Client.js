import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";
import { REQUEST_STATUS_IDLE, REQUEST_STATUS_LOADING, REQUEST_STATUS_LOADED } from '../constants/common';

class ClientStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/clients/search",
    fields: [
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "name", orderField: "name", label: "Name", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "company", label: "Company"},
      {name: "email", label: "email"},
      {name: "phone_number", label: "Phone Number"},
      {name: "actions", label: "#"},
    ],
    filters: {
      order_by: "id",
      desc: true,
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

    constructor(api) {
        super(api);
        this.api = api;
        this.setData(this.DEFAULT);
        this.settingStore = new FormStore(this);
    }

    @observable driverSearchResult = [];
    @observable clients = [];
    @observable activeClients = { commingle: [], ondemand: [], special: [], specialty: [] };
    activeClientLoadState = REQUEST_STATUS_IDLE;

    @action
    search(q) {
        this.api.get(`/clients/by-company/${q}`)
            .then(response => {
                if (response.status === 200) {
                    this.driverSearchResult = response.data;
                }
            })
    }

  @action
  init() {
    this.getActiveClients();
  }

  @action
  getActiveClients(cb) {
    if ([REQUEST_STATUS_LOADING, REQUEST_STATUS_LOADED].includes(this.activeClientLoadState)) return;
    this.activeClientLoadState = REQUEST_STATUS_LOADING;

    this.api.get('clients/active').then((response) => {
      if (!response.ok) return this.activeClientLoadState = REQUEST_STATUS_LOADED;

      const { data } = response;
      let clients = {};
      for (let i = 0; i < data.length; i++) {
        const client = data[i];
        const type = client && client.service_type && client.service_type.toLowerCase();
        if (!clients[type]) clients[type] = [];
        clients[type].push(client.client_id);
      }

      clients['specialty'] = clients['specialty'] || clients['special'];

      Object.keys(clients).forEach((type) => clients[type].sort((a, b) => a - b));

      this.clients = data;
      this.activeClients = clients;
      this.activeClientLoadState = REQUEST_STATUS_LOADED;
      if(cb) cb(data)
    });
  }

  @action
  getSettings(clientId, cb) {
    this.api.get(`/clients/${clientId}/settings`)
      .then(response => {
        if (response.status === 200) {
            if (cb) {
                cb(response.data);
            }
        }
      })
  }

  @action
  updateSettings(clientId, cb) {
    const data = this.settingStore.data;

    this.api.put(`/clients/${clientId}/settings`, {client_id: clientId, settings: data})
      .then(response => {
        if (response.status === 200) {
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  @action
  getClientsInfo(clientIds, cb) {
      if(!clientIds || !Array.isArray(clientIds)) return false;

      this.api.post(`/clients/info`, clientIds).then(res => {
        if(cb) cb(res);
      });
  }
}

export default ClientStore;
