import { observable, action, computed } from 'mobx';
import moment from 'moment';
import _ from 'lodash';

class DriverScheduleStore {
    constructor(api) {
        this.api = api;
    }

    @observable activeSchedule = null
    @observable schedules = []
    @observable activeAssignments = []
    @observable loadingSchedule = false
    @observable loadingSchedules = false
    @observable driver = null
    @observable booking = false
    @observable errors = {}
    tokens = {}

    @computed
    get openAssignments() {
        return this.activeAssignments.filter(a => !a.driver_id)
    }

    @computed
    get closeAssignments() {
        return this.activeAssignments.filter(a => a.driver_id)
    }

    @action
    sendMessage(sid, is_promotional, media_type, email_subject, cb) {
      return this.api.post(`/driver-schedules/${sid}/messages`, null, {
        params: {
          is_promotional,
          media_type,
          email_subject,
        }
      }).then((response) => {
        if(cb) cb(response);
      })
    }

    @action
    getEstimatedSMS(sid, is_promotional, cb) {
      return this.api.post(`/driver-schedules/${sid}/messages/estimated_cost`, null, {
        params: {
          is_promotional
        }
      }).then((response) => {
          if(cb) cb(response);
      })
    }

    @action
    getEstimatedSMSAnnouncement(id, announcement, whole_driver_pool, is_promotional) {
      return this.api.post(`/driver-schedules/${id}/announce/estimated_cost`, {text: announcement, assigned_driver: !whole_driver_pool}, {
          params: {
            is_promotional
          }
        });
    }

    @action
    loadSchedule(sid, cb) {
        this.loadingSchedule = true
        return this.api.get(`/driver-schedules/${sid}`)
            .then((response) => {
                this.loadingSchedule = false
                if(cb) cb(response);
                if (response.status === 200) {
                    this.activeSchedule = response.data;
                    if (response.data && response.data.driver_crew_id) {
                      this.api.get(`/driver-crews/${response.data.driver_crew_id}/schedule_id/${sid}`).then(resp => {
                        if (resp.status == 200) {
                          this.activeSchedule.driverCrew = resp.data;
                          //
                        }
                      })
                    }

                    if (response.data && response.data.solution_id) {
                      this.api.get(`/solutions/${response.data.solution_id}`).then(resp => {
                        if (resp.status == 200) {
                          this.activeSchedule.solution = resp.data;
                        }
                      })
                    }

                    return {error: false}
                }
                if (response.status === 401) {
                    return {error: true, message: "You don't have permission to load schedule. Please double check the link!"}
                }
                if (response.status === 403) {
                    return {error: true, message: "You are not allowed to load schedule!"}
                }
                return {error: true, message: 'Error while loading Schedule!'}
            })
    }

    @action
    saveSchedule(schedule) {
        return this.api.put(`/driver-schedules/${schedule.id}`, schedule)
    }

    @action
    insertSchedule(schedule) {
        return this.api.post(`/driver-schedules`, schedule).then((response) => {
            console.log(response)
            return response.data
        })
    }

    @action
    loadSchedules() {
        this.loadingSchedules = true
        let start = moment().startOf('d').unix() * 1000
        let end = start + 72 * 3600 * 1000;
        return this.api.get(`/driver-schedules?start=${start}&end=${end}`)
            .then((response) => {
                this.loadingSchedules = false
                this.schedules = _.reverse(_.sortBy(response.data.filter(s => s.type === 'assignment'), [x => x.target_date]))
            })
    }

    @action
    addDriver(scheduleId, driverId, cb) {
        this.api.post(`/driver-schedules/${scheduleId}/drivers`, driverId)
            .then((response) => {
                this.activeSchedule.drivers.push(response.data);
                console.log('callback is: ', cb);
                if (cb) {
                  console.log('came here to callback')
                  cb(response.data);
                }
            })
    }

    @action
    removeDriver(scheduleId, driver, cb) {
        this.api.delete(`/driver-schedules/${scheduleId}/drivers/${driver.id}`)
            .then((response) => {
                let idx = this.activeSchedule.target_drivers.indexOf(driver.id)
                this.activeSchedule.target_drivers.splice(idx, 1);
                if (!this.activeSchedule.target_drivers || this.activeSchedule.target_drivers.length < 1) {
                  this.activeSchedule.driverCrew = null;
                }
                if (cb) {
                  cb(response.data);
                }
            })
    }

    @action useCrew(scheduleId, screwId, cb) {
      this.api.post(`/driver-schedules/${scheduleId}/driver-crews/${screwId}`)
        .then((response) => {
          this.activeSchedule.driverCrew = response.data.driver_crew;

          if (cb) {
            cb(response.data.drivers);
          }
        })
    }

    @action usePool(scheduleId, poolId, region, cb) {
      this.api.post(`/driver-schedules/${scheduleId}/driver-pools/${poolId}/regions/${region}`)
        .then((response) => {
          // @TODO: update to show up pools
          // this.activeSchedule.driverPool = response.data.pool;

          if (cb) {
            cb(response.data.drivers);
          }
        })
    }

  @action addDrivers(scheduleId, ids, cb) {
    this.api.patch(`/driver-schedules/${scheduleId}/drivers`, {ids})
      .then((response) => {
        if (cb) {
          cb(response.data);
        }
      })
  }

  @action removeDrivers(scheduleId, cb) {
    this.api.delete(`/driver-schedules/${scheduleId}/drivers`)
      .then((response) => {
        this.activeSchedule.driverCrew = null;
        this.activeSchedule.drivers = [];
        if (cb) {
          cb(response.data);
        }
      })
  }

    @action
    addAssignment(scheduleId, assignmentId, cb) {
        this.api.post(`/driver-schedules/${scheduleId}/assignments`, assignmentId)
            .then((response) => {
              if(cb) {
                cb(response.data);
              }
            })
    }

    @action
    removeAssignment(scheduleId, assignment, cb) {
        this.api.delete(`/driver-schedules/${scheduleId}/assignments/${assignment.id}`)
            .then((response) => {
                let idx = this.activeSchedule.target_assignments.indexOf(assignment.id)
                this.activeSchedule.target_assignments.splice(idx, 1);
                if (!this.activeSchedule.target_assignments || this.activeSchedule.target_assignments.length < 1) {
                  this.activeSchedule.solution = null;
                }
                if(cb) {
                  cb(response.data);
                }
            })
    }

  @action
  removeAssignments(scheduleId, cb) {
    this.api.delete(`/driver-schedules/${scheduleId}/assignments`)
      .then((response) => {
        this.activeSchedule.target_assignments = [];
        this.activeSchedule.solution = null;
        if(cb) {
          cb(response.data);
        }
      })
  }

    @action
    updateSchedule(schedule, cb) {
        return this.api.patch(`/driver-schedules/${schedule.id}`, schedule).then((response) => {
            this.activeSchedule = Object.assign(this.activeSchedule, response.data)
            if(cb) cb(response)
        })
    }

    @action
    addSolution(scheduleId, solutionId, cb) {
      this.api.post(`/driver-schedules/${scheduleId}/solutions`, solutionId)
        .then((response) => {
          if (!_.get(response, 'data')) return;

          this.activeSchedule.solution = _.get(response, 'data.solution');
          if (typeof cb === 'function') cb(_.get(response, 'data.assignments'));
        })
    }

    @action
    addAssignments(scheduleId, ids, cb) {
      this.api.post(`/driver-schedules/${scheduleId}/assignments/all`, {ids})
        .then((response) => {
          this.activeSchedule.solution = response.data.solution;
          if(cb) {
            cb(response.data.assignments);
          }
        })
    }

    @action
    updateDriverReservation(scheduleId, reservation) {
        return this.api.put(`/driver-schedules/${scheduleId}/drivers/${reservation.id}/reserved`, reservation)
    }

    @action
    sendAnnouncement(id, announcement, whole_driver_pool, is_promotional, media_type, email_subject, message_html) {
      if (!message_html) {
        message_html = null;
      }

      return this.api.post(
        `/driver-schedules/${id}/announce`,
        {text: announcement, assigned_driver: !whole_driver_pool, media_type, email_subject, message_html},
        {params: {is_promotional}
      })
    }
}

export default DriverScheduleStore;
