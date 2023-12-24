import { observable, action, computed } from 'mobx';

class DspStore {
  constructor(api) {
    this.baseUrl = '';
    this.api = api;
  }

  @observable dspSearchResult = [];
  @observable couriers = [];

  @action
  search(keyword) {
    this.api.get(`/couriers/advanced-search/${keyword}`)
      .then(response => {
        if (response.status === 200) {
          this.dspSearchResult = response.data;
        }
      })
  }

  @action
  listAll(onAssignScreen = false) {
    this.api.get(`/couriers/search?size=100`).then(response => {
      if (response.status === 200) {
        this.couriers = response.data;
        if (onAssignScreen) {
          this.dspSearchResult = response.data.couriers;
        }
      }
    })
  }
}

export default DspStore;