import React, { Component, Fragment } from 'react';

import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@material-ui/core';
import { History as HistoryIcon } from '@material-ui/icons';
import { AlxFlatDateInput, AxlButton, AxlCheckbox, AxlInput, AxlModal, AxlTextArea, Styles } from 'axl-reactjs-ui';
import _, { isEmpty, sortBy } from 'lodash';
import { Observer, inject, observer } from 'mobx-react';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import Moment from 'react-moment';
import { Link, Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';

import { AssignmentListComponent } from '../../components/AssignmentList';
import DialogSMSCost from '../../components/DialogSMSCost';
import { DriverCrewListComponent } from '../../components/DriverCrewList/index';
import { DriverListComponent } from '../../components/DriverList';
import { DriverPoolListComponent } from '../../components/DriverPoolList/index';
import { DriverSuspensionListComponent } from '../../components/DriverSuspensionList';
import DriverSearch from '../DriverSearch/index';
import ProbationList from './ProbationList';
import ScheduleHistory from './ScheduleHistory';
import SearchDriver from './searchDriver';
import SolutionList from './solutions';

import styles from './styles';

import { toHoursAndMinutes } from '../../Utils/calendar';
import AxlSelect from '../../components/AxlSelect';
import TooltipContainer from '../../components/TooltipContainer';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import driverSuspensionType from '../../constants/driverSuspensionType';
import { getAppFeatures, getDriverScheduleSettings } from '../../stores/api';
import AxlAutocomplete from '../../components/AxlAutocomplete';
import { toastMessage } from '../../constants/toastMessage';
import PreviewAnnouncement from './previewAnnouncement';
import PreviewHTMLAnnouncement from './previewHTMLAnnouncement';

const regexes = [
  {
    regex: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    tag: 'script',
  },
  {
    regex: /<video[\s\S]*?>[\s\S]*?<\/video>/gi,
    tag: 'video',
  },
  {
    regex: /<ruby[\s\S]*?>[\s\S]*?<\/ruby>/gi,
    tag: 'ruby',
  },
  {
    regex: /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    tag: 'iframe',
  },
]
const NOTIFY_TYPE = {
  SMS: "sms",
  EMAIL: "email",
  PUSH: "push_notification"
};

@inject(
  'assignmentStore', 'driverListStore', 'scheduleStore', 'solutionListStore', 'regionStore',
  'driverCrewListStore', 'driverPoolListStore', 'assignmentListStore', 'driverSuspensionStore', 'permissionStore'
)
@observer
class ScheduleDetail extends Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.addDriver = this.addDriver.bind(this);
    this.addAssignment = this.addAssignment.bind(this);
    this.onAssignDriver = this.onAssignDriver.bind(this);
    this.onOpenEdit = this.onOpenEdit.bind(this);
    this.onSaveEdit = this.onSaveEdit.bind(this);
    this.updateField = this.updateField.bind(this);
    this.addSolution = this.addSolution.bind(this);
    this.saveDriverReservation = this.saveDriverReservation.bind(this);
    this.onOpenSendAnnouncement = this.onOpenSendAnnouncement.bind(this);
    this.sendAnnouncement = this.sendAnnouncement.bind(this);
    this.openLink = this.openLink.bind(this);
    this.state = {
      showDriverSearch: false,
      showEditForm: false,
      showEditDriverForm: false,
      showAnnouncementBox: false,
      reservation: {},
      schedule: {},
      whole_driver_pool: true,
      isPromotional: true,
      isConfirmSendMessage: false,
      openScheduleHistory: false,
      assignmentId: '',
      notificationType: '',
      directBookingPushNoti: false,
      directBookingHtmlSupported: false,
      channelsPromotional: [],
      channelsServiceRelated: [],
      isSending: false,
      emailSubject: null,
      originEmailSubject: null,
      isUpdating: false,
      isPreviewAnnouncement: false,
      isExistHtmlInvalid: false,
      tagInvalid: '',
      announcement: '',
      htmlAnnouncement: undefined,
      isPreviewHTMLAnnouncement: false,
      isExistHtml: false,
    };
  }

  componentDidMount() {
    const { scheduleStore, regionStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;

    if (regionStore.regions && regionStore.regions.length < 1) {
      regionStore.init();
    }

    scheduleStore.loadSchedule(id, res => {
      if (res.ok) {
        this.setState({
          emailSubject: res.data && res.data.name,
          originEmailSubject: res.data && res.data.name,
          schedule: {
            ...this.state.schedule,
            region: {
              value: res.data.region,
            }
          }
        });
        this.getFeatures([`RG_${res.data.region}`])
        return;
      }
      this.setState({ 
        emailSubject: null,
        originEmailSubject: null
      });
    });

    getDriverScheduleSettings().then(res => {
      if(res.ok && res.data) {
        const { channels } = res.data;
        const filterByPromotional = _.filter(channels, (item) => item.promotional);
        this.setState({
          channelsPromotional: _.map(filterByPromotional, (item) => ({
            label: item.display_name,
            value: item.key
          })),
          channelsServiceRelated: _.map(channels, (item) => ({
            label: item.display_name,
            value: item.key
          })),
          notificationType: filterByPromotional && filterByPromotional.length > 0 && filterByPromotional[0].key,
        })
      }
      else {
        this.setState({
          directBookingPushNoti: false,
          channelsPromotional: [],
          channelsServiceRelated: []
        })
      }
    })
  }

  updateAnnouncementTarget = (e) => {
    const value = e.target.value;
    let v = true;
    if (value && typeof value === 'string') {
      if (value.toLowerCase() === 'true') v = true;
      if (value.toLowerCase() === 'false') v = false;
    } else {
      v = e.target.value;
    }

    this.setState({ whole_driver_pool: v });
  };

  async sendAnnouncement() {
    const { scheduleStore, match, history } = this.props;
    const { params, url } = match;
    const { id } = params;
    const { notificationType, channelsPromotional, announcement, whole_driver_pool, isPromotional, channelsServiceRelated, emailSubject, originEmailSubject, htmlAnnouncement } = this.state;
    const { activeSchedule } = scheduleStore;
    const isUseAPIPromotional = activeSchedule && activeSchedule.enable_push_notification && ((channelsPromotional && channelsPromotional.length > 0) || (channelsServiceRelated && channelsServiceRelated.length > 0));
    const isEmailType = notificationType === NOTIFY_TYPE.EMAIL;
    if(isUseAPIPromotional && !notificationType) {
      toast.error('Notification Message type is required', {containerId: 'main'});
      return;
    }

    if((!announcement && [NOTIFY_TYPE.SMS, NOTIFY_TYPE.PUSH].includes(notificationType))
      || (!htmlAnnouncement && [NOTIFY_TYPE.EMAIL].includes(notificationType))
    ) {
      toast.error('Notification Message is required', {containerId: 'main'});
      return;
    }

    const isContainHTML = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/gi;
    if(announcement && isContainHTML.test(announcement)) {
      toast.error('Notification Message cannot contain HTML tags', {containerId: 'main'});
      return;
    }

    if(isEmailType && !emailSubject) {
      toast.error('Subject is required', {containerId: 'main'});
      return;
    }

    const invalid = await this.handleCheckTagHtml();
    if(invalid) return;

    this.setState({ isSending: true });
    scheduleStore.sendAnnouncement(
      id,
      [NOTIFY_TYPE.EMAIL].includes(notificationType) ? htmlAnnouncement : announcement,
      whole_driver_pool,
      isPromotional,
      isUseAPIPromotional ? notificationType : null,
      isEmailType ? emailSubject : null,
      [NOTIFY_TYPE.EMAIL].includes(notificationType) ? null : htmlAnnouncement
    ).then((r) => {
      if (r.ok) {
        toast.success('Send announcement successfully!', {containerId: 'main'});
        const type = channelsPromotional && channelsPromotional.length > 0 && channelsPromotional[0].value && channelsPromotional[0].value.toLowerCase();
        this.setState({
          isPromotional: true,
          announcement: '',
          notificationType: type,
          emailSubject: originEmailSubject,
          htmlAnnouncement: null,
        });
        history.push(url);
      } else {
        toast.error(r && r.data && r.data.message || 'there was an issue sending message', {containerId: 'main'});
      }
    }).catch((r) => {
      toast.error('issue', {containerId: 'main'});
    })
    .finally(() => this.setState({ isSending: false }));
  }

  getEstimatedSMSAnnouncement() {
    const { scheduleStore, match, history } = this.props;
    const { params, url } = match;
    const { id } = params;
    scheduleStore
      .getEstimatedSMSAnnouncement(id, this.state.announcement, this.state.whole_driver_pool, this.state.isPromotional)
      .then((res) => {
        if (res.ok) {
          this.setState({ SMSCost: res.data });
        }
      })
      .catch((res) => {
        window.alert('issue when get estimated cost');
      });
  }


  updateField(name) {
    return (event) => {
      let schedule = {};
      if (event.target && event.target.type.toLowerCase() === 'checkbox') {
        schedule[name] = event.target.checked;
      } else {
        schedule[name] = event.target.value;
      }
      this.setState({ schedule: Object.assign(this.state.schedule, schedule) });
    };
  }

  updateDate = (name, isTimestamp) => (dates) => {
    let schedule = {};
    if (!dates || dates.length < 1) {
      schedule[name] = null;
    } else {
      const date = dates[0];
      if (!isTimestamp) {
        schedule[name] = date;
      } else {
        schedule[name] = date.getTime();
      }
    }

    this.setState({ schedule: Object.assign(this.state.schedule, schedule) });
  };

  onOpenEdit() {
    const { scheduleStore, regionStore } = this.props;
    const { activeSchedule } = scheduleStore;
    
    this.setState({
      schedule: Object.assign({}, {
        ...activeSchedule,
        region: regionStore.regions && regionStore.regions.find(region => region.value === activeSchedule.region) || {},
      }),
      showEditForm: true
    });
  }

  onOpenSendAnnouncement() {
    const { history, match } = this.props;
    const { url, path } = match;
    history.push(url + '/announce');
  }

  openLink(url) {
    const { channelsPromotional, originEmailSubject } = this.state;
    const { history } = this.props;
    const type = channelsPromotional && channelsPromotional.length > 0 && channelsPromotional[0].value && channelsPromotional[0].value.toLowerCase();
    this.setState({ 
      isPromotional: true,
      notificationType: type,
      emailSubject: originEmailSubject,
      announcement: '',
      htmlAnnouncement: null,
    });
    history.push(url);
  }

  onSaveEdit() {
    const { scheduleStore } = this.props;
    const { schedule } = this.state;
    const payload = {
      ...schedule,
      region: schedule && schedule.region && schedule.region.value,
    }

    this.setState({isUpdating: true});
    scheduleStore.updateSchedule(payload, res => {
      this.setState({isUpdating: false});
      if (!res.ok) {
        toast.error(res && res.data && res.data.message || toastMessage.ERROR_UPDATING, {containerId: 'main'});
        return;
      }

      toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
      this.setState({ showEditForm: false });
    });
  }

  onAssignDriver(d) {
    const { scheduleStore, driverSuspensionStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;

    console.log('came here', d);
    scheduleStore.addDriver(id, d.id, () => {
      console.log('yes called back');
    });
    this.setState({ showDriverSearch: false });
  }

  addDriver() {
    if (!this.state.driverId) return;
    const { scheduleStore, driverSuspensionStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.addDriver(id, this.state.driverId, () => {
      console.log('yes came here');
    });
    this.setState({ driverId: null });
  }

  removeDriver = (driver) => (e) => {
    const { scheduleStore, driverListStore, driverSuspensionStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.removeDriver(id, driver, () => {
      driverListStore.schedule.directRemoveItem(driver);
    });
  };

  removeDrivers = (e) => {
    const { scheduleStore, driverListStore, driverSuspensionStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.removeDrivers(id, () => {
      driverListStore.schedule.search();
    });
  };

  updateDriver = (driver) => (e) => {
    const { params } = this.props.match;
    this.setState({
      showEditDriverForm: true,
      reservation: {
        id: driver.id,
        max_reservation: driver.max_reservation,
        penalty: driver.penalty,
      },
    });
  };

  updateReservation = (key) => (e) => {
    let update = {};
    update[key] = e.target.value;
    this.setState({
      reservation: Object.assign(this.state.reservation, update),
    });
  };

  saveDriverReservation = () => {
    const { scheduleStore, driverListStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.updateDriverReservation(id, this.state.reservation).then((r) => {
      driverListStore.getStore('schedule').search();
    });
    this.setState({ showEditDriverForm: false });
  };

  addAssignment() {
    if (!this.state.assignmentId) return;
    const { scheduleStore, assignmentListStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.addAssignment(id, this.state.assignmentId, (items) => {
      assignmentListStore.schedule.directAddItems(items);
    });

    this.setState({ assignmentId: '' });
  }

  removeAssignment = (assignment) => (e) => {
    const { scheduleStore, assignmentListStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.removeAssignment(id, assignment, () => {
      assignmentListStore.schedule.directRemoveItem(assignment);
    });
  };

  removeAssignments = (e) => {
    const { scheduleStore, assignmentListStore } = this.props;
    const { params } = this.props.match;
    const { id } = params;
    scheduleStore.removeAssignments(id, () => {
      assignmentListStore.schedule.search();
    });
  };

  callbackSendMessage= () => {
   if (this.props != null && this.props.location.pathname.endsWith('/announce')) {
    this.sendAnnouncement();
   } else {
    this.sendMessage(this.props.match.params.id, this.state.isPromotional)
   }
  }

  sendMessage(id, isPromotional) {
    const { scheduleStore } = this.props;
    const { notificationType, channelsPromotional, channelsServiceRelated, emailSubject, originEmailSubject } = this.state;
    const { activeSchedule } = scheduleStore;
    const isUseAPIPromotional = activeSchedule && activeSchedule.enable_push_notification && ((channelsPromotional && channelsPromotional.length > 0) || (channelsServiceRelated && channelsServiceRelated.length > 0));
    const isEmailType = notificationType === NOTIFY_TYPE.EMAIL;
    if(isUseAPIPromotional && !notificationType) {
      toast.error('Message type is required', {containerId: 'main'});
      return;
    }

    if(isEmailType && !emailSubject) {
      toast.error('Subject is required', {containerId: 'main'});
      return;
    }
    
    this.setState({ isSending: true });
    scheduleStore.sendMessage(id, isPromotional, isUseAPIPromotional ? notificationType : null, isEmailType ? emailSubject : null, (res) => {
      this.setState({ isSending: false });
      if (res.ok) {
        toast.success('Send message successfully!', {containerId: 'main'});
        const type = channelsPromotional && channelsPromotional.length > 0 && channelsPromotional[0].value && channelsPromotional[0].value.toLowerCase();
        this.setState({ 
          isConfirmSendMessage: false,
          isPromotional: true,
          notificationType: type,
          emailSubject: originEmailSubject,
        });
        return;
      }
      toast.error('Send message fail!', {containerId: 'main'});
    });
  }

  clearSMSCost = () => {
    this.setState({SMSCost: null})
  }

  getEstimatedSMS(id, isPromotional) {
    const { scheduleStore } = this.props;
    scheduleStore.getEstimatedSMS(id, isPromotional, (res) => {
      if (res.ok) {
        this.setState({ SMSCost: res.data });
      }
    });
  }


  addSolution(id) {
    if (!id) return;

    const { scheduleStore, assignmentListStore } = this.props;
    const { params } = this.props.match;
    scheduleStore.addSolution(params.id, id, (items) => {
      assignmentListStore.schedule.directAddItems(items);
    });
  }

  openDriverCrew = (e) => {
    const { params } = this.props.match;
    this.props.history.replace(`/schedule/${params.id}/driver-crews`);
  };

  closeDriverCrew = (e) => {
    const { params } = this.props.match;
    this.props.history.push(`/schedule/${params.id}`);
  };

  selectDriverCrew = (e) => {
    const { scheduleStore, driverCrewListStore, driverListStore, driverSuspensionStore } = this.props;
    const { params } = this.props.match;
    if (driverCrewListStore.schedule.selectedItems && driverCrewListStore.schedule.selectedItems.length > 0) {
      scheduleStore.useCrew(params.id, driverCrewListStore.schedule.selectedItems[0], (items) => {
        driverListStore.schedule.directAddItems(items);
        this.props.history.push(`/schedule/${params.id}`);
      });
    }
  };

  openDriverPool = (e) => {
    const { params } = this.props.match;
    this.props.history.replace(`/schedule/${params.id}/driver-pools`);
  };

  closeDriverPool = (e) => {
    const { params } = this.props.match;
    this.props.history.push(`/schedule/${params.id}`);
  };

  selectDriverPool = (e) => {
    const { scheduleStore, driverPoolListStore, driverListStore, driverSuspensionStore } = this.props;
    const { activeSchedule } = scheduleStore;
    const { params } = this.props.match;

    if (!activeSchedule && !activeSchedule.region) return;
    if (driverPoolListStore.schedule.selectedItems && driverPoolListStore.schedule.selectedItems.length > 0) {
      scheduleStore.usePool(params.id, driverPoolListStore.schedule.selectedItems[0], activeSchedule.region, (items) => {
        driverListStore.schedule.addItems(items);
        this.props.history.push(`/schedule/${params.id}`);
      });
    }
  };

  handleChangePromotional = (e) => {
    if (!e || !e.target) return;

    const { checked, name } = e.target;
    const {channelsPromotional, channelsServiceRelated} = this.state;
    const type = checked
      ? channelsPromotional && channelsPromotional.length > 0 && channelsPromotional[0].value && channelsPromotional[0].value.toLowerCase()
      : channelsServiceRelated && channelsServiceRelated.length > 0 && channelsServiceRelated[0].value && channelsServiceRelated[0].value.toLowerCase();
    this.setState({ 
      [name]: checked,
      notificationType: type,
    });
  };

  handleConfirmSendMessage = (v) => {
    const { channelsPromotional, originEmailSubject } = this.state;
    this.setState({ isConfirmSendMessage: v });
    if (!v) {
      const type = channelsPromotional && channelsPromotional.length > 0 && channelsPromotional[0].value && channelsPromotional[0].value.toLowerCase();
      this.setState({
        isPromotional: true,
        notificationType: type,
        emailSubject: originEmailSubject,
      });
    }
  };

  toggleScheduleHistory = () => {
    this.setState({ openScheduleHistory: !this.state.openScheduleHistory });
  };

  handleTypeNotification = (evt) => {
    this.setState({ 
      notificationType: (evt.target.value || '').toLowerCase(),
      isExistHtmlInvalid: false,
      tagInvalid: '',
      announcement: '',
      htmlAnnouncement: null,
    })
  }

  getFeatures = (owners) => {
    const { scheduleStore } = this.props;
    const { activeSchedule } = scheduleStore;
    const { schedule } = this.state;
    const isSameRegion = activeSchedule && schedule && schedule.region && activeSchedule.region === schedule.region.value;

    getAppFeatures([...owners, 'AP_DEFAULT']).then(res => {
      const {direct_booking_push_notification, direct_booking_html_supported} = res.data;

      this.setState({
        directBookingPushNoti: direct_booking_push_notification || false,
        directBookingHtmlSupported: direct_booking_html_supported || false,
        schedule: {
          ...this.state.schedule,
          enable_push_notification: (isSameRegion ? activeSchedule.enable_push_notification : direct_booking_push_notification) || false,
        }
      })
    })
  }

  handleRegion = (selected) => {
    if(isEmpty(selected)) {
      this.setState({
        directBookingPushNoti: false,
        schedule: {
          ...this.state.schedule,
          enable_push_notification: false,
        }
      })
      return;
    }

    this.setState({schedule: {
      ...this.state.schedule,
      region: selected || {},
    }}, () => this.getFeatures([`RG_${selected.value}`]))
  }

  handleCheckTagHtml = async () => {
    const { notificationType, announcement } = this.state;
    let invalid = false;

    if([NOTIFY_TYPE.PUSH].includes(notificationType)) {
      const regexFilter = regexes.filter(r => announcement && announcement.match(r.regex));

      if(regexFilter && regexFilter.length > 0) {
        this.setState({ 
          isExistHtmlInvalid: true,
          tagInvalid: regexFilter.map(r => r.tag).join(", ")
        })
        invalid = true;
      }
      else {
        this.setState({ 
          isExistHtmlInvalid: false,
          tagInvalid: ""
        })
        invalid = false;
      }
    }
    return invalid;
  }

  handlePreviewHTMLAnnouncement = async (val) => {
    if(val) {
      const invalid = await this.handleCheckTagHtml();
      if(invalid) {
        this.setState({ isPreviewHTMLAnnouncement: false });
        return;
      }
    }
    this.setState({ isPreviewHTMLAnnouncement: val});
  }

  handleContentHTMLAnnouncement = (val) => {
    this.setState({ 
      htmlAnnouncement: val,
      isExistHtmlInvalid: false,
      tagInvalid: '',
    });
  }

  handleContentAnnouncement = (val) => {
    this.setState({ 
      announcement: val,
      isExistHtml: false,
    });
  }

  handlePreviewAnnouncement = (val) => {
    if (val) {
      const { announcement } = this.state;
      const isContainHTML = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/gi;
      if(isContainHTML.test(announcement)) {
        this.setState({ 
          isPreviewAnnouncement: false,
          isExistHtml: true,
        });
        return;
      }
    }
    this.setState({ 
      isPreviewAnnouncement: val
    });
  }

  render() {
    const {
      channelsPromotional, channelsServiceRelated, isSending, isConfirmSendMessage, notificationType, emailSubject,
      schedule, directBookingPushNoti, directBookingHtmlSupported, isUpdating, isExistHtmlInvalid, isPreviewAnnouncement,
      announcement, tagInvalid, htmlAnnouncement, isPreviewHTMLAnnouncement, isExistHtml, isPromotional
    } = this.state;
    const { scheduleStore, driverCrewListStore, driverPoolListStore, driverListStore, permissionStore, regionStore } = this.props;
    const { params, path, url } = this.props.match;
    const { activeSchedule } = scheduleStore;
    const minutesInterval = (activeSchedule && activeSchedule.minute_to_increment) || 30;
    const assignmentRenderer = {
      tour_cost: (v) => <span>${v}</span>,
      bonus: (v) => <span>{v ? '$' + v : ''}</span>,
      label: (v, item) => (
        <span>
          {v ? <code>[{v}]</code> : ''} {item.shipment_count} shipments
        </span>
      ),
      actions: (v, item) => {
        if (isDeniedRemoveAssignment) return null;

        return (
          <span>
            <span style={styles.actionItem}>
              <i onClick={this.removeAssignment(item)} style={{ cursor: 'pointer' }} className="fa fa-trash"></i>
            </span>
          </span>
        );
      },
    };

    const datePicker2 = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Message Time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      altInputClass: 'axl-flatpickr-input',
    };

    const bookingStartTime = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Booking Start Time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      altInputClass: 'axl-flatpickr-input',
    };

    const bookingEndTime = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Booking End Time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      altInputClass: 'axl-flatpickr-input',
    };

    const driverRenderer = {
      name: (v, item) => `${item.first_name ? item.first_name : ''} ${item.last_name ? item.last_name : ''}`,
      actions: (v, item) => (
        <span>
          <i onClick={this.removeDriver(item)} style={{ cursor: 'pointer', margin: '4px' }} className="fa fa-trash"></i>
          <i onClick={this.updateDriver(item)} style={{ cursor: 'pointer', margin: '4px' }} className="fa fa-edit"></i>
        </span>
      ),
    };

    const driverSuspensionRenderer = {
      suspension_type: (v, item) => driverSuspensionType[v],
      start_time: (v, item) => (v ? moment(v).format('MMM DD, Y HH:mm:SS A') : v),
      end_time: (v, item) => (v ? moment(v).format('MMM DD, Y HH:mm:SS A') : v),
    };

    const eariestTime = activeSchedule && (activeSchedule.earliest_pickup_time || (activeSchedule.attributes && activeSchedule.attributes.earliest_pickup_time));
    const latestTime = activeSchedule && (activeSchedule.latest_pickup_time || (activeSchedule.attributes && activeSchedule.attributes.latest_pickup_time));

    const isDeniedAddAssignment = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.ADD_ASSIGNMENT_TO_BOOKING_SESSION);
    const isDeniedRemoveAssignment = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.REMOVE_ASSIGNMENTS_FROM_BOOKING_SESSION);

    const renderCommunication = () => (
      <Grid container spacing={2} style={{marginBottom: 0}}>
        <Grid item xs={2}>
          <FormControlLabel control={<Checkbox name="isPromotional" color="primary" defaultChecked={this.state.isPromotional} onChange={this.handleChangePromotional} />} label="Is Promotional" />
        </Grid>
        {activeSchedule && activeSchedule.enable_push_notification 
          && ((channelsPromotional && channelsPromotional.length > 0) || (channelsServiceRelated && channelsServiceRelated.length > 0)) 
          && (
          <Grid item xs={10}>
            <Box display={'flex'} alignItems={'center'}>
              <Typography variant="subtitle2" align="center" style={{marginRight: 8, color: '#666', fontWeight: 400}}>{isConfirmSendMessage ? 'Message Type:' : 'Announcement Type:'} </Typography>
              <Box maxWidth={200}>
                <AxlSelect 
                  options={isPromotional ? channelsPromotional : channelsServiceRelated}
                  placeholder={'Select type communication'}
                  value={notificationType}
                  onChange={this.handleTypeNotification}
                />
              </Box>
            </Box>
          </Grid>
        )}
        {notificationType === NOTIFY_TYPE.EMAIL && (
          <Grid item xs={12}>
            <TextField 
              label="Subject" 
              variant="outlined"  
              size='small' 
              value={emailSubject} 
              onChange={(evt) => this.setState({emailSubject: evt.target.value})}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    )

    return (
      <div>
        <div style={{ marginTop: '8px' }}>
          <Link to="/schedule" style={{ textDecoration: 'none', color: 'inherit' }}>
            &larr; Schedule List
          </Link>
        </div>
        {activeSchedule && (
          <div style={{ ...styles.container, ...Styles.box }}>
            <div style={{ position: 'absolute', top: '20px', left: '16px', fontSize: '40px' }} data-testid="schedule-detail-region">{activeSchedule.region}</div>
            <div style={{ position: 'absolute', top: '6px', right: '16px' }}>
              <Button startIcon={<HistoryIcon />} onClick={this.toggleScheduleHistory}>Activities History</Button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <AxlButton style={{ margin: 0, minWidth: '180px' }} onClick={() => this.handleConfirmSendMessage(true)}>
                Send Message
              </AxlButton>
              <AxlButton style={{ margin: 0, minWidth: '180px' }} bg={'red'} onClick={this.onOpenEdit}>
                Edit
              </AxlButton>
              <AxlButton style={{ margin: 0, minWidth: '180px' }} bg={'bluish'} onClick={this.onOpenSendAnnouncement}>
                Announcement
              </AxlButton>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '160px' }}>
                <div style={styles.header}>Date</div>
                <div data-testid="schedule-detail-date">
                  <Moment format="DD MMM YYYY">{activeSchedule.target_date}</Moment>
                </div>
              </div>
              <div style={{ width: '160px' }}>
                <div style={styles.header}>Max Reservation</div>
                <div data-testid="schedule-detail-max-reservation">{activeSchedule.max_reservation}</div>
              </div>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Name</div>
                <div data-testid="schedule-detail-name">{activeSchedule.name}</div>
              </div>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Enable Driver Bonus Program</div>
                <div data-testid="schedule-detail-enable-driver-bounus">{activeSchedule.enable_driver_bonus ? 'Yes' : 'No'}</div>
              </div>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Token expire in (minutes)</div>
                <div data-testid="schedule-detail-token-expire">{activeSchedule.ttl}</div>
                {activeSchedule.schedule_send_message && activeSchedule.send_message_time > 0 && (
                  <div>
                    <div style={styles.header}>Send message at</div>
                    <div data-testid="schedule-detail-send-message-time">
                      <Moment format={Moment.ISO_8601}>{new Date(activeSchedule.send_message_time)}</Moment>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Can book the seconds route after (in seconds)</div>
                <div data-testid="schedule-detail-can-book-second-route">{activeSchedule.first_break_booking_time}</div>
              </div>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Duration between 2 booking time (in seconds)</div>
                <div data-testid="schedule-detail-duration-between-booking-time">{activeSchedule.booking_duration}</div>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Description</div>
                <div data-testid="schedule-detail-desc">{activeSchedule.description}</div>
              </div>
              {activeSchedule.booking_start_time && (
                <div style={{ width: '240px', marginRight: '12px' }}>
                  <div style={styles.header}>Booking Start Time</div>
                  <div data-testid="schedule-detail-date">
                    <Moment format={Moment.ISO_8601}>{activeSchedule.booking_start_time}</Moment>
                  </div>
                </div>
              )}
              {activeSchedule.cancel_limit_time && (
                <div style={{ width: '240px', marginRight: '12px' }}>
                  <div style={styles.header}>Cancel End Time</div>
                  <div data-testid="schedule-detail-cancel-limit-time">
                    <Moment format={Moment.ISO_8601}>{activeSchedule.cancel_limit_time}</Moment>
                  </div>
                </div>
              )}
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Earliest Pickup Time</div>
                <div data-testid="schedule-detail-earliest-pickup-time">{toHoursAndMinutes(eariestTime, true)}</div>
              </div>
              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Latest Pickup Time</div>
                <div data-testid="schedule-detail-latest-pickup-time">{toHoursAndMinutes(latestTime, true)}</div>
              </div>

              <div style={{ width: '240px', marginRight: '12px' }}>
                <div style={styles.header}>Enable Push Notification</div>
                <div data-testid="schedule-detail-enable-push-noti">{activeSchedule.enable_push_notification ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div style={styles.header}>
              Communication (<i style={{ color: '#aaa' }}>Message template to send to driver</i>)
            </div>
            <div>
              <code style={{ whiteSpace: 'pre-line' }} data-testid="schedule-detail-communication">{activeSchedule.communication}</code>
            </div>
            <div>
              <ProbationList driverNumber={driverListStore.schedule.result.count} url={`/driver-suspensions/${activeSchedule.id}/list`}>
                <DriverSuspensionListComponent hiddenIfEmpty={true} type="schedule" baseUrl={`/driver-suspensions/${activeSchedule.id}/list`} renderer={driverSuspensionRenderer} />
              </ProbationList>
            </div>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top', padding: '8px', width: '50%' }}>
                    <div>
                      <div style={{ ...styles.header, ...{ clear: 'both', overflow: 'hidden' } }}  data-testid="schedule-detail-route">
                        Routes ({activeSchedule.target_assignments.length})
                        <TooltipContainer title={isDeniedRemoveAssignment ? PERMISSION_DENIED_TEXT : ''}>
                          <AxlButton disabled={isDeniedRemoveAssignment} style={{ width: '100px', marginLeft: '10px' }} bg={'bluish'} compact={true} onClick={this.removeAssignments}>
                            Remove All
                          </AxlButton>
                        </TooltipContainer>
                        <span style={{ float: 'right', marginBottom: '10px' }}>
                          <div>
                            <input disabled={isDeniedAddAssignment} style={{ height: '24px' }} value={this.state.assignmentId} onChange={(event) => this.setState({ assignmentId: event.target.value })} />
                            <TooltipContainer title={isDeniedAddAssignment ? PERMISSION_DENIED_TEXT : ''}>
                              <AxlButton disabled={isDeniedAddAssignment} style={{ width: '130px', marginLeft: '5px' }} bg={'bluish'} compact={true} onClick={this.addAssignment}>
                                Add Assignment
                              </AxlButton>
                            </TooltipContainer>
                          </div>
                          <TooltipContainer title={isDeniedAddAssignment ? PERMISSION_DENIED_TEXT : ''}>
                            <AxlButton disabled={isDeniedAddAssignment} style={{ width: '130px', marginLeft: '10px' }} bg={'bluish'} compact={true} onClick={() => this.addSolution(this.state.assignmentId)}>
                              ADD SOLUTION
                            </AxlButton>
                          </TooltipContainer>
                          <Link to={`/schedule/${this.props.match.params.id}/solutions`}>
                            <AxlButton style={{ width: '130px', marginLeft: '10px' }} bg={'bluish'} compact={true}>
                              LIST SOLUTION
                            </AxlButton>
                          </Link>
                        </span>
                      </div>
                      <div>
                        <strong>
                          {activeSchedule.solution && (
                            <span>
                              Solution: {activeSchedule.solution.id} - {moment(activeSchedule.solution.predicted_end_ts).format('MMM DD ddd')}
                            </span>
                          )}
                          <br />
                          <br />
                        </strong>
                      </div>
                      <AssignmentListComponent renderer={assignmentRenderer} type="schedule" baseUrl={`/driver-schedules/${params.id}/assignments`} dataTestId="assignment-table"/>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', padding: '8px', width: '50%' }}>
                    <div style={styles.header}  data-testid="schedule-detail-driver">
                      Drivers ({activeSchedule.target_drivers.length}){' '}
                      {activeSchedule.driverCrew && (
                        <span>
                          {' '}
                          - {activeSchedule.driverCrew.name} ({activeSchedule.driverCrew.drivers.length})
                        </span>
                      )}
                      <AxlButton style={{ width: '100px', marginLeft: '10px' }} bg={'bluish'} compact={true} onClick={this.removeDrivers}>
                        Remove All
                      </AxlButton>
                      <Link to={`/schedule/${activeSchedule.id}/search/driver`}>
                        <AxlButton style={{ width: '100px', marginLeft: '10px' }} bg={'bluish'} compact={true}>
                          ADD
                        </AxlButton>
                      </Link>
                      <AxlButton style={{ width: '100px', marginLeft: '10px' }} bg={'bluish'} compact={true} onClick={this.openDriverCrew}>
                        Driver Crew
                      </AxlButton>
                      <AxlButton style={{ width: '100px', marginLeft: '10px' }} bg={'bluish'} compact={true} onClick={this.openDriverPool}>
                        Driver Pool
                      </AxlButton>
                    </div>
                    <DriverListComponent renderer={driverRenderer} type="schedule" baseUrl={`/driver-schedules/${params.id}/drivers`} dataTestId="driver-table"/>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {this.state.showDriverSearch && (
          <AxlModal style={{ width: '1000px', height: '800px' }}>
            <DriverSearch onSelect={this.onAssignDriver} onCancel={() => this.setState({ showDriverSearch: false })} />
          </AxlModal>
        )}
        {this.state.showEditDriverForm && (
          <AxlModal style={{ width: '400px', height: '300px', textAlign: 'left', padding: '20px' }}>
            <h4 style={{ textAlign: 'center' }}>Update Driver reservation</h4>
            <h5 style={{ marginBottom: '4px' }}>Max Reservation</h5>
            <div>
              <AxlInput defaultValue={this.state.reservation.max_reservation} onChange={this.updateReservation('max_reservation')} flex={true} />
            </div>
            <h5 style={{ marginBottom: '4px' }}>Penalty (delay booking time in seconds)</h5>
            <div>
              <AxlInput defaultValue={this.state.reservation.penalty} onChange={this.updateReservation('penalty')} />
            </div>
            <div>
              <AxlButton style={{ width: '160px' }} onClick={this.saveDriverReservation}>
                SAVE
              </AxlButton>
              <AxlButton style={{ width: '160px' }} bg={'red'} onClick={() => this.setState({ showEditDriverForm: false })}>
                CANCEL
              </AxlButton>
            </div>
          </AxlModal>
        )}
        {this.state.showEditForm && (
          <AxlModal style={{ width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px' }} onClose={() => isUpdating ? null : this.setState({ showEditForm: false })}>
            <h4>Edit Driver Schedule</h4>
            <div style={{ position: 'absolute', top: '50px', left: '8px', right: '8px', bottom: '80px', overflow: 'auto', padding: '10px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={styles.header}>Region</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-region">
                  <AxlAutocomplete
                    options={sortBy(regionStore.regions, 'value')}
                    onChange={(evt, selected) => this.handleRegion(selected)}
                    getOptionLabel={(option) => option.label || "" }
                    getOptionSelected = {(option, value) => option.value === value.value}
                    value={schedule.region || {}}
                    disableClearable
                    isPopper={true}
                  />
                </div>
                {
                  directBookingPushNoti && (
                    <Fragment>
                      <div style={styles.header}>Enable Push Notification</div>
                      <div style={styles.inputContainer}>
                        <AxlCheckbox checked={!!this.state.schedule.enable_push_notification} onChange={this.updateField('enable_push_notification')} data-testid="schedule-edit-checkbox-push-noti"/>
                      </div>
                    </Fragment>
                )}

                <div style={styles.header}>Date</div>
                <div style={styles.inputContainer}>
                  <AxlInput style={{ width: '100%' }} defaultValue={this.state.schedule.target_date} onChange={this.updateField('target_date')} data-testid="schedule-edit-input-date"/>
                </div>
                <div style={styles.header}>Enable Driver Bonus</div>
                <div style={styles.inputContainer}>
                  <AxlCheckbox checked={!!this.state.schedule.enable_driver_bonus} onChange={this.updateField('enable_driver_bonus')} data-testid="schedule-edit-enable-driver-bonus"/>
                </div>
                <div style={styles.header}>Schedule send message</div>
                <div style={styles.inputContainer}>
                  <AxlCheckbox checked={!!this.state.schedule.schedule_send_message} onChange={this.updateField('schedule_send_message')} data-testid="schedule-edit-send-message"/>
                </div>
                {this.state.schedule.schedule_send_message && (
                  <div>
                    <div style={styles.header}>Send message time</div>
                    <div style={styles.inputContainer}>
                      <AlxFlatDateInput options={datePicker2} theme={{ type: 'main' }} value={this.state.schedule.send_message_time ? new Date(this.state.schedule.send_message_time) : null} onChange={this.updateDate('send_message_time', true)} data-testid="schedule-edit-mes-time"/>
                    </div>
                  </div>
                )}

                <div style={styles.header}>Name</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-name">
                  <AxlInput style={{ width: '100%' }} defaultValue={this.state.schedule.name} onChange={this.updateField('name')} />
                </div>
                <div style={styles.header}>Description</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-desc">
                  <AxlInput style={{ width: '100%' }} defaultValue={this.state.schedule.description} onChange={this.updateField('description')} />
                </div>
                <div style={styles.header}>Booking Start Time</div>
                <div style={styles.inputContainer}>
                  {/*<AxlInput style={{width: '100%'}} defaultValue={this.state.schedule.booking_start_time} onChange={ this.updateField('booking_start_time') } />*/}
                  <AlxFlatDateInput options={bookingStartTime} theme={{ type: 'main' }} value={this.state.schedule.booking_start_time ? new Date(this.state.schedule.booking_start_time) : null} onChange={this.updateDate('booking_start_time', true)} data-testid="schedule-edit-booking-start-time"/>
                </div>
                <div style={styles.header}>Cancel End Time</div>
                <div style={styles.inputContainer}>
                  {/*<AxlInput style={{width: '100%'}} defaultValue={this.state.schedule.cancel_limit_time} onChange={ this.updateField('cancel_limit_time') } />*/}
                  <AlxFlatDateInput options={bookingEndTime} theme={{ type: 'main' }} value={this.state.schedule.cancel_limit_time ? new Date(this.state.schedule.cancel_limit_time) : null} onChange={this.updateDate('cancel_limit_time', true)} data-testid="schedule-edit-cancel-limit-time"/>
                </div>
                <div style={styles.header}>Communication</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-communication">
                  <AxlTextArea style={{ width: '100%', height: '140px' }} defaultValue={this.state.schedule.communication} onChange={this.updateField('communication')} />
                </div>
                <div style={styles.header}>Max Reservation</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-max-reservation">
                  <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.max_reservation} onChange={this.updateField('max_reservation')} />
                </div>
                <div style={styles.header}>Token expire in (minutes)</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-token-expire">
                  <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.ttl} onChange={this.updateField('ttl')} />
                </div>
                <div style={styles.header}>Can book the second route after (in seconds)</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-can-book-second-route-after">
                  <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.first_break_booking_time} onChange={this.updateField('first_break_booking_time')} />
                </div>
                <div style={styles.header}>Duration between 2 booking time (in seconds)</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-duration-between-booking-time">
                  <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.booking_duration} onChange={this.updateField('booking_duration')} />
                </div>
                <div style={styles.halfLabel}>Earliest Pickup Time</div>
                <div style={styles.halfInput}>
                  <Flatpickr
                    style={{ width: 200, height: 39, margin: 0, boxSizing: 'border-box' }}
                    options={{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: 'H:i',
                      minuteIncrement: minutesInterval,
                    }}
                    value={toHoursAndMinutes(eariestTime)}
                    onChange={([date]) => {
                      const minuteInput = date.getHours() * 60 + date.getMinutes();
                      console.log('minuteInput', minuteInput);
                      console.log('this.state.schedule.latest_pickup_time', this.state.schedule.latest_pickup_time);

                      if (minuteInput > this.state.schedule.latest_pickup_time) {
                        this.setState({ error: 'Earliest pickup time should be before Latest pickup time' });
                      } else {
                        this.setState({ schedule: { ...this.state.schedule, earliest_pickup_time: minuteInput }, error: '' });
                      }
                    }}
                    data-testid="schedule-edit-earliest-pickup-time"
                  />
                </div>
                <div style={styles.halfLabel}>Latest Pickup Time</div>
                <div style={styles.halfInput}>
                  <Flatpickr
                    style={{ width: 200, height: 39, margin: 0, boxSizing: 'border-box' }}
                    value={toHoursAndMinutes(latestTime)}
                    options={{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: 'H:i',
                      minuteIncrement: minutesInterval,
                    }}
                    onChange={([date]) => {
                      const minuteInput = date.getHours() * 60 + date.getMinutes();
                      if (minuteInput < this.state.schedule.earliest_pickup_time) {
                        this.setState({ error: 'Earliest pickup time should be before Latest pickup time' });
                      } else {
                        this.setState({ schedule: { ...this.state.schedule, latest_pickup_time: minuteInput }, error: '' });
                      }
                    }}
                    data-testid="schedule-edit-latest-pickup-time"
                  />
                </div>
                <div style={styles.header}>Client IDs (separate with comma, no spaces)</div>
                <div style={styles.inputContainer} data-testid="schedule-edit-client-id">
                  <AxlInput style={{ width: '100%' }}  defaultValue={this.state.schedule.client_ids} onChange={this.updateField('client_ids')} />
                </div>
                {this.state.error && <div style={styles.error}>{this.state.error}</div>}
              </div>
            </div>
            <div style={{ textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: '12px', height: '60px', backgroundColor: '#efefff' }} data-testid="schedule-edit-button">
              <AxlButton style={{ margin: 0, minWidth: '180px' }} onClick={this.onSaveEdit} disabled={Boolean(this.state.error) || isUpdating}>
                {isUpdating ? <CircularProgress size={24}/> :`SAVE`}
              </AxlButton>
              <AxlButton style={{ margin: 0, minWidth: '180px' }} bg={'none'} onClick={() => this.setState({ showEditForm: false })}  disabled={isUpdating}>
                Cancel
              </AxlButton>
            </div>
          </AxlModal>
        )}

        <Switch>
          {activeSchedule && (
            <Route
              path={`${path}/driver-crews`}
              render={(props) => {
                const renderer = {
                  drivers: (drivers, item) => (
                    <Link to={`/driver-crews/${item.id}`}>
                      (<strong>{drivers ? drivers.length : 0}</strong>)
                    </Link>
                  ),
                };

                return (
                  <Observer>
                    {() => (
                      <AxlModal style={{ width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px' }}>
                        <div style={styles.modalListStyle}>
                          <DriverCrewListComponent pagination renderer={renderer} baseUrl={`/driver-crews/regions/${activeSchedule ? activeSchedule.region : ''}/schedule_id/${activeSchedule ? activeSchedule.id : ''}`} type="schedule" allowSelect dataTestId="driver-crew-table"/>
                        </div>
                        <div style={{ textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px' }}>
                          <AxlButton compact disabled={!driverCrewListStore.schedule.selectedItems || driverCrewListStore.schedule.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px' }} onClick={this.selectDriverCrew}>
                            SELECT
                          </AxlButton>
                          <AxlButton compact style={{ margin: 0, minWidth: '180px' }} bg={'none'} onClick={this.closeDriverCrew}>
                            Cancel
                          </AxlButton>
                        </div>
                      </AxlModal>
                    )}
                  </Observer>
                );
              }}
            />
          )}

          {activeSchedule && (
            <Route
              path={`${path}/driver-pools`}
              render={(props) => {
                const renderer = {
                  no_of_drivers: (no_of_drivers, item) => (
                    <Link to={`/driver-pools/${item.id}_${activeSchedule ? activeSchedule.region : ''}`}>
                      (<strong>{no_of_drivers ? no_of_drivers : 0}</strong>)
                    </Link>
                  ),
                };

                return (
                  <Observer>
                    {() => (
                      <AxlModal style={{ width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px' }}>
                        <div style={styles.modalListStyle}>
                          <DriverPoolListComponent pagination renderer={renderer} baseUrl={`/driver-pools/regions/${activeSchedule ? activeSchedule.region : ''}/schedule_id/${activeSchedule ? activeSchedule.id : ''}`} type="schedule" allowSelect dataTestId="driver-pool-table"/>
                        </div>
                        <div style={{ textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px' }}>
                          <AxlButton compact disabled={!driverPoolListStore.schedule.selectedItems || driverPoolListStore.schedule.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px' }} onClick={this.selectDriverPool}>
                            SELECT
                          </AxlButton>
                          <AxlButton compact style={{ margin: 0, minWidth: '180px' }} bg={'none'} onClick={this.closeDriverPool}>
                            Cancel
                          </AxlButton>
                        </div>
                      </AxlModal>
                    )}
                  </Observer>
                );
              }}
            />
          )}
          <Route path={`${path}/solutions`} component={SolutionList} />
          <Route exact path={`${path}/search/driver`} component={SearchDriver} />
          <Route
            exact
            path={`${path}/announce`}
            render={(props) => {
              const canShowHtmlEditor = notificationType === NOTIFY_TYPE.EMAIL || (notificationType === NOTIFY_TYPE.PUSH && directBookingHtmlSupported);
              let htmlEditorLabel = [NOTIFY_TYPE.EMAIL].includes(notificationType) ? 'Notification Message' : 'Notification Dialog Content';
              htmlEditorLabel += " (HTML supported)"

              return (
                <Dialog fullWidth maxWidth="md" open={props && props.location && props.location.pathname.startsWith('/schedule/') && props.location.pathname.endsWith('/announce')}>
                  <DialogTitle>Send Announcement</DialogTitle>

                  <DialogContent dividers>
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                      {renderCommunication()}
                      {![NOTIFY_TYPE.EMAIL].includes(notificationType) && (
                        <Fragment>
                          <Box position={'relative'}>
                            <TextField
                              value={announcement}
                              multiline
                              variant="outlined"
                              label="Notification Message"
                              minRows={3}
                              fullWidth
                              onChange={(event) => this.handleContentAnnouncement(event.target.value)}
                              InputProps={{
                                style: {paddingBottom: 32}
                              }}
                              placeholder={
                                [NOTIFY_TYPE.PUSH].includes(notificationType)
                                  ? 'Generally a shorter message that will appear alongside the app notification'
                                  : ''
                              }
                            />
                            {announcement && (
                              <Box position={'absolute'} right={0} bottom={0}>
                                <Button
                                  startIcon={<PhoneIphoneIcon/>}
                                  onClick={() => this.handlePreviewAnnouncement(true)}
                                  disabled={isExistHtml}
                                >Preview</Button>
                              </Box>
                            )}
                          </Box>
                          {notificationType === NOTIFY_TYPE.PUSH && (
                            <Box fontStyle={'italic'} fontSize={12} mt={1} fontFamily={'AvenirNext'}>
                              {`Generally a shorter message that will appear alongside the app notification`}
                            </Box>
                          )}
                          {isExistHtml && (
                            <Box textAlign={'right'} color={'red'} fontSize={12} mt={1} fontFamily={'AvenirNext'}>Notification Message cannot contain HTML tags</Box>
                          )}
                        </Fragment>
                      )}
                      {canShowHtmlEditor && (
                        <Box>
                          <Box position={'relative'} mt={2}>
                            <TextField
                              value={htmlAnnouncement}
                              multiline
                              variant="outlined"
                              label={htmlEditorLabel}
                              minRows={3}
                              fullWidth
                              onChange={(event) => this.handleContentHTMLAnnouncement(event.target.value)}
                              InputProps={{
                                style: {paddingBottom: 32}
                              }}
                              placeholder={
                                [NOTIFY_TYPE.PUSH].includes(notificationType)
                                ? 'Longer message body content supported in both text and HTML format - displayed in an in-app pop-up message when driver clicks on the initial notification'
                                : ''
                              }
                            />

                            {htmlAnnouncement && (
                              <Box position={'absolute'} right={0} bottom={0}>
                                <Button
                                  startIcon={<PhoneIphoneIcon/>}
                                  onClick={() => this.handlePreviewHTMLAnnouncement(true)}
                                  disabled={isExistHtmlInvalid}
                                >Preview</Button>
                              </Box>
                            )}
                          </Box>

                          <Box display={'flex'} justifyContent={'space-between'} alignItems={'flex-start'} fontFamily={'AvenirNext'} fontSize={12} mt={1} >
                            <Box>
                              {notificationType === NOTIFY_TYPE.PUSH && (
                                <Fragment>
                                  <Box fontStyle={'italic'}>
                                    {`Longer message body content supported in both text and HTML format - displayed in an in-app pop-up message when driver clicks on the initial notification`}
                                  </Box>
                                  <Box fontWeight={500} fontStyle={'italic'} mt={1}>
                                    {`Note: If Dialogue Content is empty, Notification Message will be used as content.`}
                                  </Box>
                                </Fragment>
                              )}
                            </Box>
                            <Box color={'red'} flexShrink={0}>Unsupported tags: <code style={{fontSize: 14, fontFamily: 'AvenirNext', fontWeight: 500}}>{regexes.map(r => r.tag).join(', ')}</code></Box>
                          </Box>
                        </Box>
                      )}

                      {isExistHtmlInvalid && (
                        <Box textAlign={'right'} color={'red'} fontSize={12} mt={1} fontFamily={'AvenirNext'}>tags <code style={{fontSize: 14, fontFamily: 'AvenirNext', fontWeight: 500}}>{tagInvalid}</code> not supported by mobile device</Box>
                      )}

                      <RadioGroup value={this.state.whole_driver_pool} onChange={this.updateAnnouncementTarget}>
                        <FormControlLabel value={true} control={<Radio color="primary" />} label="Send to the whole pool" />
                        <FormControlLabel value={false} control={<Radio color="primary" />} label="Send to assigned drivers" />
                      </RadioGroup>
                    </Box>
                  </DialogContent>

                  <DialogActions style={{ padding: '8px 24px' }}>
                    <Button onClick={() => this.openLink(url)} disabled={isSending}>Cancel</Button>
                    <Button onClick={() => this.sendAnnouncement()} variant="contained" color="primary" disabled={isSending || isExistHtmlInvalid || isExistHtml}>
                      {isSending ? <CircularProgress size={20} style={{marginRight: 8}}/> : 'Send'}
                    </Button>
                  </DialogActions>
                </Dialog>
              )
            }}
          />
        </Switch>
        <Dialog fullWidth open={this.state.isConfirmSendMessage} maxWidth="md" onClose={() => isSending ? null : this.handleConfirmSendMessage(false)}>
          <DialogTitle>Send message confirmation</DialogTitle>
          <DialogContent dividers>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                Are you sure want to send message to drivers?
              </Typography>
              {renderCommunication()}
              <TextField value={activeSchedule && activeSchedule.communication} disabled multiline variant="outlined" label="Message" minRows={10} />
            </Box>
          </DialogContent>

          <DialogActions style={{ padding: '8px 24px' }}>
            <Button onClick={() => this.handleConfirmSendMessage(false)} disabled={isSending}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={() => this.sendMessage(this.props.match.params.id, this.state.isPromotional)} disabled={isSending}>
              {isSending ? <CircularProgress size={20} style={{marginRight: 8}}/> : 'Send'}
            </Button>
          </DialogActions>
        </Dialog>

        {this.state.openScheduleHistory && <ScheduleHistory onClose={this.toggleScheduleHistory} />}
        <DialogSMSCost SMSCost={this.state.SMSCost} callbackSmsAction={() => this.callbackSendMessage()} clearSMSCost={() => this.clearSMSCost()}></DialogSMSCost>

        {isPreviewAnnouncement && (
          <PreviewAnnouncement 
            isOpen={isPreviewAnnouncement}
            handleClose={() => this.handlePreviewAnnouncement(false)}
            content={announcement}
            title={activeSchedule && activeSchedule.name}
          />
        )}

        {isPreviewHTMLAnnouncement && (
          <PreviewHTMLAnnouncement 
            isOpen={isPreviewHTMLAnnouncement}
            handleClose={() => this.handlePreviewHTMLAnnouncement(false)}
            content={htmlAnnouncement}
            title={activeSchedule && activeSchedule.name}
            notiType={notificationType}
            emailSubject={emailSubject}
          />
        )}
      </div>
    );
  }
}

export default ScheduleDetail;
