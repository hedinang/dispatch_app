import { PriorityHigh } from '@material-ui/icons';
import { observable, action, computed } from 'mobx';

export default class LyftStore {
  constructor(logger, api) {
    this.logger = logger;
    this.api = api;
  }

  @observable info = {};
  @observable assignmentId = null;
  @observable loading = false;
  @observable pendingRequest = false;
  @observable isLoadingModalOpen = false;
  @observable requestType = "";
  @observable externalPath = {};
  @observable refreshingPath = false;
  @observable cancellationReasonList = [];
  @observable error= "";

  @action
  setAssignment(assignmentId, provider) {
    this.info = {}
    this.loading = true
    this.assignmentId = assignmentId;
    this.api.get(`/external/${provider}/${assignmentId}`).then((response) => {
      this.loading = false;
      if (response.status === 200)
      this.info = response.data;
    })
  }

  setPendingRequest(requestType){
    this.pendingRequest = true
    this.isLoadingModalOpen = true;    
    this.error = "";
    this.requestType = requestType;
  }

  handleResponse(provider,requestType,response){
    this.pendingRequest = false
    if (response.status < 300 && response.status >= 200) {
      if (response.data && response.data.status === 'ERROR') {          
        this.error = `Error while sending ${requestType} request to ${provider}. Detail: ${response.data.error}`;
        return
      }
      this.info = response.data;
      if(response.status == 200){
        this.setIsLoadingModalOpen(false);
      }        
    } else {
      this.error = `Error while sending ${requestType} request to ${provider}`;        
    }
  }

  @action
  quote(provider, ts) {
    if (!this.assignmentId) return;
    this.setPendingRequest('quote');
    this.api.post(`/external/${provider}/${this.assignmentId}/quote${ts ? ('?at='+ts) : ''}`).then((response) => this.handleResponse(provider,'quote',response))
  }

  @action
  request(provider) {
    if (!this.assignmentId) return;
    this.setPendingRequest('driver');
    this.api.post(`/external/${provider}/${this.assignmentId}/request`).then((response) => this.handleResponse(provider,'request',response))
  }

  @action
  setIsLoadingModalOpen(isOpen){
    this.isLoadingModalOpen = isOpen;
    this.error = "";
    this.requestType = "";
  }

  @action
  cancel(provider,reason,notes) {
    if (!this.assignmentId) return;
    this.setPendingRequest('cancel');
    this.api.post(`/external/${provider}/${this.assignmentId}/cancel`,{reason, notes}).then((response) => this.handleResponse(provider,'cancel',response))
  }

  @action
  getExternalInfo() {
    if (!this.assignmentId) {
      this.externalPath = null
      return;
    }
    const { external_id } = this.info || {}
    if (!external_id) {
      this.externalPath = null
      return
    }
    this.refreshingPath = true
    this.api.get(`/external/${external_id.split('_')[0]}/path/${external_id.split('_')[1]}`).then((response) => {
      this.refreshingPath = false
      if (response.status < 300 && response.status >= 200) {
        this.externalPath = response.data;
      } else {
        console.log(response)
      }
    }) 
  }

  @action
  refreshExternalInfo() {
    if (!this.assignmentId) {
      this.externalPath = null
      return;
    }
    const { external_path_id, external_id } = this.info || {}
    if (!external_id || !external_path_id) {
      this.externalPath = null
      return
    }
    this.refreshingPath = true
    this.api.post(`/external/${external_id.split('_')[0]}/path/${external_path_id}/refresh`).then((response) => {
      this.refreshingPath = false
      if (response.status < 300 && response.status >= 200) {
        this.externalPath = response.data;
      } else {
        console.log(response)
      }
    }) 
  }

  @action
  getCancellationReasons(provider){
    this.api.get(`/external/${provider}/cancel/reasons`).then((response) => {      
      if (response.status === 200) {
        this.cancellationReasonList = response.data;
      } else {
        console.log(response)
      }
    }) 
  }

}