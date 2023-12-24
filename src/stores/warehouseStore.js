import {observable, action} from 'mobx';

class WarehouseStore {

    constructor(api) {
        this.api = api;
    }
    @observable loading = false;

    @observable warehouses = [];

    @action
    getWarehouses(regions, cb) {
        this.loading = true;
        this.api.get('/warehouses', {regions})
        .then(response => {
            this.loading = false;
            if (response.status === 200) {
                this.warehouses = response.data;
                if(cb) {
                    cb(response.data);
                }
            }
        })
    }
}

export default WarehouseStore;
