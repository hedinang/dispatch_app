import _ from 'lodash';
import moment from 'moment';
import { observable, action, computed, toJS } from 'mobx';

import FormStore from "./FormStore";
import { STOP_TYPE } from "../constants/type";
import { toast } from 'react-toastify';

class ShipmentStore {
  constructor(api, assignmentStore) {
    this.api = api;
    this.assignmentStore = assignmentStore;
    this.dropoffStopForm = new FormStore(this);
    this.pickupStopForm = new FormStore(this);
    this.shipmentCustomerForm = new FormStore(this);
    this.shipmentPickupForm = new FormStore(this);
    this.shipmentDropoffForm = new FormStore(this);
    this.feedbackForm = new FormStore(this);
    this.tagForm = new FormStore(this);
  }

  @observable selectedStop = null;
  @observable selectedStopId = null;
  @observable selectedShipment = null;
  @observable selectedLabel = null;
  @observable shipmentSearchResult = {};
  @observable selectedShipmentAssignment = null;
  @observable loadingAssignment = false;
  @observable loadingSearchResult = false;
  @observable uploadingImage = false;
  @observable regions = [];
  @observable clients = [];
  @observable timeRange = 'all';
  @observable start = moment().startOf('day').unix() * 1000;

  @observable previewShipmentId = '';
  @observable previewShipment = null;

  // pickup, dropoff stop
  @observable updatingPickupStop = false;
  @observable updatingDropoffStop = false;
  @observable updatingShipmentDropoff = false;
  @observable updatingShipmentPickup = false;

  @observable addingFeedback = false;
  @observable updating = false;
  @observable loadingPreviewShipment = false;
  @observable addingTag = false;
  @observable shipmentInfo = {};

  @observable filter = {
    from: 0,
    size: 15,
    q: '',
    filters: {},
    sorts: ['-dropoff_earliest_ts'],
  };

  @observable shipmentEvents = [];
  @observable loadingEvent = false;
  @observable shipmentAddressInfo = {};
  @observable loadingAddressInfo = false;
  @observable shipmentAnnotation = {};

  @computed
  get isShowingDetail() {
    return this.selectedShipment !== null && this.selectedShipment !== undefined
  }

  normalizeFormData(fd) {
    const fdClone = _.clone(fd);
    Object.keys(fdClone).forEach(k => {
      if (typeof fdClone[k] === 'string') {
        fdClone[k] = (fdClone[k] && fdClone[k].trim() !== '') ? fdClone[k].trim() : null;
      }
    });
    if (fdClone.save_instruction_for_future) {
      fdClone.save_for_future = ['instruction']
    }
    return fdClone;
  }

  @computed
  get clientList() {
    const { activeClients } = this.assignmentStore.clientStore;
    const commingleClientIds = activeClients.commingle;
    const onDemandClientIds = activeClients.ondemand;
    const specialityClientIds = activeClients.specialty;

    return { commingleClientIds, onDemandClientIds, specialityClientIds };
  }

  @action
  setClients(clients) {
    this.clients = clients
    if (this.clients && this.clients.length > 0) {
      this.filter.filters.client_id = clients.indexOf(0) >= 0 ? this.clientList.commingleClientIds.join(',') : clients.indexOf(1) >= 0 ? this.clientList.onDemandClientIds.join(',') : clients.indexOf(-1) >= 0 ? this.clientList.specialityClientIds.join(',') : this.clients.join(',')
    } else {
      delete this.filter.filters.client_id
    }
    this.doSearch()
  }

  @action
  setStatuses(statuses) {
    this.statuses = statuses
    if (this.clients && this.statuses.length > 0) {
      this.filter.filters.status = statuses[0]
    } else {
      delete this.filter.filters.status
    }
    this.doSearch()
  }

  @action
  setTimeRange_(r) {
    this.timeRange = r
    const today = moment().startOf('day').utc()
    if (r === 'today') {
      this.filter.filters.dropoff_earliest_ts = `gte_${today.format()},lt_${today.add(1, 'days').format()}`;
    } else if (r === 'past') {
      this.filter.filters.dropoff_earliest_ts = `lt_${today.format()}`;
    } else if (r === 'future') {
      this.filter.filters.dropoff_earliest_ts = `gt_${today.add(1, 'days').format()}`;
    } else if (r === 'custom') {
      this.setDate(this.start);
    } else {
      delete this.filter.filters.dropoff_earliest_ts
    }
  }

  @action
  setDate(d) {
    this.filter.filters.dropoff_earliest_ts = `gte_${moment(d).format()},lt_${moment(d).add(1, 'days').format()}`;
    this.doSearch();
  }

  @action
  setTimeRange(r) {
    this.setTimeRange_(r)
    this.doSearch()
  }

  setRegions(regions) {
    this.regions = regions
    if (this.regions && this.regions.length > 0) {
      this.filter.filters.region = regions.join(',')
    } else {
      delete this.filter.filters.region
    }
    this.doSearch()
  }

  // FOR DISPATCH TAB
  @action
  selectStop(stop) {
    if (!stop) {
      this.selectedStop = null;
      this.selectedStopId = null;
      return
    }
    this.selectedStop = stop;
    this.selectedStopId = stop.id;
    this.selectedShipment = stop.shipment;
    this.getStopDeliveryInfo(this.selectedStop)
    // reset edit form
    this.assignEditForm(stop);
    this.getShipmentHistory();
    this.getFeedback(stop.id);
    this.getShipmentAddressInfo();
    this.getShipmentInfo();
  }

  @action
  unselectStop() {
    this.selectedStop = null;
    this.selectedStopId = null;
    this.selectedShipment = null;
    this.selectedLabel = null;
  }

  @action
  loadStop(stopId) {
    this.selectedStopId = parseInt(stopId)
    this.getStop(stopId).then(s => {
      this.selectedStop = s;
      if (s && s.shipment) {
        this.selectedShipment = s.shipment;
      }
      this.getStopDeliveryInfo(s);
      this.getFeedback(stopId);
      this.getShipmentHistory();
      this.getShipmentAddressInfo();
    })
  }

  // FOR SEARCH TAB
  @action
  selectResultPage(page) {
    this.filter.from = Math.max(0, page - 1) * this.filter.size
    this.doSearch()
  }

  doSearch(cb) {
    this.selectedShipment = null
    this.loadingSearchResult = true
    this.api.post('/shipments/search', this.filter).then((response) => {
      if (response.data) {
        let shipmentSearchResult = response.data
        shipmentSearchResult.page = 1 + shipmentSearchResult.from / shipmentSearchResult.size
        shipmentSearchResult.total_pages = Math.floor((shipmentSearchResult.total + shipmentSearchResult.size - 1) / shipmentSearchResult.size)
        this.shipmentSearchResult = shipmentSearchResult
        this.loadingSearchResult = false;

        if (cb) cb(response);
      }
    })
  }

  @action
  search(q) {
    this.filter.q = q
    this.filter.from = 0
    this.doSearch()
  }

  @action
  selectShipment(shipment) {
    this.selectedShipment = shipment
    if (!shipment || !shipment.id) {
      this.selectedShipment = null;
      return
    }
    this.selectedShipmentAssignment = null;
    this.selectedStop = null
    this.loadShipment(shipment.id)
  }

  @action
  loadShipment(shipmentId, cb) {
    this.selectedShipment = null;
    if (!shipmentId) {
      return
    }
    this.loadingShipment = true;
    this.api.get(`/shipments/${shipmentId}`).then((response) => {
      this.loadingShipment = false;
      this.selectedShipment = response.data;
      const shipment = response.data;
      if (this.selectedShipment && this.selectedShipment.assignment_id) {
        this.loadAssignment(this.selectedShipment.assignment_id)
      }
      this.shipmentDropoffForm.data = {
        address: { ...shipment.dropoff_address },
        note: shipment.dropoff_note,
        dropoff_access_code: shipment.dropoff_access_code,
        dropoff_additional_instruction: shipment.dropoff_additional_instruction
      };
      this.getShipmentHistory()
      this.getShipmentAddressInfo()
      this.getShipmentAddressHistory(shipmentId)
      if (cb) cb(response);
    })
  }

  @action
  loadShipmentDeliveryGPS() {
    if (!this.selectedShipment) return
    if (!this.selectedShipment.assignment_id) return
    this.assignmentStore.getAssignmentTrackingGpsLocations(this.selectedShipment.assignment_id).then(locations => {
      this.selectedShipment.locations = locations
    })
  }

  @action
  getShipmentHistory() {
    if (!this.selectedShipment) {
      return;
    }
    // getting from api
    this.loadingShipmentHistory = true
    if (!this.selectedShipment.history)
      this.selectedShipment.history = []
    this.api.get('/events/shipments/' + this.selectedShipment.id + '?ref=true&rel=true')
      .then(response => {
        this.loadingShipmentHistory = false;
        if (!this.selectedShipment) return
        if (!response.data || response.data.length < 1) {
          return;
        }
        this.selectedShipment.history = response.data
        // this.selectedShipment.history.ts = new Date()
      });
  }

  @action
  getSetPreviewShipmentId(shipmentId) {
    this.previewShipmentId = shipmentId;
  }


  @observable previewShipmentError = null;

  @action
  getPreviewShipment(shipmentId) {
    this.previewShipment = null;
    this.previewShipmentError = null;
    if (!shipmentId) return;
    this.loadingPreviewShipment = true;
    const id = String(shipmentId).trim();
    this.api.get(`/shipments/${id}`).then((response) => {
      this.loadingPreviewShipment = false;
      if (response.status === 200) {
        if (response.data.dropoff_address &&
          response.data.dropoff_address.lat &&
          response.data.dropoff_address.lng) {
          this.previewShipment = response.data;
        } else {
          this.previewShipmentError = 'Shipment was not geocoded';
        }
      } else {
        this.previewShipmentError = `Could not find this shipment [${shipmentId}]`;
      }
    })
  }

  cancelPreviewShipment() {
    this.previewShipment = null;
  }

  loadAssignment(id) {
    this.selectedShipmentAssignment = null;
    if (!id) {
      return
    }
    this.loadingAssignment = true;
    this.api.get(`/assignments/${id}/detail`).then((response) => {
      this.loadingAssignment = false;
      const { data } = response;
      if (data.code && data.message) return;
      this.selectedShipmentAssignment = this.assignmentStore.processAssignmentDetail(data)
      if (this.selectedShipmentAssignment.stops && this.selectShipment) {
        const stops = this.selectedShipmentAssignment.stops.filter(s => s.shipment_id === this.selectedShipment.id)
        if (stops && stops.length > 0) {
          this.selectedStop = _.last(stops)
          this.getStopDeliveryInfo(this.selectedStop)
        }
      }
    })
  }

  getStop(stopId) {
    this.loadingStopInfo = true;
    return this.api.get(`/stops/${stopId}/detail`).then((response) => {
      if (response.data) {
        let data = response.data;
        const { stop, shipment, label, client, clientProfile, info, corresponding_stop, attributes } = data;
        if (!stop) {
          this.selectedStop = null;
          this.selectedStopId = null;
          return
        }
        stop.shipment = shipment;
        stop.label = label;

        stop.client = client;
        stop.client_profile = clientProfile;
        stop.info = info;
        stop.corresponding_stop = corresponding_stop;
        stop.attributes = attributes;

        this.assignEditForm(stop);
        this.getFeedback(stop.id);

        return stop
      } else {
        return {};
      }
    })
  }

  @action
  assignEditForm(stop) {
    const { shipment, corresponding_stop } = stop;
    if (stop.type === STOP_TYPE.DROPOFF) {
      this.dropoffStopForm.data = stop;
      if (corresponding_stop) {
        this.pickupStopForm.data = corresponding_stop;
      }
    }

    // assign shipment pickup and shipment dropoff
    this.shipmentCustomerForm.data = shipment.customer;

    // shipment pickup
    this.shipmentPickupForm.data = {
      address: shipment.pickup_address,
      note: shipment.pickup_note
    };

    this.shipmentDropoffForm.data = {
      address: { ...shipment.dropoff_address },
      note: shipment.dropoff_note,
      dropoff_access_code: shipment.dropoff_access_code,
      dropoff_additional_instruction: shipment.dropoff_additional_instruction
    };
  }

  getStopDeliveryInfo(stop) {
    if (!stop) {
      this.selectedStop = null;
      this.selectedStopId = null;
      return
    }
    this.loadingStopInfo = true
    this.api.get(`/stops/${stop.id}/delivery`).then((response) => {
      this.loadingStopInfo = false;
      if (this.selectedStop && this.selectedStop.id === stop.id) {
        if (response.data && response.data.pods && response.data.pods.length > 0) {
          const info = {};
          const pods = response.data.pods;
          info.images = pods.filter(item => item.type === 'picture');
          info.signatures = pods.filter(item => item.type === 'signature');
          info.idcards = pods.filter(item => item.type === 'idscan');

          this.selectedStop.info = info;
          this.getShipmentAnnotation()
        }
        else {
          _.set(this.selectedStop, 'info.images', []);
          _.set(this.selectedStop, 'info.signatures', []);
          _.set(this.selectedStop, 'info.idcards', []);
          this.shipmentAnnotation = {}
        }

        if (response.data && response.data.geocode_addresses) {
          this.selectedStop.geocodeAddresses = response.data.geocode_addresses;
        }

        if (response.data && response.data.incident_id) {
          this.selectedStop.incidentId = response.data.incident_id;
        }
      }
    })
  }

  updateDropoffStop(stop, cb, errorCB) {
    this.updating = true;
    if (!this.dropoffStopForm.data['actual_departure_ts']) {
      this.dropoffStopForm.data['actual_departure_ts'] = new Date();
    }

    if (_.isNil(this.dropoffStopForm.data['is_attempt'])) {
      this.dropoffStopForm.data['is_attempt'] = true;
    }

    this.api.put(`/stops/${stop.id}/dropoff`, this.normalizeFormData(this.dropoffStopForm.data)).then((response) => {
      this.updating = false;
      // take some properties

      if (response.status === 200) {
        Object.assign(this.selectedStop, response.data);
        if (!response.data.remark) {
          this.selectedStop.remark = null;
        }

        this.assignmentStore.updateStop(this.selectedStop);

        if (cb) {
          cb(response.data);
        }
      } else {
        if (errorCB) errorCB(response.data);
      }
    })
  }

  updatePickupStop(stop, cb, errorCB) {
    this.updating = true;
    if (!stop.actual_departure_ts) stop.actual_departure_ts = new Date();

    this.api.put(`/stops/${stop.id}/pickup`, stop).then((response) => {
      if (response.status === 200) {
        if (response.data && response.data.length === 2) {
          Object.assign(this.selectedStop, response.data[1]);
        }

        this.selectedStop.corresponding_stop = response.data[0];
        this.assignmentStore.updateStop(this.selectedStop);

        if (!response.data.remark) {
          this.selectedStop.remark = null;
        }
        // just merge pickup data
        this.assignmentStore.updateStop(response.data[0], true);
        if (cb) {
          cb(response.data);
        }
      } else {
        if (errorCB) errorCB(response.data);
      }
    })
  }

  updateMultiPickupStop(stops, cb, errorCb) {
    const filtered = stops.filter((stop) => Boolean(stop.remark) && Boolean(stop.status));
    const groups = _.groupBy(filtered, (stop) => `${stop.remark}-${stop.status}`);
    const data = Object.values(groups);

    const params = [];

    data.forEach((items) => {
      const ids = items.map(({ id }) => id);
      const [item] = items;
      params.push({ ids, remark: item.remark, status: item.status });
    });

    if (params.length === 0) return cb();

    this.api.put('/stops/pickups', params)
      .then((response) => {
        const { data } = response;

        const selectedStop = data.find((stop) => this.selectedStopId === stop.id);
        const correspondingStop = data.find((stop) => stop.id === this.selectedStop.corresponding_stop_id);

        if (selectedStop) Object.assign(this.selectedStop, selectedStop);
        if (correspondingStop) Object.assign(this.selectedStop.corresponding_stop, correspondingStop);

        cb(data);
      })
      .catch((error) => {
        if (typeof errorCb === 'function') return errorCb(error);
      });
  }

  updateShipmentCustomer(shipment, cb) {
    this.updating = true;
    this.api.put(`/shipments/${shipment.id}/customer`, this.normalizeFormData(this.shipmentCustomerForm.data)).then((response) => {
      this.updating = false;
      // take some properties
      this.selectedStop.shipment = response.data;
      this.assignmentStore.updateStop(this.selectedStop);
      if (cb) {
        cb(response.data);
      }
    })
  }

  updateShipmentPickup(shipment, stop, cb, error) {
    const that = this;
    this.updatingShipmentPickup = true;
    this.api.put(`/shipments/${shipment.id}/pickup`, this.normalizeFormData(this.shipmentPickupForm.data)).then((response) => {
      this.updatingShipmentPickup = false;
      // take some properties
      if (response.status === 200) {
        that.selectedStop.shipment = response.data;
        this.assignmentStore.updateStop(this.selectedStop);
        if (cb) {
          cb(response.data);
        }
      } else {
        if (error) error(response.data);
      }
    })
  }

  updateShipmentDropoff(shipment, stop, cb, error) {
    const that = this;
    this.updatingShipmentDropoff = true;
    const preparedData = this.normalizeFormData(this.shipmentDropoffForm.data)
    if(preparedData.note === null){
      preparedData.note = ''
    }
    this.api.put(`/shipments/${shipment.id}/dropoff`, preparedData).then((response) => {
      this.updatingShipmentDropoff = false;
      if (response.status === 200) {
        if (this.selectedStop) {
          this.selectedStop.shipment = response.data;
          this.assignmentStore.updateStop(this.selectedStop);
        }
        this.getShipmentAddressHistory(shipment.id)

        if (this.selectedShipment) {
          this.selectedShipment = { ...this.selectedShipment, ...response.data };
        }

        if (cb) {
          cb(response.data);
        }
      } else {
        if (error) error(response.data);
      }
    })
  }

  updateDropoffRemark(stop, cb) {
    this.updating = true;
    this.api.put(`/stops/${stop.id}/dropoff`, this.normalizeFormData(this.dropoffStopForm.data)).then((dropoffResp) => {
      this.updating = false;
      this.selectedStop.remark = dropoffResp.data.remark;
      this.assignmentStore.updateStop(this.selectedStop);
      if (cb) {
        cb(dropoffResp.data);
      }
    })
  }

  updateInstruction(shipment, cb) {
    this.updating = true;
    this.api.put(`/shipments/${shipment.id}/instruction`, this.normalizeFormData(this.shipmentDropoffForm.data)).then((response) => {
      this.updating = false;
      if (response.status === 200) {
        if (this.selectedStop) {
          this.selectedStop.shipment = response.data;
          this.assignmentStore.updateStop(this.selectedStop);
        }
        if (this.selectedShipment) {
          this.selectedShipment = response.data;
        }
      } else {
        try {
          if (response.data) {
            toast.error(response.data, {containerId: 'main'})
          }
        } catch (e) { }
      }
      if (cb) {
        cb(response.data);
      }
    })
  }

  updateAccessCode(shipment, accessCodes, cb) {
    this.updating = true;
    const accessCodesMap = new Map()
    accessCodes.forEach(e => accessCodesMap.set(e.type, e.value))
    const mapObject = Object.fromEntries(accessCodesMap);
    this.api.put(`/shipments/${shipment.id}/access-code`, mapObject).then((response) => {
      this.updating = false;
      if (response.status === 200) {
        if (this.selectedStop) {
          this.selectedStop.shipment = response.data;
          this.assignmentStore.updateStop(this.selectedStop);
        }
        if (this.selectedShipment) {
          this.selectedShipment = response.data;
        }
      } else {
        try {
          if (response.data) {
            toast.error(response.data, {containerId: 'main'})
          }
        } catch (e) { }
      }
      if (cb) {
        cb(response.data);
      }
    })
  }

  getLabel(shipmentId, format, callback) {
    if (format === 'PNG' || format === 'PDF') {
      this.api.get(`/shipments/${shipmentId}/label?format=${format}`).then(callback);
    } else {
      this.api.get(`/shipments/${shipmentId}/label`).then(callback);
    }
  }

  addImage(shipmentId, file, cb) {
    const formData = new FormData();
    formData.append('image', file);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    };

    this.uploadingImage = true;
    this.api.post(`/shipments/${shipmentId}/add-image`, formData, config)
      .then(response => {
        this.uploadingImage = false;
        if (response.status == 200) {
          if (this.selectedStop && this.selectedStop.info && this.selectedStop.info.images) {
            this.selectedStop.info.images.push(response.data);
          }
          else {
            _.set(this.selectedStop, 'info.images', [response.data]);
          }
        }
        if (cb) {
          cb(response);
        }
      })
  }

  getFeedback(stopId) {
    this.api.get(`/stops/${stopId}/get-feedback`).then(response => {
      if (response.status === 200) {
        this.feedbackForm.data = response.data;
        this.feedbackForm.originData = response.data;
      } else {
        this.feedbackForm.data = {};
        this.feedbackForm.originData = {};
      }
    });
  }

  addFeedback(stopId, callback) {
    this.addingFeedback = true;
    this.api.post(`/stops/${stopId}/add-feedback`, this.feedbackForm.data).then(response => {
      if (callback) callback(response);
      if (response.status === 200) {
        this.feedbackForm.originData = response.data;
      }
      this.addingFeedback = false;
    });
  }

  updateTags(shipment, tags, callback) {
    this.addingTag = true;
    const oldTags = shipment.tags;
    this.api.post(`/shipments/${shipment.id}/tags`, tags).then(response => {
      this.addingTag = false;

      if (response.status === 200) {
        this.selectShipment.tags = tags;
        if (this.assignmentStore.selectedAssignment && this.assignmentStore.selectedAssignment.stops) {
          this.assignmentStore.selectedAssignment.stops.forEach(stop => {
            if (stop.shipment && stop.shipment.id === shipment.id) {
              stop.shipment.tags = tags;
            }
          })

          // update assignment tags too
          if (this.assignmentStore.assignments) {
            this.assignmentStore.assignments.forEach(a => {
              if (a.id === shipment.assignment_id) {
                if (!a.aggregated_tags) {
                  a.aggregated_tags = tags;
                } else {
                  let newTags = a.aggregated_tags.filter(t => !oldTags || !oldTags.includes(t)).concat(tags);
                  newTags = _.uniq(newTags);
                  a.aggregated_tags = newTags;
                }
              }
            })

          }
        }
        if (callback) callback(response.data);
      }
    });
  }

  cancelShipment(shipment, reason, callback) {
    this.api.post(`/shipments/${shipment.id}/cancel`, reason).then(res => {
      if (res.ok) {
        this.selectShipment(shipment);
      }
      if (callback) callback(res);
    })
  }

  @observable splitingRoute = false;

  splitRoute(assignmentId, shipmentId, data, callback) {
    this.splitingRoute = true;
    this.api.put(`/assignments/${assignmentId}/split/${shipmentId}`, data).then(response => {
      this.splitingRoute = false;

      if (callback) callback(response.data);
    });
  }

  @action
  getShipmentOutboundEvents(shipmentId, cb) {
    if (!shipmentId) return false;

    this.loadingEvent = true;

    this.api.get(`/shipments/${shipmentId}/outbound-events`).then(res => {
      if (res.status === 200 || res.ok) {
        this.shipmentEvents = res.ok;
      }

      if (cb) cb(res);
    })
  }

  @action
  updateInboundStatus(shipmentId, status, revert_deleted_shipment, cb) {
    if (!shipmentId) return false;
    this.api.put(`/inbound/${shipmentId}`, { status, soft: true }, { params: { revert_deleted_shipment } }).then(res => {
      if (res.ok) {
        // do stuff
      }

      if (cb) cb(res);
    });
  }
  @action
  deletePOD(podID, cb) {
    if (!podID) return false;
    this.api.delete(`/stops/delivery/${podID}/remove`).then(res => {
      if (res.ok) {
        // do stuff
      }

      if (cb) cb(res);
    });
  }

  @action
  getShipmentAddressInfo(cb) {
    this.loadingAddressInfo = true

    this.api.get(`/shipments/${this.selectedShipment.id}/address-info`).then(res => {
      if (res.status === 200 || res.ok) {
        this.shipmentAddressInfo = res.data;
      } else {
        this.shipmentAddressInfo = {}
      }

      if (cb) cb(res);
    })

    this.loadingAddressInfo = false
  }

  @action
  getShipmentAddressHistory(shipmentId) {
    this.api.get(`/shipments/${shipmentId}/updated-address-history`).then((res) => {
      if (res.ok) {
        if (this.assignmentStore.selectedAssignment) {
          this.assignmentStore.selectedAssignment.updatedAddressMap[shipmentId] = res.data
        }

        if (this.selectedShipmentAssignment) {
          this.selectedShipmentAssignment.updatedAddressMap[shipmentId] = res.data
        } else {
          this.selectedShipmentAssignment = {
            updatedAddressMap: {},
            assignment: { predicted_start_ts: null },
            stops: [],
            updatedAddressMap: {
              [shipmentId]: res.data && res.data.length ? res.data : null
            }
          }
        }
      }
    })
  }

  @action
  getShipmentInfo() {
    this.api.get(`/shipments/${this.selectedShipment.id}/info`).then(res => {
      if (res.ok) {
        this.shipmentInfo = res.data;
      } else {
        this.shipmentInfo = {}
      }
    })
  }

  @action
  getShipmentAnnotation(cb) {
    
      this.selectedStop && this.selectedStop.id && this.api.get(`/shipments/${this.selectedShipment.id}/annotation/${this.selectedStop.id}`).then(res => {
        if (res.status === 200 || res.ok) {
          this.shipmentAnnotation = res.data;
        } else {
          this.shipmentAnnotation = {}
        }
  
        if (cb) cb(res);
      })

  }
}

export default ShipmentStore;
