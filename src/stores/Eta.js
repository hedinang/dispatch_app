import { observable, action, computed } from 'mobx';

export default class EtaStore {
  constructor(logger, api) {
    this.logger = logger;
    this.api = api;
  }

  @observable eta = null;
  @observable assignmentId = null;
  @observable loading = false;

  @action
  setAssignment(assignmentId) {
    this.eta = null
    this.loading = true
    this.assignmentId = assignmentId;
    this.logger.info(`Getting eta for ${assignmentId}`)
    this.api.get(`/assignments/${assignmentId}/eta`).then((response) => {
      this.loading = false;
      if (response.status === 200)
        this.eta = response.data;
    })
  }

  @action
  updateEta(ts) {
    if (!this.assignmentId) return;
    return this.api.post(`/assignments/${this.assignmentId}/eta`, {ts}).then((response) => {
      if (response.status === 200) {
        this.eta = response.data;
        return response.data;
      } else {
          return null;
      }
    }) 
  }
}