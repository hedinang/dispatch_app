import { observable, action, computed } from 'mobx';

export default class CustomerProfileStore {
    baseUrl = "/customer-profile";

    @observable selectedProfile;
    @observable profileHistory;
    @observable loadingHistory = false;
  
    constructor(api) {
        this.api = api;
    }
  
    get = (id) => this.api.get(`${this.baseUrl}/${id}`).then(r => r.data)
    correctAddress = (id, address) => this.api.post(`${this.baseUrl}/${id}/correct-address`, address).then(r => r.data)
    deliveryHistory = (id) => this.api.get(`${this.baseUrl}/${id}/delivery-history`).then(r => r.data)
    update = (profile) => this.api.put(`${this.baseUrl}/${profile.id}`, profile).then(r => r.data)

    @action
    loadProfile(id, cb) {
        if (!id) {
            this.selectedProfile = null;
            return;
        }
        this.api.get(`${this.baseUrl}/${id}`).then(r => {
            if (r.status === 200)
                this.selectedProfile = r.data;
            else
                this.selectedProfile = null;
            cb && cb(r)
        })
    }


    @action
    loadHistory(id, cb) {
        if (!id) {
            this.profileHistory = null;
            return;
        }
        this.loadingHistory = true;
        this.api.get(`${this.baseUrl}/${id}/delivery-history`).then(r => {
            this.loadingHistory = false;
            if (r.status === 200)
                this.profileHistory = r.data;
            else
                this.profileHistory = null;
            cb && cb(r)
        })
    }
}