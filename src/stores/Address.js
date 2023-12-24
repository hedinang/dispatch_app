import { observable, action, computed } from 'mobx';

export default class AddressStore {
    baseUrl = "/address";

    constructor(api) {
        this.api = api;
    }

    get = (id) => this.api.get(`${this.baseUrl}/${id}`).then(r => r.data)
    editLocation = (id, location) => this.api.post(`${this.baseUrl}/${id}/location`, location).then(r => r.data)
    relocate = (id) => this.api.post(`${this.baseUrl}/${id}/relocate`)
    formatAddress = (id, address) => this.api.post(`${this.baseUrl}/${id}/format-address`, address)
    deliveryHistory = (id) => this.api.get(`${this.baseUrl}/${id}/delivery-history`).then(r => r.status === 200 ? r.data : []).then(history => {
        history.sort((a, b) => b.id - a.id)
        return history
    })
    update = (address) => this.api.put(`${this.baseUrl}/${address.id}`, address).then(r => r.data)
    addAccessCode = (id, code, type) => this.api.put(`${this.baseUrl}/${id}/access-code`, { code, type }).then(r => r.data)

    addVerifyPhoto = (address_id, file, cb) => {
        const formData = new FormData();
        formData.append('image', file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        this.api.post(`${this.baseUrl}/${address_id}/photo`, formData, config).then(r => {
            if (cb) {
                cb(r.data);
            }
        })
    }

    removeVerifyPhoto = (address_id, photo_id, cb) => {
        this.api.delete(`${this.baseUrl}/${address_id}/photo/${photo_id}`).then(r => {
            if (cb) {
                cb(r.data);
            }
        })
    }

    verifyPod = (address_id, pod_id) => this.api.put(`${this.baseUrl}/${address_id}/pod/${pod_id}`);
    unverifyPod = (address_id, pod_id) => this.api.delete(`${this.baseUrl}/${address_id}/pod/${pod_id}`);

    @observable deliverableAddress;

    @action
    loadAddress(id, cb) {
        if (!id) {
            this.deliverableAddress = null;
            return;
        }
        return this.api.get(`${this.baseUrl}/${id}`).then((r) => {
            if (r.status === 200)
                this.deliverableAddress = r.data;
            else
                this.deliverableAddress = null;
            cb && cb(r)
        })
    }
}