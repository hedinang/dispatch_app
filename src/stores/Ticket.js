import { observable, action } from 'mobx';
import moment from 'moment-timezone';
import _ from 'lodash'

class TicketStore {
  @observable activeTicket = null;
  @observable loadingTicket = false;
  @observable activeDriver = null;
  @observable activeAssignment = null;
  @observable activeDelivery = null;
  @observable otherTickets = [];
  @observable otherAssignments = [];

  constructor(logger, api, locationStore) {
    this.logger = logger;
    this.api = api;
    this.locationStore = locationStore;
  }

  @action
  unselect() {
    this.activeDriver = null;
    this.activeTicket = null;
    this.activeAssignment = null;
    this.otherTickets = [];
    this.otherAssignments = [];
    this.activeDelivery = null
  }

  @action
  loadTicket(v) {
    this.loadingTicket = true;
    this.activeDriver = null;
    this.activeTicket = null;
    this.activeAssignment = null;
    this.otherTickets = [];
    this.otherAssignments = [];
    this.activeDelivery = null
    this.api.get(`/tickets/TK_${v}`).then((r) => {
      this.activeTicket = r.data
      this.loadingTicket = false
      if (!this.activeTicket) return
      if (this.activeTicket.holder) {
        const driverId = this.activeTicket.holder.split('_')[1]
        this.locationStore.setDriver(driverId)
          this.api.get(`/drivers/${driverId}`).then((r) => {
            if (r.status == 200) {
              this.activeDriver = this.processDriver(r.data)
            }
          });
          this.api.get(`/assignments/drivers/${driverId}?status[]=PENDING&status[]=null&status[]=IN_PROGRESS&status[]=&active=false`).then((r) => {
            if (r.status === 200)
              this.otherAssignments = r.data.items
            else
              this.otherAssignments = []
          });      
          this.api.get(`/assignments/drivers/${driverId}?status[]=ACTIVE&status[]=IN_PROGRESS&active=true`).then((r) => {
            if (r.status === 200) {
              try {
                if (r.data.items && r.data.items.length > 0) {
                  this.api.get(`/assignments/${r.data.items[0].assignment.id}/detail`).then((r2) => {
                    this.activeDelivery = r2.data
                  })
                }
              } catch (e) {}
            } else
              this.activeDelivery = null
          });      
        } else {
        this.locationStore.setDriver(null)
      }
      if (this.activeTicket.item) {
        const assignmentId = this.activeTicket.item.split('_')[1]
        this.api.get(`/assignments/${assignmentId}/detail`).then((r) => {
          if (r.status == 200)
            this.activeAssignment = this.processAssignmentDetail(r.data)
        });
      }
    })
    this.api.get(`/tickets/TK_${v}/related`).then((r) => {
      if (r.status === 200)
        this.otherTickets = r.data.filter(t => t.id !== v)
      else
        this.otherTickets = []
    });
  }

  processAssignmentDetail(assignmentDetail) {
    var shipmentMap = {}
    var shipmentLabelMap = {}
    var clientMap = {};
    const stopMap = {};
    assignmentDetail.shipments.forEach(s => {
        shipmentMap[s.id] = s;
    });
    assignmentDetail.shipmentLabels.forEach(s => {
        shipmentLabelMap[s.shipment_id] = s;
    });
    assignmentDetail.clients.forEach(s => {
        clientMap[s.id] = s;
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

        if (stop.shipment)
            stop.client = clientMap[stop.shipment.client_id];
    })
    // No need to do this, we processed it in BE
    /*assignmentDetail.completable = assignmentDetail.assignment && assignmentDetail.assignment.driver_id && 
    assignmentDetail.assignment.status !== 'COMPLETED' && _.every(assignmentDetail.stops   
        .filter(s => !s._deleted)         
        .filter(s => ['PICK_UP', 'DROP_OFF'].indexOf(s.type) >= 0).map(s => ['FAILED', 'SUCCEEDED', 'DISCARDED'].indexOf(s.status) >= 0))*/
    assignmentDetail.isCompleted = assignmentDetail.assignment && assignmentDetail.assignment.status === 'COMPLETED'

    assignmentDetail.locations = []
    return assignmentDetail;
  }

  @action assignTicket(codes) {
    return this.api.post(`/tickets/TK_${this.activeTicket.id}/assign/${this.activeTicket.holder}`, {codes: codes}).then((r) => {
      if (r.status === 200) {
        this.activeTicket.item = r.data
        this.activeTicket.status = 'CLAIMED'
        return r.data
      } else {
        alert(r.data.message)
        return null
      }
    }).catch((e) => {
      alert(e);
      return null
    });
  }

  processDriver(data) {
    if (data.vehicles) {
      let carMap = {}
      if (data.cars) {
        data.cars.forEach(c => {
          carMap[c.id] = c
        });
      }
      data.vehicles = data.vehicles.map(v => {
        v.car = carMap[v.car_id]
        return v
      }).filter(v => v.car)
    }
    return data;
  }

  @action unassignTicket(reason) {
    if (!reason) return;
    return this.api.post(`/tickets/TK_${this.activeTicket.id}/unassign/${this.activeTicket.holder}`, reason).then((r) => {
      if (r.status >= 200 && r.status < 300) {
        this.activeTicket = Object.assign(this.activeTicket, {item: null, status: 'CREATED'});
        return r.data;
      } else {
        alert(r.data.message)
        return null;
      }
    }).catch((e) => {
      alert(e);
      return null;
    });
  }

  availablePickupTimes(tz, session) {
    const target_date = session.target_date

    tz = session.timezone || tz

    if (tz === undefined) {
      tz = 'America/Los_Angeles'
    }
        
    var half_hour = moment(target_date).tz(tz).startOf('day').add(4, 'hour').unix() * 1000
    var limit = moment(target_date).tz(tz).startOf('day').add(18, 'hour').unix() * 1000

    let ranges = []
    while (half_hour <= limit) {
      half_hour += 1800000
      var next = half_hour + 1800000

      if (moment(next).tz(tz).isAfter(moment().tz(tz))) {
        var slot = {
          start: half_hour,
          end: next,
          name: moment(half_hour).tz(tz).format('hh:mmA') + ' - ' + moment(next).tz(tz).format('hh:mmA')
        }
        ranges.push(slot)

      }
    }

    return ranges
  }

  @action voidTicket(id, reason, reason_code, benefit) {
    if (!id || !reason) return;
    return this.api.post(`/tickets/TK_${id}/void`, {reason, reason_code, benefit}).then((r) => {
      if (this.activeTicket && this.activeTicket.id === id) {
        this.activeTicket.status = 'VOIDED'
        this.activeTicket.holder = null
        this.activeDriver = null
      }
    });
  }

  @action discardTicket(id, session, reason, reason_code, benefit) {
    if (!id || !session) return;
    return this.api.post(`/tickets/TK_${id}/discard?session=${session}&force=true`, {reason, reason_code, benefit}).then((r) => {
      if (this.activeTicket && this.activeTicket.id === id) {
        this.unselect()
      }
    });
  }

  @action setPickupTime(id, start, end) {
    return this.api.post(`/tickets/TK_${id}/eta`, [start, end]).then((r) => {
      if (r.status === 200 || r.status === 204) {
      if (this.activeTicket && this.activeTicket.id === id) {
        this.activeTicket.valid_from = start
        this.activeTicket.valid_to = end
      }}
    });
  }

  @action
  assignDriver(id, driverId, session, reason, reason_code, benefit) {
    this.loading = true
    const reassign = this.activeTicket && this.activeTicket.holder && this.activeTicket.holder !== `DR_${driverId}`
    if (!session.startsWith('BS_')) session = 'BS_' + session;
    if (reassign) {
      return this.api.put(`/tickets/TK_${id}/reassign/DR_${driverId}?session=${session}`, {reason, reason_code, benefit}).then((r) => {
        this.loading = false
        if (this.activeTicket && this.activeTicket.id === id) {
          this.loadTicket(id)
        }
      })
    }
    return this.api.put(`/tickets/TK_${id}/assign/DR_${driverId}?session=${session}`, {reason}).then((r) => {
      this.loading = false
      if (this.activeTicket && this.activeTicket.id === id) {
        this.loadTicket(id)
      }
    })
  }

  @action
  claimRoute(id, assignmentId, reason) {
    this.loading = true
    return this.api.post(`/tickets/TK_${id}/force-assign`, {item: 'AS_' + assignmentId, reason}).then((r) => {
      this.loading = false
      if (this.activeTicket && this.activeTicket.id === id) {
        this.loadTicket(id)
      }
      return r;
    })
  }

  @action
  getOpenTicketsByHolder(uid) {
    return this.api.get(`/tickets/open/${uid}`);
  }

  @action
  getCurrentReserve(id) {
    return this.api.get(`/assignment-reserves/current-reserve/TK_${id}`).then(r => {
      return r;
    })
  }
}

export default TicketStore