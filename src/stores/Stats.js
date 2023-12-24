import { observable, action, computed } from 'mobx';
import api from './api';
import moment from 'moment';

class StatsStore {
  constructor(api) {
    this.api = api;
  }

  @action
  getStats(region, params, date) {
    if (!date) {
      date = moment().format('YYYY-MM-DD')
    }

    const {clients, client_types} = params
    return this.api.get(
      `/statistics/regions/${region}/date/${date}`,
      {
        clients: clients ? clients.join(',') : null,
        client_types: client_types ? client_types.join(",") : null,
      }
    )
  }

  @action
  getProjection(region, params, date) {
    if (!date) {
      date = moment().format('YYYY-MM-DD')
    }

    const {clients, client_types} = params
    return this.api.get(
      `/statistics/regions/${region}/date/${date}/projection`,
      {
        clients: clients ? clients.join(',') : null,
        client_types: client_types ? client_types.join(",") : null,
      }
    ).then(this.processProjectData)
  }

  processProjectData(r) {
    if (r.status != 200) return []
    if (!r.data) return []
    return r.data.map(client => {
      if (client.count_by_status) {
        if (client.count_by_status.CANCELLED_BEFORE_PICKUP) {
          client.count -= client.count_by_status.CANCELLED_BEFORE_PICKUP
        }
      }
      return client;
    }).filter(c => c.count);
  }
}

export default StatsStore;
