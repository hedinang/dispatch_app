import { observable, action, computed } from 'mobx';
import moment from 'moment';
import _ from 'lodash';
import polyline from 'google-polyline';
import {searchInObject} from 'axl-js-utils';
import momentTz from 'moment-timezone';

import { STATUS, STOP_STATUS } from '../constants/status';
import FormStore from "./FormStore";
import Websocket2 from './Websocket2';
import { getTimeZone } from '../Utils/timezone';

Array.prototype.removeByVal = function(val) {
  return this.filter(i => i!= val)
}

Array.prototype.addUniqueElements = function(elements, ) {
  return Array.from(new Set([...this,...elements]))
}

class AssignmentStore {
    constructor(logger, api, ws, driverStore, clientStore) {
        this.logger = logger;
        this.api = api;
        this.driverStore = driverStore;
        this.showStastistic = true;
        this.assignmentForm = new FormStore(this);
        this.wsRisky = new Websocket2('risky-assignment')
        this.clientStore = clientStore;
        this.isLoadFirst = true;
        this.clientStore.getActiveClients(() =>
          {
            this.loadAssignments();
            this.isLoadFirst = false;
          });

        // let today = moment().startOf('day')
        // this.start = today.unix() * 1000
        this.date = moment().format('YYYY-MM-DD');
        // this.start = moment('2018-12-10').unix() * 1000
        this.regions = []
        this.allRegions = ['SFO', 'LAX', 'SDLAX', 'SMF', 'PHX', 'PNS', 'JFK', 'DFW', 'HOU', 'CHI', 'MKE']
        this.clients = []
        this.lastKnownLocations = {}
        this.driverCache = {}
        this.updateCache = {}

        ws.subscribe('STOP_MODIFIER', this.handleStopModifier.bind(this))
        ws.subscribe('ASSIGNMENT_MODIFIER', this.handleAssignmentModifier.bind(this))
        ws.subscribe('DRIVER_LOCATION', this.handleDriverLocation.bind(this))
        this.activeDriverLocations = this.processActiveDrivers(this.assignments, this.lastKnownLocations, 600000);
        this.activeLocationHandlder = setInterval(() => {
          this.activeDriverLocations = this.processActiveDrivers(this.assignments, this.lastKnownLocations, 600000)
        }, 15000)
    }

    @observable activeDriverLocations;
    @observable filter;

    @observable completedAssignments = [];
    @observable pendingAssignments = [];
    @observable pickingUpAssignments = [];
    @observable inactiveAssignments = [];
    @observable inProgressAssignments = [];
    @observable unassignedAssignments = [];
    @observable riskyAssignments = [];
    @observable warehouses = [];
    @observable hidden = {};
    @observable fetching = false;
    @observable bonusConfig = {};
    @observable riskObj = this.createRiskObj(); // risky assigment infos which get from api or websocket
    @observable isShowWarehouseInfo = false;
    @observable reasonCodes = [];
    @observable pickupWarehouses = [];

    showingStopTypes = ['DROP_OFF', 'RETURN']
    dataLimit = 3000;

    handleStopModifier(msg) {
        console.log(msg)
    }

    @action
    redeliverShipment(shipmentId) {
      return this.api.get(`/shipments/${shipmentId}/outbound-info?src=dispatch-app`).then((response) => {
        if (response.ok && response.data) {
          return response.data;
        } else {
          return {
            ok: false,
            ...response.data
          };
        }
      })
    }

    @action
    removeShipment(shipmentId, {reason, reason_code}, cb) {
      if (!this.selectedAssignment) return
      return this.api.delete(`/assignments/${this.selectedAssignment.assignment.id}/shipments/${shipmentId}`, {reason, reason_code}).then((response) => {
        this.selectedAssignment.stops = this.selectedAssignment.stops.removeByVal(shipmentId);
        if(cb) cb(response);

        return response.data;
      })
    }

    @action
    discardStop(stopId) {
      if (!this.selectedAssignment) return
      return this.api.post(`/assignments/${this.selectedAssignment.assignment.id}/stops/${stopId}/discard`).then((response) => {
        if (response.ok) {
          this.selectedAssignment.stops = this.selectedAssignment.stops.map(s => {
            if (s.id === stopId) {
              s.status = response.data.status;
            }
            return s;
          });
        } else {
          if (response && response.data) {
            alert(response.data.message);
          }
        }
        return response.data;
      })
    }

  @action
    handleDriverLocation(msg) {
      this.logger.debug(msg)
      let comps = msg.split(':')
      if (comps.length < 4 || !comps[3]) {
        return
      }
      // reconstruct message
      let ts = parseInt(comps[0]) * 1000
      let assignmentId = parseInt(comps[1])
      let driverId = comps[1] ? parseInt(comps[2]) : null
      let coords = comps[3].split(',')
      let geolocation = {
        lat: parseFloat(coords[0]),
        lng: parseFloat(coords[1]),
        latlng: [parseFloat(coords[0]), parseFloat(coords[1])],
        lnglat: [parseFloat(coords[1]), parseFloat(coords[0])],
        heading: coords.length > 2 ? parseInt(coords[2]) : null
      }
      geolocation.angle = geolocation.heading ? (90 - geolocation.heading) : 0
      if (geolocation.angle < 0)
        geolocation.angle += 360
      // if (assignments.length < 1) return;
      this.lastKnownLocations[driverId] = {
        ts,
        assignmentId,
        driverId,
        geolocation,
      }

      // convert to driver location
      if (this.selectedAssignment && this.selectedAssignment.assignment.id === assignmentId && this.selectedAssignment.assignment.driver_id === driverId) {
        const driverLocation = {
          assignment_id: assignmentId,
          created: Date.now(),
          driver_id: driverId,
          heading: geolocation.heading,
          latitude: geolocation.lat,
          longitude: geolocation.lng,
          timestamp: new Date().toISOString()
        }
        this.selectedAssignment.driverLocation = driverLocation
        if (!this.selectedAssignment.locations) {
          this.selectedAssignment.locations = [driverLocation]
        } else {
          this.selectedAssignment.locations.push(driverLocation)
        }
      }
    }

    processActiveDrivers(assignments, locations, duration) {
      if (!assignments || assignments.length < 1) return []
      if (_.isNil(locations)) return []
      const ts = Date.now()
      const limit = ts - duration
      let activeLocations = []
      let assignmentMap = {}
      assignments.forEach(a => {
        assignmentMap[a.id] = a
      })
      for (var driverId in locations) {
        const location = locations[driverId]
        // if (location.ts < limit) continue;
        let assignment = assignmentMap[location.assignmentId]
        if (!assignment) continue;
        activeLocations.push(Object.assign(location, {'assignment': assignment, 'driver': this.driverCache[location.driverId]}))
      }
      return activeLocations
    }

    handleAssignmentModifier(msg) {
        this.logger.debug(Date.now(), msg)
        let comps = msg.split('::')
        let assignmentId = parseInt(comps[0])
        let shouldReload = this.assignments.filter(a => a.id === assignmentId).length > 0
        let shouldAdd = comps.length > 1 && comps[1] === 'CREATED'
        if (shouldReload) {
            this.logger.debug('refreshing assignment')
            // this.refreshAssignment(assignmentId, comps[1], comps.length > 1 ? comps[2] : null)
        }
        if (shouldAdd) {
            this.logger.debug('load new assignment')
            this.loadNewAssignment(assignmentId)
        }
    }

    @computed
    get clientList() {
      const { activeClients } = this.clientStore;
      const commingleClientIds = activeClients.commingle;
      const onDemandClientIds = activeClients.ondemand;
      const specialityClientIds = activeClients.specialty;

      return { commingleClientIds, onDemandClientIds, specialityClientIds };
    }

    @computed
    get assignmentShipmentStats() {
      this.logger.debug(new Date(), 'Start computing stats')
      let total = 0, unassigned = 0, pending = 0, inprogress = 0, failed = 0, succeeded = 0, late = 0, early = 0
      let clients = !this.clients ? this.clients : this.clients.indexOf(0) >= 0 ? this.clientList.commingleClientIds : this.clients.indexOf(1) >= 0 ? this.clientList.onDemandClientIds : this.clients
      if (this.assignments) {
        this.assignments.forEach(assignment => {
          if (assignment.extra && assignment.extra.stats) {
            for (var client_id in assignment.extra.stats) {
              if (clients && clients.length > 0 && clients.indexOf(parseInt(client_id)) < 0) continue;
              let sub_stats = assignment.extra.stats[client_id]
              /*
              PP : pickup pending
              PF : pickup failed
              PS : pickup succeeded
              DF : dropoff failed
              DS : dropoff succeeded
              DP : dropoff pending
              */
              for (var k in sub_stats) {
                let v = sub_stats[k]
                if (k === 'DS') {
                  succeeded += v
                } else if (k === 'PF' || k === 'DF') {
                  failed += v
                } else if (k === 'PP') {
                  pending += v
                } else if (k === 'PS' || k === 'DP') {
                  inprogress += v
                } else if (k === 'late') {
                  late += v
                } else if (k === 'early') {
                  early += v
                }
              }
            }
          } else {
            let sc = assignment.shipment_count ? assignment.shipment_count : (assignment.number_of_stops / 2);
            pending += assignment.driver_id ? sc : 0;
            unassigned += assignment.driver_id ? 0 : sc;
          }
        })
      }
      total = unassigned + pending + inprogress + failed + succeeded
      this.logger.debug(new Date(), 'End computing stats')
      return {
        total,
        unassigned,
        pending,
        inprogress,
        failed,
        succeeded,
        late,
        early
      }
    }

    loadAssignmentDriver(driver_id) {
        this.driverStore.get(driver_id).then(driver => {
            if (!driver)
                return
            this.driverCache[driver.id] = driver
            this.assignments = this.assignments.map(a => {
                if (a.driver_id === driver.id) {
                    return Object.assign(a, {driver})
                } else {
                    return a
                }
            })
        })
    }

    refreshAssignment(id, signal, type) {
        if (signal === 'CLOCK_IN') return;
        if (type === 'PICK_UP') return;
        this.api.get(`/assignments/${id}/info`)
            .then(response => {
                let info = response.data;
                let { assignment, extra, driver, eta } = info
                if (driver) {
                    this.driverCache[driver.id] = driver
                }
                assignment.driver = driver
                if (!assignment.driver_id) {
                    assignment.driver_id = null
                }
                assignment.extra = extra
                assignment.eta = eta
                if (assignment.extra && assignment.extra.dropoff_status) {
                    assignment.pickedup = assignment.extra.dropoff_status.split('|').filter(a => a === 'PS').length
                    assignment.failed = assignment.extra.dropoff_status.split('|').filter(a => a === 'DF').length
                    assignment.complted = assignment.extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS').length
                    assignment.progress = assignment.extra.dropoff_status.split('|').filter(a => a.substr(0,1) === 'D').map(a => a.substr(1))
                }

                this.updateCache[assignment.id] = assignment
                /*
                let old = this.assignments.filter(a => a.id === assignment.id)
                let isIncluded = old.length > 0

                if (!isIncluded)
                    return;
                if (isIncluded) {
                    this.assignments = this.assignments.map(a => {
                        if (a.id === assignment.id) {
                            return Object.assign(a, assignment)
                        } else {
                            return a
                        }
                    })
                }
                */
                this.applyChange()
            }).catch((e) => {
                this.loadingAssignment = false; // TODO: display error
            })
    }

    refreshAssignmentInfo(id, signal) {
        this.api.get(`/assignments/${id}/extra`)
            .then(response => {
                let extra = response.data;
                if (!extra) return;
                let old = this.assignments.filter(a => a.id === assignment.id)
                let isIncluded = old.length > 0

                if (!isIncluded)
                    return;

                let assignment = old[0]
                this.logger.debug('To update', assignment.label)
                assignment.extra = extra
                if (assignment.extra && assignment.extra.dropoff_status) {
                    assignment.pickedup = assignment.extra.dropoff_status.split('|').filter(a => a === 'PS').length
                    assignment.failed = assignment.extra.dropoff_status.split('|').filter(a => a === 'DF').length
                    assignment.complted = assignment.extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS').length
                    assignment.progress = assignment.extra.dropoff_status.split('|').filter(a => a.substr(0,1) === 'D').map(a => a.substr(1))
                }

                this.assignments = this.assignments.map(a => {
                    if (a.id === assignment.id) {
                        return Object.assign(a, assignment)
                    } else {
                        return a
                    }
                })
            }).catch((e) => {
                this.loadingAssignment = false; // TODO: display error
            })
    }

    loadNewAssignment(id) {
        this.api.get(`/assignments/${id}/info`)
            .then(response => {
                let assignmentInfo = response.data;
                let { assignment, assignmentLabel, driver, clients, extra } = assignmentInfo
                if (!assignment.label && assignmentLabel)
                  assignment.label = assignmentLabel.prefix
                assignment.driver = driver
                assignment.clients = clients
                assignment.extra = extra
                if (assignment.extra && assignment.extra.dropoff_status) {
                    assignment.pickedup = assignment.extra.dropoff_status.split('|').filter(a => a === 'PS').length
                    assignment.failed = assignment.extra.dropoff_status.split('|').filter(a => a === 'DF').length
                    assignment.complted = assignment.extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS').length
                    assignment.progress = assignment.extra.dropoff_status.split('|').filter(a => a.substr(0,1) === 'D').map(a => a.substr(1))
                }

                // check filter to see if it's part of the list
                let predicted_start_str = moment(assignment.predicted_start_ts).format('YYYY-MM-DD')
                let isPartOf = (this.regions.length < 1 || this.regions.indexOf(assignment.region_code) >= 0)
                    && this.date == predicted_start_str
                    && (this.clients.length < 1 || !_.isEmpty(_.intersection(assignment.client_ids, this.clients)))

                if (!isPartOf)
                    return

                let old = this.assignments.filter(a => a.id === assignment.id)
                let isIncluded = old.length > 0

                if (!isIncluded) {
                    this.assignments = [assignment].concat(this.assignments)
                }
                else {
                    this.assignments = this.assignments.map(a => {
                        if (a.id === assignment.id) {
                            return Object.assign(a, assignment)
                        } else {
                            return a
                        }
                    })
                }
            }).catch((e) => {
                this.loadingAssignment = false; // TODO: display error
            })
    }

    getSearchFilter(offset){
        const searchFilter = {
            order: '-id',
            limit: this.dataLimit,
            region_codes: this.regions ? this.regions.join(',') : '',
            wh: this.warehouseIds ? this.warehouseIds.join(',') : '',
            // start_ts: this.start,
            date: this.date,
            clients: this.clients && ![0,-1,-2].includes(this.clients[0]) ? this.clients.join(',') : '',
            logistic_types: [0,-1,-2].includes(this.clients[0]) ? Math.abs(this.clients[0]): '',
            // end_ts: this.start + 24 * 3600 * 1000,
            requested: this.assignmentsRequested
        }
        if(offset !== undefined){
            searchFilter.from = offset;
        }
        return searchFilter;
    }

    @computed
    get searchFilter() {
        return this.getSearchFilter()
    }

    /**
     * Assignments list
     */
    // @observable start;
    @observable date;
    @observable assignments = [];
    @observable assignmentSummeries = [];
    @observable loadingAssignments = false;
    @observable updatingBonus = false;
    @observable bonusError = '';
    @observable sendingMessagePool = false;
    @observable assigning = false;
    @observable unAssigning = false;
    @observable selectedAssignmentId = null;
    @observable selectedAssignment = null;
    @observable loadingAssignment = false;
    @observable sortBy = 'predicted_start_ts';
    @observable inlineFilter = null;
    @observable tagFilter = [];
    @observable driverTagFilter = [];
    @observable showStatistic = false;
    @observable boundary = null;
    @observable addingShipment = false;
    @observable warehouseIds = [];
    assignmentsRequested = 0

    @computed
    get assignmentAggregatedTags() {
      if (!this.assignments) return []
      return _.uniq(_.flatMap(this.assignments, a => a.aggregated_tags || []))
    }

    @action
    toggleStatistic() {
        this.showStatistic = !this.showStatistic
    }

    @action
    setDate(d) {
      if (d) {
        // this.start = moment(d).unix() * 1000
        this.date = moment(d).format('YYYY-MM-DD')
      } else {
        // this.start = null
        this.date = moment().format('YYYY-MM-DD')
      }
      this.warehouseIds = []
      this.warehouses = []
      this.loadAssignments(0)
    }

    @action
    setRegions(r) {
        this.regions = r
        this.warehouseIds = []
        this.warehouses = []
        this.loadAssignments(0)
    }

    @action
    setWarehouses(r) {
      this.warehouseIds = r;
      if(!this.isLoadFirst) {
        this.loadAssignments(0);
      }
    }

    @action
    setClients(r) {
        this.clients = r
        this.warehouseIds = []
        this.warehouses = []
        this.loadAssignments(0)
    }

    async getAllAssignments(){
        let from = 0;
        let response;
        let allAssignments = {
            assignments:[],
            clients:[],
            drivers:[],
            driverBonusMap:{},
            eta:[],
            extra:[]
        };

        let dataSize = 0;
        while (dataSize === 0 || dataSize === this.dataLimit) {
            const filter = this.getSearchFilter(from);
            response = await this.api.get('/assignments/list-by-date', filter);
            if (response.ok && response.data && response.data.assignments) {
              if (response.data.assignments.length === 0) {
                console.log("No more data");
                from = 0;
                break;
              }

              dataSize = response.data.assignments.length;
              from += dataSize;
              allAssignments = this.mergeData(allAssignments, response.data);
            } else {
              console.warn("Failed to load data", response.status, response.data)
              from = 0;
              break;
            }
        }

        return Promise.resolve({
            data: allAssignments,
            config: response.config
        });
    }

    async getAllWarehouses(){
        let from = 0;
        let response;
        let allWarehouses = [];

        let dataSize = 0;
        while (dataSize === 0 || dataSize === this.dataLimit) {
            const filter = this.getSearchFilter(from);
            response = await this.api.get('/assignments/warehouses-by-date', filter);
            if (response.ok && response.data) {
              if (response.data.length === 0) {
                console.log("No more data");
                from = 0;
                break;
              }

              dataSize = response.data.length;
              from += dataSize;
              allWarehouses = [...allWarehouses, ...response.data];
            } else {
              console.warn("Failed to load data", response.status, response.data)
              from = 0;
              break;
            }
        }

        return Promise.resolve({
            ok: response.ok,
            status: response.status,
            data: allWarehouses
        });
    }

    mergeData(previousData, newData){
        return {
            assignments: [...previousData.assignments, ...newData.assignments],
            clients: [...previousData.clients, ...newData.clients],
            drivers: [...previousData.drivers, ...newData.drivers],
            driverBonusMap: {...previousData.driverBonusMap, ...newData.driverBonusMap},
            eta: [...previousData.eta, ...newData.eta],
            extra: [...previousData.extra, ...newData.extra],
        };
    }

    // list shipments
    @action
    loadAssignments(page) {
        this.loadingAssignments = true;
        this.assignmentsRequested = Date.now()
        this.getAllWarehouses().then(response => {
          if(response.ok && response.status === 200) {
            this.warehouses = response.data;
          }
        })

        this.getAllAssignments()
          .then(response => {
              if (response.config.params.requested !== this.assignmentsRequested)
                  return
              this.assignments = this.processAssignments(response.data); // TODO: manipulate date into proper format
              this.resetAssignmentList();
              this.refreshAssignmentList_()
              this.updateCache = {} // clear Cache
              this.activeDriverLocations = this.processActiveDrivers(this.assignments, this.locations, 600000)
              this.loadingAssignments = false;

              return this.assignments
          })
          .then(assignments => {
            this.loadAssignmentConversationSummary()
          }).catch((e) => {
            this.loadingAssignments = false; // TODO: display error
          }).finally(() => {
            this.loadingAssignments = false;
          })

        // get risky assignments
        this.api.get(`/assignments/risky?date=${this.searchFilter.date}`).then(response => {
          if(response.ok && response.status === 200) {
            const riskyList = response.data;
            if (riskyList.length < 1) {
              return;
            }

            const risk = this.processRiskyList(riskyList);
            this.riskObj = this.createRiskObj(risk.inactive_ids, risk.return_ids, risk.late_ids, risk.created_ts)
          } else {
            this.riskObj = this.createRiskObj()
          }
        })
    }

    processRiskyList(riskyList) {
      const inactive_ids = [];
      const return_ids = [];
      const late_ids = [];
      let created_ts = 0;

      riskyList.forEach(risk => {
        if (risk.is_resolved) {
          return;
        }

        if (risk.category === 'STALLED') {
          inactive_ids.push(risk.assignment_id);
        } else if (risk.category === 'RETURN') {
          return_ids.push(risk.assignment_id);
        } else if (risk.category === 'NOTD') {
          late_ids.push(risk.assignment_id);
        }

        created_ts = Math.max(created_ts, risk.created_ts);
      })

      return {inactive_ids, return_ids, late_ids, created_ts};
    }

    @action
    loadAssignmentConversationSummary(ids, cb) {
      if(!this.assignments.length) return false;

      const assignmentIds = ids ? ids : this.assignments.filter(a => a.driver).map(a => a.id);
      this.api.post(`/messenger/assignment_conversation/summary`, assignmentIds).then(res => {
        if(res.status === 200 || res.ok) {
          const newAssignmentSummeries = Object.keys(res.data).map((key, index) => ({
            assignmentId: parseInt(key),
            ...res.data[key]
          }));
          const oldSummaries = ids ? this.assignmentSummeries.filter(a => ids.indexOf(a.id) < 0) : []
          this.assignmentSummeries = [...oldSummaries, ...newAssignmentSummeries]
        }

        if(cb) {
          cb(res)
        }
      })
    }

    processAssignments(assignments) {
        let labelMap = {}
        let driverMap = {}
        let extraMap = {}
        let etaMap = {}
        if (assignments.labels) {
            assignments.labels.forEach(l => {
                labelMap[l.assignment_id] = l;
            })
        }
        if (assignments.drivers) {
            assignments.drivers.forEach(l => {
                this.driverCache[l.id] = l;
            })
        }
        if (assignments.extra) {
            assignments.extra.forEach(l => {
                extraMap[l.assignment_id] = l;
            })
        }
        if (assignments.eta) {
          assignments.eta.forEach(l => {
            etaMap[parseInt(l.object.split('_')[1])] = l;
          })
        }
        let processed = assignments.assignments.map(a => {
            if (!a.label && labelMap[a.id])
              a.label = labelMap[a.id].prefix
            a.driver = this.driverCache[a.driver_id]
            a.extra = extraMap[a.id]
            a.eta = etaMap[a.id]
            if (a.extra && a.extra.dropoff_status) {
                a.pickedup = a.extra.dropoff_status.split('|').filter(a => a === 'PS').length
                a.failed = a.extra.dropoff_status.split('|').filter(a => a === 'DF').length
                a.complted = a.extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS' || a === 'DL' || a === 'DE').length
                a.progress = a.extra.dropoff_status.split('|').filter(a => a.substr(0,1) === 'D').map(a => a.substr(1))
            } else {
                a.pickedup = 0
            }
            if (a.extra && a.extra.path) {
              a.path = polyline.decode(a.extra.path)
            }
            let dropoffStatusArray = [];
            if (a.extra && a.extra.dropoff_status) {
              const ss = _.split(a.extra.dropoff_status, '|').filter(s => s && s[0] === 'D');
              let lastS = {status: '', count: 0}
              for (let s of ss) {
                if (s === lastS.status) {
                  lastS.count += 1
                } else {
                  lastS = {status: s, count: 1}
                  dropoffStatusArray.push(lastS)
                }
              }
            }
            a.dropoffStatusArray = dropoffStatusArray
            return a;
        })

        // get boundary
        const latlngs = processed.filter(a => a.path).flatMap(a => a.path)
        const lats = latlngs.map(l => l[0])
        const lngs = latlngs.map(l => l[1])
        if (latlngs.length < 2) {
          this.boundary = null
        } else {
          let boundary = [
            [_.min(lngs), _.min(lats)],
            [_.max(lngs), _.max(lats)]
          ]

          if (boundary[1][0] < boundary[0][0] + 0.001) {
            boundary[1][0] = boundary[0][0] + 0.001
          }
          if (boundary[1][1] < boundary[0][1] + 0.001) {
            boundary[1][1] = boundary[0][1] + 0.001
          }
          this.boundary = boundary
        }

        return _.sortBy(processed, (a) => a.region_code + (a.label ? a.label : ''))
    }

    @action
    updateAssignmentEta(assignmentId, eta) {
      // slow
      this.assignments = this.assignments.map(a => a.id === assignmentId ? Object.assign({}, a, {'eta': eta}) : a)
      this.pickingUpAssignments = this.hidden['picking_up'] ? [] : this.processInlineAssignments(this.assignments.filter(a => a.driver_id && a.is_active && a.status !== STATUS.COMPLETED && !a.pickedup));
      this.pendingAssignments = this.hidden['pending'] ? [] : this.processInlineAssignments(this.assignments.filter(a => (a.driver_id || a.courier_id) && a.status !== STATUS.COMPLETED && !a.is_active && !a.pickedup));
    }

    @action
    appendSplitedAssignment(originalAssignmentId, newAssignment) {
        // try to find the orig route first
        var assignment = this.assignments.find(a => a.id === originalAssignmentId);
        // clone new assignment
        const cloneAssignment = _.cloneDeep(assignment);
        cloneAssignment.shipment_count = newAssignment.shipment_count;
        // cloneAssignment = Object.assign({}, cloneAssignment, newAssignment);

        cloneAssignment.id = newAssignment.id;
        cloneAssignment.shipment_count = newAssignment.shipment_count;
        cloneAssignment.label = newAssignment.label;

        assignment.shipment_count = assignment.shipment_count - newAssignment.shipment_count;

        this.assignments = [cloneAssignment].concat(this.assignments.slice());
        this.refreshAssignmentList_();
        setTimeout(() => {
          console.log('time out refresh assignment');
          this.loadAssignment(cloneAssignment.id);
      }, 5000);
    }

    sort(assignments) {
        if (this.sortBy === 'predicted_start_ts') {
            return _.sortBy(assignments, a => a.predicted_start_ts)
        }
        return assignments;
    }

    @action
    setInlineFilter(q) {
        this.inlineFilter = q;
        this.refreshAssignmentList()
    }

    @action
    setTagFilter(tags) {
        this.tagFilter = tags;
        this.refreshAssignmentList_()
    }

    @action
    setTagsFilter(tags, driverTags) {
        this.tagFilter = tags;
        this.driverTagFilter = driverTags;
        this.refreshAssignmentList_()
    }

    processInlineAssignments(assignments) {
        let sorted = this.sort(assignments)
        let q = this.inlineFilter ? this.inlineFilter.trim() : ''
        let u = q.toUpperCase()
        let tokens = u.split(",")
        let filterLabel = (a) =>  {
          var isTrue = false;
          isTrue = (a.label && typeof(a.label) === 'string' && (a.label.indexOf(u) == 0 || tokens.includes(a.label))) || a.id.toString() === u || tokens.includes(a.id.toString()) || (a.label && a.label.prefix && (a.label.prefix.indexOf(u) == 0 || tokens.includes(a.label.prefix)));
          if (!isTrue) {
            try {
              const regx = new RegExp(q, 'gi');
              isTrue = !!a.label.match(regx);
            } catch (e) {
              console.log(e);
            }
          }

          return isTrue;
        }

        let filterZones = (a) => u.length > 2 && a.zones && a.zones.toUpperCase().indexOf(u) >= 0
        let filterDriver = (a) => u.length > 2 && a.driver && a.driver.first_name && a.driver.last_name && ((a.driver.first_name.trim().toUpperCase() + ' ' + a.driver.last_name.trim().toUpperCase()).indexOf(u) >= 0 || (a.driver.last_name.trim().toUpperCase() + ' ' + a.driver.first_name.trim().toUpperCase()).indexOf(u) >= 0)

        const filterTag = (a) => {
            const aggregatedTags = a.aggregated_tags ? a.aggregated_tags.map(t => t.toLowerCase()): [];
            const tags = a.courier_id ? ['dsp', ...aggregatedTags] : aggregatedTags
            if (!this.tagFilter || this.tagFilter.length == 0) return true;
            if (!aggregatedTags) return false;

            const filterTags = this.tagFilter.map(t => t.toLowerCase());
            return _.difference(filterTags, tags).length == 0
        }

        const filterDriverTag = (a, filterTags) => {
          let tags = a.driver && a.driver.tags && a.driver.tags.length ? a.driver.tags : null
          if (!tags) return false

          return tags.some(t => filterTags.includes(t.toLowerCase()))
        }

        if (this.tagFilter && this.tagFilter.length && this.driverTagFilter && this.driverTagFilter.length) {
          const filterTags = this.driverTagFilter.map(t => t.toLowerCase())
          sorted = sorted.filter(a => filterTag(a) || filterDriverTag(a, filterTags));
        } else if (this.tagFilter && this.tagFilter.length) {
          sorted = sorted.filter(filterTag);
        } else if (this.driverTagFilter && this.driverTagFilter.length) {
          const filterTags = this.driverTagFilter.map(t => t.toLowerCase())
          sorted = sorted.filter(a => filterDriverTag(a, filterTags))
        }

        if (this.inlineFilter) {
            let q = this.inlineFilter.trim()
            return sorted.filter(a => filterLabel(a) || filterZones(a) || filterDriver(a))
        } else {
            return sorted;
        }
    }

    @action
    setHidden(status, checked) {
      this.hidden[status] = checked
      this.refreshAssignmentList_()
    }

    @action
    setHiddenAll(checked) {
      Object.keys(this.hidden).forEach(key => {
        if(key !== "all"){
          this.hidden[key] = checked;
        }
      });
      this.refreshAssignmentList_();
    }

    @action
    resetAssignmentList() {
      this.completedAssignments = [];
      this.pickingUpAssignments = [];
      this.inProgressAssignments = [];
      this.inactiveAssignments = [];
      this.pendingAssignments = [];
      this.unassignedAssignments = [];
      this.riskyAssignments = [];
    }

    @action
    refreshAssignmentList_() {
      console.log(Date.now(), 'start refreshing assignment list')
      let assignments = this.assignments;
      if (this.hidden['unrolled']) {
        assignments = assignments.filter(a => !!a.aggregated_tags && a.aggregated_tags.includes("ROLLED"));
      }

      const riskIds = [...this.riskObj["inactiveIds"], ...this.riskObj["returnIds"], ...this.riskObj["lateIds"]]
      this.completedAssignments = this.hidden['completed'] ? [] : this.processInlineAssignments(assignments.filter(a => a.status === STATUS.COMPLETED).map(item => ({...item, 'assignment_category': 'COMPLETED'})));
      this.pickingUpAssignments = this.hidden['picking_up'] ? [] : this.processInlineAssignments(assignments.filter(a => a.driver_id && a.is_active && a.status !== STATUS.COMPLETED && !a.pickedup && !riskIds.includes(a.id)).map(item => ({...item, 'assignment_category': 'PICKING_UP'})));
      this.inProgressAssignments = this.hidden['in_progress'] ? [] : this.processInlineAssignments(assignments.filter(a => a.driver_id && a.is_active && a.status !== STATUS.COMPLETED && a.pickedup && !riskIds.includes(a.id)).map(item => ({...item, 'assignment_category': 'IN_PROGRESS'})));
      this.inactiveAssignments = this.hidden['inactive'] ? [] : this.processInlineAssignments(assignments.filter(a => (a.driver_id || a.courier_id) && a.status !== STATUS.COMPLETED && !a.is_active&& a.pickedup && !riskIds.includes(a.id)).map(item => ({...item, 'assignment_category': 'INACTIVE'})));
      this.pendingAssignments = this.hidden['pending'] ? [] : this.processInlineAssignments(assignments.filter(a => (a.driver_id || a.courier_id) && a.status !== STATUS.COMPLETED && !a.is_active && !a.pickedup && !riskIds.includes(a.id)).map(item => ({...item, 'assignment_category': 'PENDING'})));
      this.unassignedAssignments = this.hidden['unassigned'] ? [] : this.processInlineAssignments(assignments.filter(a => !a.driver_id && !a.courier_id && (a.status !== STATUS.COMPLETED && !riskIds.includes(a.id))).map(item => ({...item, 'assignment_category': 'UNASSIGNED'})));

      const completedAssignmentIds = this.completedAssignments.map(a => a.id)
      this.riskyAssignments = this.hidden['at_risk'] ? [] : this.processInlineAssignments(assignments.filter(a => riskIds.includes(a.id) && !completedAssignmentIds.includes(a.id)));

      console.log(Date.now(), 'end refreshing')
    }

    @action
    applyChange_() {
      if (!this.updateCache || _.isEmpty(this.updateCache)) {
        return
      }
      let assignments = this.assignments.map(a => {
          if (this.updateCache.hasOwnProperty(a.id)) {
              return Object.assign(a, this.updateCache[a.id])
          } else {
              return a
          }
      })
      this.updateCache = {}
      this.assignments = assignments

      this.refreshAssignmentList_()
    }

    refreshAssignmentList = _.debounce(this.refreshAssignmentList_, 1000, { 'maxWait': 2000 });
    applyChange = _.debounce(this.applyChange_, 15000, { 'maxWait': 20000 })

    @action
    onFocus() {
      this.applyChange = _.debounce(this.applyChange_, 15000, { 'maxWait': 20000 })
      this.applyChange()
    }

    @action
    onBlur() {
      this.applyChange = _.debounce(this.applyChange_, 60000, { 'maxWait': 120000 })
    }

    /*
    @computed
    get completedAssignments() {
        return this.processInlineAssignments(this.assignments.filter(a => a.status === STATUS.COMPLETED))
    }

    @computed
    get inProgressAssignments() {
        return this.processInlineAssignments(this.assignments.filter(a => a.driver_id && a.is_active && a.status !== STATUS.COMPLETED))
    }

    @computed
    get pendingAssignments() {
        return this.processInlineAssignments(this.assignments.filter(a => a.driver_id && a.status !== STATUS.COMPLETED && !a.is_active))
    }

    @computed
    get unassignedAssignments() {
        return this.processInlineAssignments(this.assignments.filter(a => !a.driver_id && (a.status !== STATUS.COMPLETED)))
    }
    */

    @action
    selectAssignment(assignment) {
        if (!assignment) {
          this.selectedAssignment = null
          this.selectedAssignmentId = null
          return
        }
        this.selectedAssignment = {
            assignment: assignment,
            driver: assignment.driver,
            assignmentLabel: assignment.label,
            lastUpdate: Date.now()
        }

        const moveCompletedFromRisky = (resp) => {
          const riskIds = this.riskyAssignments.map(a => a.id)
          if (!riskIds.includes(assignment.id))
            return

          const assignmentDetail = resp.data;
          if (assignmentDetail.assignment && assignmentDetail.assignment.status === "COMPLETED") {
            this.removeRisk(assignmentDetail.assignment)
            this.completedAssignments.push(assignmentDetail.assignment)
          }
        }
        this.loadAssignment(assignment.id, moveCompletedFromRisky);
    }

    @action
    loadAssignment(id, cb) {
        this.selectedAssignmentId = id;
        this.loadingAssignment = true;
        this.isShowWarehouseInfo = false;
        this.api.get(`/assignments/${id}/detail`)
            .then(response => {
                let assignmentDetail = response.data;
                if (assignmentDetail.assignment.id !== this.selectedAssignmentId) return; // not the expected one, ignore
                if (assignmentDetail.code && assignmentDetail.message) return;
                assignmentDetail.lastUpdate = Date.now();
                this.loadingAssignment = false;
                this.selectedAssignment = this.processAssignmentDetail(assignmentDetail);
                this.getAssignmentLocations(this.selectedAssignment)
                this.getDriverLocation(this.selectedAssignment)

                if(cb) cb(response);
            }).catch((e) => {
                this.loadingAssignment = false; // TODO: display error
            })
    }

    @action
    ping() {
        if (!this.selectedAssignmentId || !this.selectedAssignment || !this.selectedAssignment.assignment.driver_id) {
            return;
        }

        if (this.selectedAssignment.assignment.status === 'COMPLETED')
            return
        // throttle too many updates
        if (this.selectedAssignment.lastUpdate && this.selectedAssignment.lastUpdate > (Date.now() - 20000))
            return;

        // this.getDriverLocation(this.selectedAssignment)
        // this.getAssignmentLocations(this.selectedAssignment)
        // this.loadingAssignment = true;
        this.api.get(`/assignments/${this.selectedAssignmentId}/ping?last_update=${this.selectedAssignment.lastUpdate ? this.selectedAssignment.lastUpdate : 0}`)
            .then(response => {
                // this.loadingAssignment = false;
                this.selectedAssignment.lastUpdate = Date.now();
                let stops = response.data;
                if (!stops || stops.length < 1)
                    return
                if (stops[0].assignment_id !== this.selectedAssignmentId) {
                    // not the expected one, ignore
                    return;
                }
                this.selectedAssignment.lastUpdate = Date.now();
                let stopMap = {}
                stops.forEach(s => stopMap[s.id] = s)
                let mergedStops = this.selectedAssignment.stops.map(stop => {
                    if (stopMap[stop.id])
                        return Object.assign({}, stop, stopMap[stop.id])
                    else
                        return stop
                })
                this.selectedAssignment = Object.assign(this.selectedAssignment, {stops: mergedStops})
            }).catch((e) => {
                console.log(e)
                // this.loadingAssignment = false; // TODO: display error
            })
    }

    getDriverLocation(assignmentDetail) {
        if (!assignmentDetail.assignment.driver_id) {
            return;
        }
        this.driverStore.getLastLocation(assignmentDetail.assignment.driver_id).then((l) => {
            if (!l) return;
            if (l.assignment_id !== assignmentDetail.assignment.id) return
            if (moment(l.timestamp).unix() * 1000 < Date.now() - 1200000) {
                assignmentDetail.driverLocation = null
            } else {
                assignmentDetail.driverLocation = l
            }
        })
    }

    getAssignmentLocations(assignmentDetail) {
        // let lastUpdated = assignmentDetail.locations && assignmentDetail.locations.length > 0 ? assignmentDetail.locations[assignmentDetail.locations.length - 1] : null
        let lastUpdated = null;
        let url = `assignments/${assignmentDetail.assignment.id}/locations` + (lastUpdated ? `?last=${lastUpdated.timestamp}` : '')
        this.api.get(url).then((res) => {
            if (res.data && res.data.length > 0)
                assignmentDetail.locations = assignmentDetail.locations.concat(_.reverse(res.data.filter(lo => lo.latitude && lo.longitude)))
        })
    }

    getAssignmentTrackingGpsLocations(id) {
      // let lastUpdated = assignmentDetail.locations && assignmentDetail.locations.length > 0 ? assignmentDetail.locations[assignmentDetail.locations.length - 1] : null
      let url = `assignments/${id}/locations`
      return this.api.get(url).then((res) => res.data)
  }

    processAssignmentDetail(assignmentDetail) {
        const shipmentMap = {};
        const shipmentLabelMap = {};
        const clientMap = {};
        const stopMap = {};
        const profilesMap = {};

        assignmentDetail.shipments.forEach(s => {
            shipmentMap[s.id] = s;
        });
        assignmentDetail.shipmentLabels.forEach(s => {
            shipmentLabelMap[s.shipment_id] = s;
        });
        assignmentDetail.clients.forEach(s => {
            clientMap[s.id] = s;
        });
        assignmentDetail.clientProfiles.forEach((profile) => {
          profilesMap[profile.id] = profile;
        });

        if (assignmentDetail.driver && this.driverCache) {
          this.driverCache[assignmentDetail.driver.id] = assignmentDetail.driver
        }

        assignmentDetail.stops.forEach(s => {
          stopMap[s.id] = s;
        });
        // calculate bbox. Will be part of assignment in the future
        let lats = assignmentDetail.shipments.map(s => s.dropoff_address.lat)
        let lngs = assignmentDetail.shipments.map(s => s.dropoff_address.lng)
        if (assignmentDetail.assignment.logistic_type === 'ON_DEMAND') {
            lats = lats.concat(assignmentDetail.shipments.map(s => s.pickup_address.lat))
            lngs = lngs.concat(assignmentDetail.shipments.map(s => s.pickup_address.lng))
        }
        assignmentDetail.bbox = [[_.min(lngs), _.min(lats)], [_.max(lngs), _.max(lats)]]

        assignmentDetail.stops.forEach(stop => {
            stop.shipment = shipmentMap[stop.shipment_id];
            stop.label = shipmentLabelMap[stop.shipment_id];

            //@TODO: move DROP_OFF into constant
            if (this.showingStopTypes && this.showingStopTypes.indexOf(stop.type) >= 0) {
              stop.corresponding_stop = stop.corresponding_stop_id && stopMap[stop.corresponding_stop_id] ? stopMap[stop.corresponding_stop_id] : null;
                if (!stop.corresponding_stop) {
                    if (stop.type !== 'PICK_UP') {
                        let pickups = assignmentDetail.stops.filter((s) => s.shipment_id == stop.shipment_id && s.type === 'PICK_UP');
                        if (pickups.length > 0) {
                            stop.corresponding_stop = pickups[0]
                            stop.attributes = {
                                is_reattempt: stop.type == 'DROP_OFF' ? 'true' : 'false',
                                can_discard:  (stop.status !== 'SUCCEEDED' && stop.status !== 'FAILED').toString()
                            }
                        }
                    }
                }
            }

            if (stop.shipment) {
              const client = _.cloneDeep(clientMap[stop.shipment.client_id]);
              stop.client = client;
            }
        })

        // No need to do this, we processed it in BE
        /* = assignmentDetail.assignment && assignmentDetail.assignment.driver_id
          && assignmentDetail.assignment.status !== 'COMPLETED' && _.every(assignmentDetail.stops
              .filter(s => !s._deleted)
              .filter(s => ['PICK_UP', 'DROP_OFF'].indexOf(s.type) >= 0)
              .map(s => ['FAILED', 'SUCCEEDED', 'DISCARDED'].indexOf(s.status) >= 0)
          )*/
        assignmentDetail.isCompleted = assignmentDetail.assignment && assignmentDetail.assignment.status === 'COMPLETED'

        if (process.env.REACT_APP_PICKUP_ALL_HIDE_ETA === 'true') {
          assignmentDetail.isPickedUp = assignmentDetail.stops && _.every(assignmentDetail.stops.filter(st => st.type === 'PICK_UP'), s => ['SUCCEEDED', 'FAILED', 'DISCARDED'].includes(s.status))
        } else {
          assignmentDetail.isPickedUp = assignmentDetail.stops && _.some(assignmentDetail.stops, s => s.type === 'PICK_UP' && s.status === 'SUCCEEDED')
        }

        if(assignmentDetail.extra && assignmentDetail.extra.dropoff_status) {
          assignmentDetail.pickupSucceed = assignmentDetail.extra.dropoff_status.split('|').filter(a => a === 'PS').length;
          assignmentDetail.dropoffSucceed = assignmentDetail.extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS' || a ==='DL' || a ==='DE').length;
        }
        assignmentDetail.locations = []
        const assignmentDate = assignmentDetail && assignmentDetail.assignment && momentTz.tz(assignmentDetail.assignment.predicted_start_ts, getTimeZone(assignmentDetail.assignment.timezone)).format('YYYY-MM-DD');
        if(assignmentDate !== this.date) {
          this.setDate(momentTz.tz(assignmentDetail.assignment.predicted_start_ts, getTimeZone(assignmentDetail.assignment.timezone)))
        }
        return assignmentDetail;
    }

    @action
    complete(assignment) {
        this.api.put(`/assignments/${assignment.id}/complete`).then((r) => {
            console.log(r)
            if (r.status !== 200) {
                alert("Cannot complete assignment. Please contact engineering team to fix the issue\n" + (r.data ? r.data.message : ''))
                return
            }
            assignment.status = 'COMPLETED'
            if (this.selectedAssignment.assignment.id === assignment.id) {
                this.selectedAssignment.completable = false
            }
            this.assignments = this.assignments.map(a => a.id === assignment.id ? Object.assign(a, {status: 'COMPLETED'}) : a)
            this.refreshAssignmentList_()
        })
    }

    @action
    updateStop(stop, merge) {
      if (this.selectedAssignment && this.selectedAssignment.stops) {
        this.selectedAssignment.stops = this.selectedAssignment.stops.map(s => {
          if (s.id === stop.id) {
            if (!merge)
              return stop;
            else {
              Object.assign(s, stop);
              return s;
            }
          }
          else return s;
        })
      }
    }

    @action
    updateStops(stops) {
      this.selectedAssignment.stops = this.selectedAssignment.stops.map((stop) => {
        if (stop.type === 'DROP_OFF') {
          const dropoff = stops.find((s) => s.id === stop.id);
          const pickup = stops.find((s) => s.id === stop.corresponding_stop_id);
          if (dropoff) Object.assign(stop, dropoff);
          if (pickup) Object.assign(stop.corresponding_stop, pickup);
        }

        if (stop.type === 'PICK_UP') {
          const pickup = stops.find((s) => s.id === stop.id);
          if (pickup) Object.assign(stop, pickup);
        }

        return stop;
      });
    }

    @computed
    get showingStops() {
        if (!this.selectedAssignment || !this.selectedAssignment.stops)
            return []

        return this.selectedAssignment.stops.filter(s => this.showingStopTypes.indexOf(s.type) >= 0)
    }

    @computed
    get filteredShowingStops() {
      if (!this.selectedAssignment || !this.selectedAssignment.stops)
        return []

      const stops = this.selectedAssignment.stops
        .filter(s => this.showingStopTypes.indexOf(s.type) >= 0)

      // filter
      if (this.filter) {
        const searchFields = [
          "label.driver_label",
          "shipment.customer.name",
          "shipment.customer.phone_number",
          "shipment.customer.email",
          "shipment.dropoff_address.street",
          "shipment.dropoff_address.city",
          "shipment.dropoff_address.state",
          "shipment.dropoff_address.zipcode",
          "shipment.internal_id",
          "shipment.delivery_items",
          "shipment.tracking_code",
          "shipment.id",
        ];
        return stops.filter(s => searchInObject(s, this.filter, "i", searchFields))
      }

      return stops;
    }

    @action
    isNotTheFirstStop(shipment) {
        if (!this.selectedAssignment) return false;

        const stops = this.selectedAssignment.stops
            .filter(s => this.showingStopTypes.indexOf(s.type) >= 0);

        if (!shipment || !stops || stops.length === 0) return false;


        //console.log('compare: ', stops[0].shipment_id, shipment.id, stops[0] != shipment.id);
        if (stops !== null && stops.length > 0 && stops[0].shipment_id && stops[0].shipment_id != shipment.id) {
            return true;
        }

        return false;
    }

    havePendingStop(shipment) {
        if (!this.selectedAssignment) return false;

        const stops = this.selectedAssignment.stops
            .filter(s => this.showingStopTypes.indexOf(s.type) >= 0);

        if (!shipment || !stops || stops.length <= 0) return false;


        // need to for loop
        var isAfterShipment = false;
        var pendingStopNum = 0;
        for (var i = 0; i < stops.length; i++) {
            if (stops[i].shipment_id && stops[i].shipment_id == shipment.id) {
                //console.log('i is: ', i);
                isAfterShipment = true;
            }

            if (isAfterShipment && (!stops[i].status || (stops[i].status != STOP_STATUS.FAILED && stops[i].status != STOP_STATUS.SUCCEEDED))) {
                return true;
            }
        }

        return false;
    }

    isPickedUpAlready(data) {
      if (!data) return false;

      if (!data.stops || !data.stops.length) return false;

      const pickedUpStops = data.stops
        .filter(st => st.type === 'PICK_UP')
        .filter(st => st.status === 'SUCCEEDED');

      return !!pickedUpStops.length;
    }

    isDelivering(data) {
      if (!data) return false;

      if (!data.stops || !data.stops.length) return false;

      const deliveringStops = data.stops
        .filter(st => st.type === 'DROP_OFF')
        .filter(st => ['SUCCEEDED', 'EN_ROUTE'].includes(st.status));

      return !!deliveringStops.length;
    }

    /**
     * Scheduling
     */
    assignDriver(assignment_id, driver_id, reason) {
        return this.api.put(`/assignments/${assignment_id}/assign`, {driver_id, reason});
    }

    unassignDriver(assignment_id, driver_id, reason) {
        return this.api.put(`/assignments/${assignment_id}/unassign`, {driver_id, reason});
    }

    reassignDriver(assignment_id, old_driver_id, driver_id, reason) {
        return this.api.put(`/assignments/${assignment_id}/reassign`, {driver_id, old_driver_id, reason});
    }

    activateAssignment(assignment_id) {
        return this.api.put(`/assignments/${assignment_id}/activate`);
    }

    deactivateAssignment(assignment_id) {
        return this.api.put(`/assignments/${assignment_id}/deactivate`);
    }

    @action
    assign(assignment, driver, reason) {
        this.assigning = true;
        return this.assignDriver(assignment.assignment.id, driver.id, reason).then((r) => {
            assignment.driver = driver;
            this.assigning = false;
            let assignments = this.assignments.map(a => {
                if (a && a.id === assignment.assignment.id) {
                    return Object.assign({}, a, {driver: driver, driver_id: driver.id});
                }
                return Object.assign({}, a);
            })
            this.assignments = assignments
            return r
        })
    }

    @action
    unassign(assignment, reason) {
        this.unAssigning = true;

        if (!assignment.driver)
            return
        return this.unassignDriver(assignment.assignment.id, assignment.driver.id, reason).then((r) => {
            assignment.driver = null;
            this.unAssigning = false;
            let assignments = this.assignments.map(a => {
                if (a && a.id === assignment.assignment.id) {
                    return Object.assign({}, a, {driver: null, driver_id: null});
                }
                return Object.assign({}, a);
            })
            this.assignments = assignments
            return r
        })
    }

    @observable reAssigning = false;
    @action
    reassign(assignment, driver, reason) {
        this.reAssigning = true;

        if (!assignment.driver)
            return
        return this.reassignDriver(assignment.assignment.id, assignment.driver.id, driver.id, reason).then((r) => {
            assignment.driver = driver;
            this.reAssigning = false;
            let assignments = this.assignments.map(a => {
                if (a && a.id === assignment.assignment.id) {
                    return Object.assign({}, a, {driver: driver, driver_id: driver.id});
                }
                return Object.assign({}, a);
            })
            this.assignments = assignments
            return r
        })
    }

    @action
    assignDsp(assignment, dsp, reason) {
      this.assigning = true;
      const assignment_id = assignment.assignment.id;
      const dsp_id = dsp.id;

      return this.api.put(`/assignments/${assignment_id}/assign-dsp`, {dsp_id, reason}).then(res => {
        if (res.ok) {
          this.assignments = this.assignments.map(a => {
            if (a && a.id === assignment.assignment.id) {
              return Object.assign({}, a, {courier: dsp, courier_id: dsp.id});
            }
            return Object.assign({}, a);
          })
        }
        this.assigning = false;
        return res;
      })
    }

    @action
    unassignDsp(assignment, reason) {
      this.unAssigning = true;

      if (!assignment.courier) return;
      const assignment_id = assignment.assignment.id;
      const dsp_id = assignment.courier.id;

      return this.api.put(`/assignments/${assignment_id}/unassign-dsp`, {dsp_id, reason}).then((r) => {
        this.unAssigning = false;
        if (r.status == 412) {
          window.alert('Failed to unassign dsp: ' + r.data.message)
        }else{
          assignment.driver = null;
          let assignments = this.assignments.map(a => {
            if (a && a.id === assignment.assignment.id) {
              return Object.assign({}, a, {courier: null, courier_id: null});
            }
            return Object.assign({}, a);
          });
          this.assignments = assignments;
          return r;
        }
      })
    }

    @action
    activate(assignment, callback) {
        if (!assignment.driver_id) {
            return
        }
        return this.activateAssignment(assignment.id).then((r) => {
            if(r.ok) {
                assignment.is_active = true
                let assignments = this.assignments.map(a => {
                    if (a && a.id === assignment.id) {
                        return Object.assign({}, Object.assign(a, {is_active: true}));
                    }
                    return Object.assign({}, a);
                })
                this.assignments = assignments;
                callback(r);
                return r;
            } else {
                callback(r);
            }
        })
    }

    @action
    deactivate(assignment) {
        if (!assignment.driver_id) {
            return
        }
        return this.deactivateAssignment(assignment.id).then((r) => {
            assignment.is_active = false
            let assignments = this.assignments.map(a => {
                if (a && a.id === assignment.id) {
                    return Object.assign({}, Object.assign(a, {is_active: false}));
                }
                return Object.assign({}, a);
            })
            this.assignments = assignments
            return r
        })
    }

    @action
    addShipment(assignment, shipmentId, is_update_timewindow, cb) {
      this.addingShipment = true;
      this.api.post(`/assignments/${assignment.id}/add-shipment`, {shipment_id: shipmentId, is_update_timewindow})
        .then(response => {
          this.addingShipment = false;
          if (response.status == 200) {
            console.log('response is: ', response.data);
            this.loadAssignment(assignment.id);
            cb(response.data);
          } else if (response.status == 412) {
            window.alert('Failed to add shipment: ' + response.data.message)
          }
        });
    }

    @action
    resetBonusError() {
      this.bonusError = '';
    }

    @action
    getBonusConfig() {
      this.fetching = true;
      this.api.get(`/assignments/bonus/config`).then(res => {
        if (res.ok) {
          this.bonusConfig = res.data;
        } else {
          this.bonusConfig = {error: res.status};
        }
        this.fetching = false;
      });
    }

    @action
    updateBonus(assignmentId, bonus, reason, reason_code, cb) {
      this.updatingBonus = true;
      this.bonusError = '';
      this.api.post(`/assignments/${assignmentId}/bonus`, {bonus, reason, reason_code})
        .then(response => {
          if (!response.ok) {
            this.bonusError = response.data.errors ? response.data.errors.join(", ") : response.data.message;
          }

          if(cb) {
            cb(response)
          }
          this.updatingBonus = false;
        });
    }

    @action
    sendMessagePool(assignment, message, cb) {
      this.sendingMessagePool = true;
      this.api.post(`/assignments/${assignment.id}/announce`, { "is_available": true, "message": message})
        .then(response => {
          if(cb) {
            cb(response)
          }
          this.sendingMessagePool = false;
        });
    }

    @action
    async getDriverAssignmentStats() {
      if (this.pendingAssignments.length < 1 && this.completedAssignments.length < 1 &&
          this.inProgressAssignments.length < 1 && this.unassignedAssignments.length < 1 )
          return false;

      const headers = {
        'driver_id': 'Driver Id',
        'driver_name': 'Driver name',
        'courier': 'Courier',
        'assignment_count': '#Routes',
        'assignment_status': 'Status',
        'box_count': 'Box Count'
      };

      const courierIds = _.uniq(this.assignments.filter(a => !!a.courier_id).map(a => a.courier_id));
      let couriers = [];
      let data = [];

      await this.api.get(`/couriers/list/${courierIds.toString()}`).then(res => {
        if (res.ok) {
          couriers = res.data;
        }
        return couriers;
      }).then(couriers => {
        data = _.values(_.groupBy(
          this.assignments.filter(x => x.driver_id),
          x => x.driver_id
        )).map(as => {
          const courierId = as[0].courier_id;
          let courier = couriers.filter(c => c.id === courierId);
          if (courier.length > 0) {
            courier = courier.shift();
          } else {
            courier = {};
          }

          return {
            driver_id: as[0].driver_id,
            driver_name: as[0].driver.first_name + ' ' + as[0].driver.last_name,
            courier: courier.company || '',
            assignment_count: as.length,
            assignment_status: as.map(a => a.label + '[' + a.id + ']' + ' : ' + (a.status || 'PENDING')).join(' | '),
            box_count: _.sum(as.map(a => a.shipment_count))
          }
        });
      })

      return {
        headers,
        data
      }
    }

    @action
    getDriverIds() {
        var driverIds = this.assignments.filter(a => !!a.driver_id)
            .map(a => parseInt(a.driver_id));


        driverIds = _.uniq(driverIds).sort(function(a, b){
            return a - b;
        });

        return driverIds.join(",");
    }

    @observable deletingAssignment;
    @action
    softDeleteAssignment(assignmentId, reason, cb, error) {
      this.deletingAssignment = true;
      this.api.delete(`/assignments/${assignmentId}`, { "reason": reason})
        .then(response => {
            console.log('response is: ', response);
            if (response.status === 200) {
                this.assignments = this.assignments.filter(a => a.id !== assignmentId);
                this.refreshAssignmentList_();
                this.selectAssignment(null);
                if(cb) {
                    cb(response)
                }
            } else {
                error(response);
            }

            this.deletingAssignment = false;
        });
    }

    @observable movingAssignment;
    @action
    moveAssignmentDate(assignmentId, data, cb, error) {
      this.movingAssignment = true;
      this.api.post(`/assignments/${assignmentId}/move_next_day`, data)
        .then(response => {
            console.log('response is: ', response);
            if (response.status === 204) {
                this.assignments = this.assignments.filter(a => a.id !== assignmentId);
                this.refreshAssignmentList_();
                this.loadAssignment(assignmentId)
                // this.selectAssignment(null);
                if(cb) {
                    cb(response)
                }
            } else {
                error(response);
            }

            this.movingAssignment = false;
        });
    }

    @action
    getEstimatedCostSMSmoveDate(assignmentId, data) {
      return this.api.post(`/assignments/${assignmentId}/move_next_day/estimated_sms`, data);
    }
    // @observable restoringAssignment;
    // @action
    // restoreAssignment(assignmentId, reason, cb) {
    //   this.restoringAssignment = true;
    //   this.api.patch(`/assignments/${assignmentId}/restore`, { "reason": reason})
    //     .then(response => {
    //         if(cb) {
    //             cb(response)
    //         }
    //         this.restoringAssignment = false;
    //     });
    // }

    @action
    listAssignments(query = {}, cb) {
      this.loadingAssignments = true;
      const searchFilter = {
        ...this.searchFilter,
        ...query
      };

      const assignments = this.api.get('/assignments', searchFilter)
        .then(res => {
          this.loadingAssignments = false;
          if(res.status === 200 || res.ok) {
            this.assignments = this.processAssignments(res.data);
          }

          if(cb) cb(res);

          return this.assignments;
        }).catch((e) => {
        this.loadingAssignments = false;
      })

      return assignments;
    }

    getWarehouses(assignmentId) {
      return this.api.get(`/assignments/${assignmentId}/pickup/allow-warehouses`).then(res => {
        if(res.ok) {
          this.pickupWarehouses = res.data;
        }
        return res;
      });
    }

    updateWarehouse(assignmentId, warehouseId) {
      return this.api.post(`/assignments/${assignmentId}/pickup`, {to_warehouse_id: warehouseId}).then(resp => {
        if (resp.ok) {
          this.loadAssignment(assignmentId);
        }

        return resp;
      });
    }

    updateAddressPickup(assignmentId, refreshPricing, data) {
      if(!assignmentId || !data) return;

      return this.api.put(`/assignments/${assignmentId}/pickup-address`, data, {params: {
        refreshPricing
      }}).then(resp => {
        if (resp.ok) {
          this.loadAssignment(assignmentId);
        }
        return resp
      });
    }

    getEngageTimeByAssigment(id) {
      if(!id) return Promise.resolve(null);

      return this.api.get(`/assignments/${id}/engagement-time`);
    }

    /**
     * update risk infos when there is a new message from the websocket
     */
    accumulativeRiskyInfo = {
      lateIds: [],
      returnIds: [],
      inactiveIds: [],
    }

    decreaseRiskyInfo = []

    // update from websocket
    updateRiskyAssignment(infos) {
      // const pullOut = infos['pull_out'] ? infos.pull_out: false
      const inactiveIds = infos["inactive_ids"] ? infos["inactive_ids"]: []
      const returnIds = infos["return_ids"] ? infos["return_ids"]: []
      const lateIds = infos["late_ids"] ? infos["late_ids"]: []
      const removedIds = infos["removed_ids"] ? infos["removed_ids"]: []

      this.decreaseRiskyInfo = removedIds
      this.accumulativeRiskyInfo = {
        inactiveIds: Array.from(new Set([...this.accumulativeRiskyInfo.inactiveIds, ...inactiveIds])),
        returnIds: Array.from(new Set([...this.accumulativeRiskyInfo.returnIds, ...returnIds])),
        lateIds: Array.from(new Set([...this.accumulativeRiskyInfo.lateIds, ...lateIds])),
        // createdTs: infos["created_at"] ? infos["created_at"] : this.accumulativeRiskyInfo.createdTs
      }

      this.applyRiskInfoChange()
    }

    applyRiskInfoChange() {
      const ts = Date.now()
      if (ts - this.riskObj.createdTs < 10000) {
        // too often
        return
      }

      if (this.accumulativeRiskyInfo.lateIds.length < 1 && this.accumulativeRiskyInfo.inactiveIds.length < 1
          && this.accumulativeRiskyInfo.returnIds.length < 1 && this.decreaseRiskyInfo.length < 1
      ) {
        return
      }
      const currentRiskIds = this.riskyAssignments.map(a => a.id)
      const increaseRiskIds = [...this.accumulativeRiskyInfo.inactiveIds, ...this.accumulativeRiskyInfo.returnIds, ...this.accumulativeRiskyInfo.lateIds].filter(id => !currentRiskIds.includes(id))
      const decreaseRiskIds = _.uniq(this.decreaseRiskyInfo);

      const inactiveIds = Array.from(
        new Set([...this.riskObj["inactiveIds"], ...this.accumulativeRiskyInfo.inactiveIds])
      ).filter(id => !decreaseRiskIds.includes(id))
        .filter(id => !this.accumulativeRiskyInfo.returnIds.includes(id) && !this.accumulativeRiskyInfo.lateIds.includes(id));

      const returnIds = Array.from(
        new Set([...this.riskObj["returnIds"], ...this.accumulativeRiskyInfo.returnIds])
      ).filter(id => !decreaseRiskIds.includes(id))
        .filter(id => !this.accumulativeRiskyInfo.inactiveIds.includes(id) && !this.accumulativeRiskyInfo.lateIds.includes(id));

      const lateIds = Array.from(
        new Set([...this.riskObj["lateIds"], ...this.accumulativeRiskyInfo.lateIds])
      ).filter(id => !decreaseRiskIds.includes(id))
        .filter(id => !this.accumulativeRiskyInfo.returnIds.includes(id) && !this.accumulativeRiskyInfo.inactiveIds.includes(id));

      this.riskObj = {inactiveIds, returnIds, lateIds, "createdTs": ts}
      this.decreaseRiskyInfo = []
      this.accumulativeRiskyInfo = {
        lateIds: [],
        returnIds: [],
        inactiveIds: [],
      }

      // add and remove risky ids from riskyAssignments
      const newRiskAssignments = this.assignments.filter(a => increaseRiskIds.includes(a.id))
      if (newRiskAssignments.length < 1 && decreaseRiskIds.length < 1) return
      this.riskyAssignments = [...this.riskyAssignments, ...newRiskAssignments]
      this.riskyAssignments = this.riskyAssignments.filter(a => !decreaseRiskIds.includes(a.id))

      console.log('Refresh risky assignments', new Date())
      this.refreshAssignmentList_()
    }

    isAtRisk(id) {
      if (this.accumulativeRiskyInfo.inactiveIds.includes(id)) return true
      if (this.accumulativeRiskyInfo.returnIds.includes(id)) return true
      if (this.accumulativeRiskyInfo.lateIds.includes(id)) return true

      if (this.riskObj.inactiveIds.includes(id)) return true
      if (this.riskObj.returnIds.includes(id)) return true
      if (this.riskObj.lateIds.includes(id)) return true

      return false;
    }

    removeRisk(assignment) {
      if (!this.isAtRisk(assignment.id)) return;
      this.riskObj = {
        "inactiveIds": this.riskObj["inactiveIds"].removeByVal(assignment.id),
        "returnIds": this.riskObj["returnIds"].removeByVal(assignment.id),
        "lateIds": this.riskObj["lateIds"].removeByVal(assignment.id),
        "createdTs": this.riskObj["createdTs"]
      }
      this.accumulativeRiskyInfo = {
        inactiveIds: this.accumulativeRiskyInfo.inactiveIds.removeByVal(assignment.id),
        returnIds: this.accumulativeRiskyInfo.returnIds.removeByVal(assignment.id),
        lateIds: this.accumulativeRiskyInfo.lateIds.removeByVal(assignment.id),
        createdTs: this.accumulativeRiskyInfo.createdTs
      }

      const affected = this.riskyAssignments.filter(a => a.id === assignment.id)
      if (affected.length < 1) return;
      this.riskyAssignments = this.riskyAssignments.filter(a => a.id != assignment.id)
    }

    removeRiskyAssignment(id) {
      return this.api.delete(`/assignments/${id}/risky`, {date:this.date}).then(resp => {
        if (resp.status === 200) {
          this.riskObj['inactiveIds'] = this.riskObj['inactiveIds'].removeByVal(id)
          this.riskObj['returnIds'] = this.riskObj['returnIds'].removeByVal(id)
          this.riskObj['lateIds'] = this.riskObj['lateIds'].removeByVal(id)

          this.accumulativeRiskyInfo = {
            inactiveIds: this.accumulativeRiskyInfo.inactiveIds.removeByVal(id),
            returnIds: this.accumulativeRiskyInfo.returnIds.removeByVal(id),
            lateIds: this.accumulativeRiskyInfo.lateIds.removeByVal(id),
            createdTs: this.accumulativeRiskyInfo.createdTs
          }
          this.refreshAssignmentList_()
          return true
        }
        return false
      });
    }

    createRiskObj(inactiveIds=[], returnIds=[], lateIds=[], createdTs=null) {
      return {inactiveIds, returnIds, lateIds, createdTs}
    }
    addReturnStop(assignmentId) {
      return this.api.put(`/assignments/${assignmentId}/add-return-stop`);
    }
  
  @action
  getReasonCodes() {
    if(this.reasonCodes && this.reasonCodes.length > 0) return;

    this.api.get(`/assignments/remove-shipment-reasons`).then(res => {
      if(res.ok) {
        this.reasonCodes = res.data;
      }
      else {
        this.reasonCodes = [];
      }
    })
  }
}

export default AssignmentStore;
