import React, { Component } from 'react';

import {inject, observer, Observer} from "mobx-react";
import {Route, Switch, Link} from 'react-router-dom';
import moment from "moment-timezone";
import {toast} from "react-toastify";
import {AxlButton, AxlModal, AxlSearchBox, AxlTextArea, AxlBox, AxlInput} from "axl-reactjs-ui";
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Tooltip, withStyles } from '@material-ui/core';
import {defaultTo, cloneDeep} from 'lodash';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SearchIcon from '@material-ui/icons/Search';

import {DriverListComponent} from "../../components/DriverList";
import styles, * as E from "./styles";
import searchStyles from "./searchStyles";
import detailStyles from "./detailStyles";
import {DriverCrewListComponent} from "../../components/DriverCrewList";
import {DriverPoolListComponent} from "../../components/DriverPoolList";
import DialogSMSCost from '../../components/DialogSMSCost';
import AxlDialog from '../../components/AxlDialog';
import { getColorByStatus } from '.';
import AdvanceScheduleContent from './advanceScheduleContent';
import { TimezoneDefault } from '../../constants/timezone';
import { toastMessage } from '../../constants/toastMessage';
import AxlTabList from '../../components/AxlTabList';
import AxlModalConfirm from '../../components/AxlModalConfirm';
import { removeSchedule } from '../../stores/api';
import { DriverLazyList } from '../../components/DriverList/lazyList';
import AxlTextField from '../../components/AxlTextField';

const customStyles = (theme) => ({
  appBar: {
    backgroundColor: 'unset',
    color: '#5a5a5a',
    fontFamily: 'AvenirNext',
    fontWeight: 600,
    boxShadow: 'none',
    borderBottom: '1px solid #e8e8e8',
  },
  muiTabRoot: {
    minWidth: 10,
    padding: '12px 12px',
    marginRight: 24,
    textTransform: 'none',
    fontFamily: 'AvenirNext',
    fontWeight: 600,

    '& .MuiTab-wrapper': {
      alignItems: 'flex-start',
    },
    '&.Mui-selected': {
      border: '1px solid #e8e8e8',
      borderTopRightRadius: 4, 
      borderTopLeftRadius: 4,
    },
  },
  tabPanel: {
    flex: 1,
    padding: '16px 0px 0px 16px',
    border: '1px solid #e8e8e8',
    borderTop: 'none',
    minHeight: 200,
  },
});

const defaultTimezone = defaultTo(TimezoneDefault, moment.tz.guess());

const STORE_TYPE = {
  SCHEDULE: 'schedule',
}

@inject('driverAnnouncementStore', 'driverListStore', 'driverCrewListStore', 'driverPoolListStore')
@observer
class DriverAnnouncementDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      announcementConfirm: false,
      message: '',
      AnnouncementDriverIds: [],
      AnnouncementDriverIdsValue: '',
      isSaving: false,
      timezone: defaultTimezone,
      schedule: null,
      isOpenSendNow: false,
      isOpenAdvanceSchedule: false,
      tabActive: 'content',
      isOpenRemove: false,
      isOpenDiscard: false,
      isOpenMessage: false,
      isOpenRemoveAll: false,
      isRemoving: false,
      title: '',
      error: {
        'schedule': '',
      },
      originItems: [],
      isCloned: false,
      query: '',
    }
  }

  componentDidMount() {
    const {driverAnnouncementStore, match} = this.props;
    driverAnnouncementStore.get(match.params.announcementId, (data) => {
      this.setState({
        message: data.communication ? data.communication : '', 
        title: data.subject,
        timezone: data.schedule_timezone || defaultTimezone,
        schedule: data.schedule_time && new Date(moment.tz(data.schedule_time, data.schedule_timezone || defaultTimezone).format("MM/DD/YYYY HH:mm")),
      })
    });
  }

  componentDidUpdate(prevProps) {
    const {driverAnnouncementStore} = this.props;

    if (this.props.match.params.announcementId != prevProps.match.params.announcementId) {
      driverAnnouncementStore.get(this.props.match.params.announcementId);
    }
  }

  changeSearch = (e) => {
    const {driverListStore} = this.props;
    const value = e;

    if (value !== undefined) {
      driverListStore.schedule_search.setFilters({
        q: value,
        page: 1
      });
    }
  };

  search = (e) => {
    const {driverListStore} = this.props;
    driverListStore.schedule_search.search();
  };

  handleRefreshSchedule = () => {
    const { driverListStore } = this.props;
    driverListStore.schedule.search(res => {
      this.setState({
        originItems: cloneDeep(res && res.data || []),
        isCloned: true,
      })
    });
  }

  addDrivers = (e) => {
    const {driverListStore, driverAnnouncementStore} = this.props;
    driverAnnouncementStore.addDrivers(driverListStore.schedule_search.selectedItems, () => {
      this.handleRefreshSchedule();
      this.backToAnnouncement();
    });
  };

  addByDriverIds = (e) => {
    const { driverAnnouncementStore} = this.props;
    driverAnnouncementStore.addDrivers(this.state.AnnouncementDriverIds, () => {
      this.handleRefreshSchedule();
      this.setState({AnnouncementDriverIds: [], AnnouncementDriverIdsValue: ''});
      this.backToAnnouncement();
    });
  }

  removeDriver = (item) => (e) => {
    const { driverAnnouncementStore} = this.props;
    driverAnnouncementStore.removeDriver(item.id, () => {
      this.handleRefreshSchedule();
    });
  };

  removeDrivers = (e) => {
    this.setState({isSaving: true});
    const { driverAnnouncementStore } = this.props;
    const { params } = this.props.match;
    const { announcementId } = params;
    driverAnnouncementStore.removeDrivers(announcementId, (res) => {
      this.setState({isSaving: false});
      if (!res.ok) {
        toast.error(res.data && res.data.message || 'Remove all drivers fail!', {containerId: 'main'});
        return;
      }
      this.setState({ isOpenRemoveAll: false });
      toast.success('Remove all drivers successfully!', {containerId: 'main'});
      this.handleRefreshSchedule();
    });
  };

  backToAnnouncement = () => {
    const { params } = this.props.match;
    this.props.history.push(`/driver-announcements/${params.announcementId}`);
  }

  selectDriverCrew = (e) => {
    const { driverAnnouncementStore, driverCrewListStore, driverListStore } = this.props;
    const { params } = this.props.match;
    if (driverCrewListStore.schedule.selectedItems && driverCrewListStore.schedule.selectedItems.length > 0) {
      driverAnnouncementStore.useCrew(params.announcementId, driverCrewListStore.schedule.selectedItems[0], (items) => {
        driverListStore.schedule.directAddItems(items);
        this.backToAnnouncement();
      });
    }
  };

  selectDriverPool = (e) => {
    const { driverAnnouncementStore, driverPoolListStore, driverListStore } = this.props;
    const { params } = this.props.match;
    if (driverPoolListStore.announcement.selectedItems && driverPoolListStore.announcement.selectedItems.length > 0) {
      driverAnnouncementStore.usePool(params.announcementId, driverPoolListStore.announcement.selectedItems[0], (items) => {
        driverListStore.schedule.directAddItems(items);
        this.backToAnnouncement();
      });
    }
  };

  cancelSendAnnouncement = (e) => {
    const {driverAnnouncementStore} = this.props;
    const {driverAnnouncement} = driverAnnouncementStore;
    const { params, url } = this.props.match;
    this.setState({
      message: driverAnnouncement.communication ? driverAnnouncement.communication : '',
      announcementConfirm: false
    }, () => {
      this.props.history.push(url);
    })
  };

  changeMediaType = (t) => () => {
    const {driverAnnouncementStore} = this.props;
    driverAnnouncementStore.changeMediaType(t)
  }

  updateCommunication = (e) => {
    const { params, url } = this.props.match;
    if(!params || !params.announcementId) return;

    const {driverAnnouncementStore} = this.props;
    const { driverAnnouncement } = driverAnnouncementStore;
    this.setState({ isSaving: true });
    driverAnnouncementStore.update({id: params.announcementId, subject: this.state.title, communication: this.state.message}, res => {
      this.setState({ isSaving: false });
      if (res.ok) {
        toast.success(toastMessage.SAVED_SUCCESS, {containerId: 'main'});
        this.setState({ isOpenMessage: false});
        driverAnnouncement.communication = this.state.message;
        driverAnnouncement.subject = this.state.title;
      }
      else {
        toast.error(toastMessage.ERROR_SAVING, {containerId: 'main'});
      }
    });
  };

  sendAnnouncement = (scheduleTime = null) => {
    const {driverAnnouncementStore} = this.props;
    const { params, url } = this.props.match;
    if(!params || !params.announcementId) return;

    const { timezone, message, schedule } = this.state;
    const {driverAnnouncement} = driverAnnouncementStore;

    const now = moment().valueOf();
    if (scheduleTime && now > scheduleTime) {
      this.setState({
        error: {
          'schedule': 'The scheduled time must not be in the past.'
        }
      });
      return;
    }
    else {
      this.setState({
        error: {
          'schedule': ''
        }
      })
    }

    this.setState({ isSaving: true });
    const payload = {
      schedule_timezone: timezone,
      schedule_ts: scheduleTime,
      message_template: message,
    }
    driverAnnouncementStore.sendMessage(params.announcementId, payload, (res) => {
      this.setState({ isSaving: false });
      if (res.ok) {
        const {drivers} = res.data;
        const driversCount = drivers ? drivers.length : 0;
        this.setState({ 
          isOpenAdvanceSchedule: false,
          isOpenSendNow: false 
        });

        if(res.data && res.data.schedule_time) {
          this.setState({
            schedule: new Date(moment.tz(res.data.schedule_time, res.data.schedule_timezone || defaultTimezone).format("MM/DD/YYYY HH:mm")),
            timezone: res.data.schedule_timezone || defaultTimezone,
          })
        }
        else {
          this.setState({
            schedule: null,
            timezone: res.data.schedule_timezone || defaultTimezone,
          })
        }
        if (scheduleTime) {
          toast.success(`Save schedule successfully!`, {containerId: 'main'});
        } 
        else {
          toast.success(`Sent successfully to ${driversCount} driver(s)`, {containerId: 'main'});
          setTimeout(() => {
            driverAnnouncementStore.get(params.announcementId);
          }, 5000);
        } 

      } else {
        if (res.status === 417) {
          this.setState({ 
            isOpenAdvanceSchedule: false,
            isOpenSendNow: false,
          });
          driverAnnouncement.communication = this.state.message;
          driverAnnouncement.subject = this.state.title;
        }

        toast.error(res.data && res.data.message || "Failed to send! Error code " + res.status, {containerId: 'main'});
      }

      this.setState({
        announcementConfirm: false
      });
      this.props.history.push(url);
    });
  };

  clearSMSCost = () => {
    this.setState({SMSCost: null})
  }

  getEstimatedSMS = (e) => {
    const {driverAnnouncementStore} = this.props;
    const {driverAnnouncement} = driverAnnouncementStore;
    const { params, url } = this.props.match;
    if (driverAnnouncement && (!driverAnnouncement.media_type || driverAnnouncement.media_type =='sms')) {
      driverAnnouncementStore.getEstimatedSMS(params.announcementId, this.state.message, (res) => {
        if (res.ok) {
          this.setState({SMSCost: res.data})
        }
      });
    } else {
      this.setState({
          announcementConfirm: true
        });
    }
  };

  handleAnnouncementDriverIds = (e) => {
    var data = e.target.value;
    var arr = data.split(/[^\d]+/);
    var ids = arr.map(id => id.trim()).filter(id => id !== "")
      .map(id => parseInt(id));

    this.setState({AnnouncementDriverIds: ids, AnnouncementDriverIdsValue: data});
  }

  handleConfirm = (field, val) => {
    if (this.state.isSaving) return;
    
    this.setState({[field]: val});

    if (!val && field === 'isOpenAdvanceSchedule') {
      const { driverAnnouncementStore } = this.props;
      const { driverAnnouncement } = driverAnnouncementStore;
      this.setState({
        schedule: driverAnnouncement.schedule_time && new Date(moment.tz(driverAnnouncement.schedule_time, driverAnnouncement.schedule_timezone || defaultTimezone).format("MM/DD/YYYY HH:mm")),
        timezone: driverAnnouncement.schedule_timezone || defaultTimezone,
      })
    }
  }

  handleChangeTab = (event, newValue) => {
    this.setState({ tabActive: newValue});
  };

  handleDiscardChange = () => {
    const { driverAnnouncementStore } = this.props;
    const { driverAnnouncement } = driverAnnouncementStore;
    this.setState({ 
      message: driverAnnouncement && driverAnnouncement.communication,
      title: driverAnnouncement && driverAnnouncement.subject,
      isOpenDiscard: false,
    })
  }

  handleRemoveSchedule = async () => {
    const { params } = this.props.match;
    if(!params || !params.announcementId) return;
    
    this.setState({isRemoving: true});
    const resRemove = await removeSchedule(params.announcementId);
    this.setState({isRemoving: false});
    if (resRemove.ok) {
      this.setState({ 
        isOpenRemove: false,
        schedule: null,
        timezone: defaultTimezone,
       });
      const { driverAnnouncementStore } = this.props;
      driverAnnouncementStore.updateAnnouncementStore(resRemove.data);
      toast.success('Remove schedule successfully!', {containerId: 'main'});
    }
    else {
      toast.error(resRemove.data && resRemove.data.message || 'Remove schedule fail!', {containerId: 'main'});
    }
  }

  handleFormAdvanceSchedule = (field, val) => {
    this.setState({
      [field]: val,
      error: {
        [field]: '',
      }
    });
  }

  handelBackList = () => {
    this.props.history.push(`/driver-announcements`);
    const {driverListStore} = this.props;
    const store = driverListStore.getStore(STORE_TYPE.SCHEDULE);
    store.setData({
      result: {
        count: 0,
        items: [],
        total_pages: 0
      },
    });
  }

  handleChangeInput = (evt) => {
    const value = evt.target.value && evt.target.value.trim();
    this.setState({
      query: value,
    })

    if (evt.key === 'Enter') {
      this.handleSearch(value);
    }
  }

  handleSearch = (val) => {
    const {driverListStore} = this.props;
    const { originItems, isCloned } = this.state;
    const store = driverListStore.getStore(STORE_TYPE.SCHEDULE);

    if (store && store.searching) return;

    const result = store && store.result;

    if (!!originItems && !isCloned) {
      this.setState({
        originItems: cloneDeep(result && result.items || []),
        isCloned: true,
      })
    }

    if (val) {
      const data = originItems && originItems.length > 0 ? originItems : result.items;
      const filterData =  data.filter(d => 
        d.id && `${d.id}`.includes(val)
        || `${d.first_name || ''} ${d.last_name || ''}`.toLowerCase().includes(val.toLowerCase())
        || d.phone_number && d.phone_number.includes(val)
      ) || [];
      store.setData({
        result: {
          items: filterData,
        },
      });
      return;
    }
    store.setData({
      result: {
        items: originItems && originItems.length > 0 ? originItems : result.items,
      },
    });
  }

  render() {
    const { isSaving, timezone, isOpenSendNow, isOpenAdvanceSchedule, isOpenRemove, isOpenDiscard, schedule, isOpenMessage, isOpenRemoveAll, isRemoving, error, query, originItems } = this.state;
    const {driverAnnouncementStore, driverListStore, driverCrewListStore, driverPoolListStore, classes} = this.props;
    const {formStore, driverAnnouncement, loadingAnnouncement} = driverAnnouncementStore;
    const { schedule: storeSchedule } = driverListStore;
    const { params, path, url } = this.props.match;
    const renderer = {
      name: (v, item) => `${item.first_name ? item.first_name : ''} ${item.last_name ? item.last_name : ''}`,
      crew_names: (val) => (
        <Tooltip title={
          <Box maxHeight={'500px'} overflow={'auto'}>
            {val && val.map((item, idx) => <Box key={idx}>{item}</Box>)}
          </Box>
        } style={{whiteSpace: 'pre-line'}} interactive>
          <Box style={detailStyles.limitLine}>{val && Array.isArray(val) && val.join('\r\n')}</Box>
        </Tooltip>),
      actions: (v, item) =>
        <span>
          <i onClick={this.removeDriver(item)} style={{cursor: 'pointer'}} className="fa fa-trash"></i>
        </span>
    };

    const tabList = [
      {
        label: "Content",
        value: 'content',
        tabPanelComponent: <AxlTextArea value={ this.state.message } style={{width: '100%', height: '200px', border: 'none', resize: 'vertical'}} onChange={ (event) => this.setState({message: event.target.value}) } />,
      },
      {
        label: "Preview",
        value: 'preview',
        tabPanelComponent: <Box dangerouslySetInnerHTML={{ __html: this.state.message }}></Box>,
      },
    ]

    // need to display loading
    if (!driverAnnouncement) return null;

    const disabled = this.state.message === driverAnnouncement.communication && this.state.title === driverAnnouncement.subject;
    const formatScheduleTime = moment.tz(driverAnnouncement.schedule_time, driverAnnouncement.schedule_timezone).format('M/DD/YYYY hh:mmA z');
    const lastSentTs = driverAnnouncement.last_sent_ts && moment.tz(driverAnnouncement.last_sent_ts, moment.tz.guess()).format('M/DD/YYYY hh:mmA z');
    const countData = (storeSchedule && storeSchedule.result && originItems && storeSchedule.result.count >= originItems.length 
      ? storeSchedule.result.count : originItems.length) || 0;
    
    return <div style={detailStyles.container}>
      <Box display={'flex'} justifyContent={'space-between'} mt={2} mb={1.5} maxWidth={1320} m={'0 auto'}>
        <Button variant='outlined' color='default' style={{...detailStyles.btnBack}} size='small' onClick={() => this.handelBackList()}>BACK</Button>

        <Box display={'flex'} style={{gap: 8}}>
          <Button 
            variant="contained" 
            style={{...detailStyles.btnSend}} 
            startIcon={<AccessTimeIcon fontSize='small' style={{marginTop: -3}}/>} 
            onClick={() => this.handleConfirm('isOpenAdvanceSchedule', true)} 
            size='small'
          >{driverAnnouncement.schedule_time ? `EDIT SCHEDULE` : `SCHEDULE`}</Button>
          <Button variant="contained" style={{...detailStyles.btnSend}} onClick={() => this.handleConfirm('isOpenSendNow', true)} size='small'>SEND NOW</Button>
        </Box>
      </Box>
      <div style={{ maxWidth: 1320, marginLeft: 'auto', marginRight: 'auto'}}>
      { !loadingAnnouncement && <AxlBox>
        <div style={{textAlign: 'left'}}>
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} mb={2}>
            <Box alignSelf={'normal'}>
              <Box mb={0.5}>{driverAnnouncement.name}</Box>
              <Box fontSize={14} color={'#666'}>{driverAnnouncement.description}</Box>
            </Box>

            <Box textAlign={'right'}> 
              <Box>
                <span style={detailStyles.txtSentVia}>Sent via:</span>
                <span>&nbsp;{driverAnnouncement.media_type ? driverAnnouncement.media_type : 'SMS'}</span>
              </Box>
              <Box>
                <span style={detailStyles.txtSentVia}>Status:</span>
                <span style={{color: getColorByStatus(driverAnnouncement.status), fontWeight: 600}}>&nbsp;{driverAnnouncement.status}
                  {driverAnnouncement.schedule_time && (<span style={{color: '#4a90e2'}}>&nbsp;({formatScheduleTime})</span>)}
                </span>
              </Box>
              {driverAnnouncement.last_sent_ts && <Box>
                <span style={detailStyles.txtSentVia}>Last sent:</span>
                <span>
                  {driverAnnouncement.last_sent_ts && (<span style={{color: '#4a90e2', fontWeight: 600}}>&nbsp;{lastSentTs}</span>)}
                </span>
              </Box>}
            </Box>
          </Box>

          { driverAnnouncement.media_type === 'email' && <Box mb={2}>
            <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: 5}}>Subject</div>
            <AxlInput style={{width: '100%'}} value = { this.state.title } onChange = { (event) => this.setState({title: event.target.value}) } />
          </Box> }
          <AxlTabList
            value={this.state.tabActive}
            onChange={this.handleChangeTab}
            tabList={tabList}
            TabIndicatorProps={{ style: { background: '#75c31e', height: 3, }}}
            className={{
              appBar: classes.appBar,
              tabPanel: classes.tabPanel,
            }}
            classes={{
              tab: {root: classes.muiTabRoot }
            }}
          />
          <p><code style={{ flex: 1}}>{'Use ${first_name}, ${last_name}, ${schedule_ts} for driver first name, last name and schedule time.'}</code></p>
        </div>
        {driverAnnouncement.opinion_expired_ts && <E.PollList><strong>Opinion expired time:</strong> {moment(driverAnnouncement.opinion_expired_ts).format("MMM DD, Y hh:mm:ss")} - <code>(Your local time)</code></E.PollList>}
        {driverAnnouncement.opinion_map && <E.PollList><strong>Opinions:</strong> {Object.values(driverAnnouncement.opinion_map).join('; ')}</E.PollList>}
        <E.SaveButtonWrap>
          <Box display={'flex'} style={{gap: 8}} justifyContent={'flex-end'} mt={2}>
            <Button 
              disabled={ disabled } 
              style={!disabled ? {...detailStyles.btnWarning} : {...detailStyles.btnDisabled}} 
              size='small'
              color='default'
              variant='contained'
              onClick={() => this.handleConfirm('isOpenDiscard', true)}
            >Discard Change</Button>
            <Button 
              disabled={ disabled } 
              style={!disabled ? {...detailStyles.btnSend} : {...detailStyles.btnDisabled}} 
              onClick={() => this.handleConfirm('isOpenMessage', true)}
              size='small'
              variant='contained'
            >Save</Button>
          </Box>
        </E.SaveButtonWrap>
      </AxlBox> }
      { loadingAnnouncement && <AxlBox style={{ minHeight: 300 }}>Loading ...</AxlBox>}
      </div>
      <div style={{marginTop: 20, maxWidth: 1320, marginLeft: 'auto', marginRight: 'auto'}}>
        <Box display={'flex'} py={0.5}>
          <div style={{flex: 1, textAlign: 'left', gap: 8, display: 'flex', alignItems: 'center'}}>
            <Link to={`/driver-announcements/${this.props.match.params.announcementId}/drivers`}>
              <Button variant="contained" style={{...detailStyles.btnBack, color: '#5e5e5e'}} size='small'>ADD DRIVERS</Button>
            </Link>
            <Link to={`/driver-announcements/${this.props.match.params.announcementId}/driver-crews`}>
              <Button variant="contained" style={{...detailStyles.btnBack, color: '#5e5e5e'}}size='small'>USE DRIVER CREW</Button>
            </Link>
            <Link to={`/driver-announcements/${this.props.match.params.announcementId}/driver-pools`}>
              <Button variant="contained" style={{...detailStyles.btnBack, color: '#5e5e5e'}} size='small'>USE DRIVER POOL</Button>
            </Link>
            <Link to={`/driver-announcements/${this.props.match.params.announcementId}/driver-ids`}>
              <Button variant="contained" style={{...detailStyles.btnBack, color: '#5e5e5e'}} size='small'>ADD BY DRIVER IDS</Button>
            </Link>

            <Box width={'30%'}>
              <AxlTextField
                placeholder="Search by ID, name, phone" 
                onKeyPress={e => this.handleChangeInput(e)} 
                onChange={(e) => this.handleChangeInput(e)} 
                style={{backgroundColor: '#fff', borderRadius: 4, fontFamily: 'AvenirNext'}}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => this.handleSearch(query)}
                      edge="end"
                      size='small'
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Box>
          </div>

          <Box display={'flex'} alignItems={'center'} style={{gap: 16}}>
            <Button variant="contained" style={{...detailStyles.btnWarning}} onClick={() => this.handleConfirm('isOpenRemoveAll', true)} size='small'>
              Remove All ({countData})
            </Button>
          </Box>
        </Box>
        <div>
          <DriverLazyList type={STORE_TYPE.SCHEDULE} baseUrl={`/driver-announcements/${this.props.match.params.announcementId}/drivers`} renderer={renderer} />
        </div>

        <Switch>
          <Route path={`${path}/driver-crews`} render={ (props) => {
            const renderer = {
              drivers: (drivers, item) => <Link to={`/driver-crews/${item.id}`}>
                (<strong>{drivers ? drivers.length : 0}</strong>)
              </Link>,
            };

            return <Observer>{ () => <AxlModal onClose={this.backToAnnouncement} style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
              <div style={styles.modalListStyle}>
                <DriverCrewListComponent pagination renderer={renderer} type={STORE_TYPE.SCHEDULE} allowSelect />
              </div>
              <div style={{textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px'}}>
                <AxlButton compact disabled={!driverCrewListStore.schedule.selectedItems || driverCrewListStore.schedule.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px'}} onClick={ this.selectDriverCrew }>SELECT</AxlButton>
                <AxlButton compact style={{ margin: 0, minWidth: '180px'}} bg={'none'} onClick={this.backToAnnouncement}>Cancel</AxlButton>
              </div>
            </AxlModal>}</Observer> }} />
          <Route path={`${path}/driver-pools`} render={ (props) => {
              const renderer = {
              };

              return <Observer>{ () => <AxlModal onClose={this.backToAnnouncement} style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
                <div style={styles.modalListStyle}>
                  <DriverPoolListComponent pagination renderer={renderer} type='announcement' allowSelect />
                </div>
                <div style={{textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px'}}>
                  <AxlButton compact disabled={!driverPoolListStore.announcement.selectedItems || driverPoolListStore.announcement.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px'}} onClick={ this.selectDriverPool }>SELECT</AxlButton>
                  <AxlButton compact style={{ margin: 0, minWidth: '180px'}} bg={'none'} onClick={this.backToAnnouncement}>Cancel</AxlButton>
                </div>
              </AxlModal>}</Observer> }} />
          <Route path={`/driver-announcements/:announcementId/drivers`} render={ (props) =>
            <Observer>{ () => <AxlModal onClose={this.backToAnnouncement} style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
              <div style={styles.searchBar}>
                <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
                <Button onClick={this.search} variant='contained' color='primary' style={{marginLeft: 8}} size='small'>Search</Button>
              </div>
              <div style={searchStyles.container}>
                <DriverListComponent pagination type='schedule_search' renderer={renderer} disabledIds={driverAnnouncement.drivers} allowSelect multipleSelect />
              </div>
              <div style={{textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px'}}>
                {driverListStore.schedule_search.selectedItems.length > 0 && <span>{driverListStore.schedule_search.selectedItems.length} selected</span>}<AxlButton compact={true} disabled={driverListStore.schedule_search.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px'}} onClick={this.addDrivers}>ADD</AxlButton>
                <AxlButton onClick={this.backToAnnouncement} compact={true} style={{ margin: 0, minWidth: '180px'}} bg={'none'}>Cancel</AxlButton>
              </div>
            </AxlModal>}</Observer>} />

            {this.state.announcementConfirm && <AxlModal onClose={this.cancelSendAnnouncement} style={{width: '480px', minHeight: '200px', padding: '10px'}}>
              <h4>Announcement confirmation</h4>
              <div>
                Please double check the announcement content to send out to drivers!
              </div>

              <div>
                <AxlButton style={{width: '160px'}} onClick={ this.sendAnnouncement }>Yes</AxlButton>
                <AxlButton bg={'red'} style={{width: '160px'}} onClick={this.cancelSendAnnouncement}>Cancel</AxlButton>
              </div>
            </AxlModal>}
          <Route path={`${path}/driver-ids`} render={ (props) => {
              return <Observer>{ () => <AxlModal onClose={this.backToAnnouncement} style={{width: '1000px', height: '220px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
                <h4>Enter driver IDs</h4>
                <div>
                  <AxlTextArea style={{width: '100%', height: '140px'}} value={this.state.AnnouncementDriverIdsValue} onChange={ this.handleAnnouncementDriverIds } />
                  {this.state.AnnouncementDriverIds && this.state.AnnouncementDriverIds.length > 0 && <span>You selected {this.state.AnnouncementDriverIds.length} drivers.</span>}
                </div>
                <div style={{textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px'}}>
                  <AxlButton disabled={!(this.state.AnnouncementDriverIds && this.state.AnnouncementDriverIds.length > 0)} compact style={{ margin: 0, minWidth: '180px'}} onClick={this.addByDriverIds}>Add</AxlButton>
                  <AxlButton compact style={{ margin: 0, minWidth: '180px'}} bg={'none'} onClick={this.backToAnnouncement}>Cancel</AxlButton>
                </div>
              </AxlModal>}</Observer> }} />
        </Switch>
        <DialogSMSCost SMSCost={this.state.SMSCost} callbackSmsAction={() => this.sendAnnouncement()} clearSMSCost={() => this.clearSMSCost()}></DialogSMSCost>
      </div>

      {isOpenAdvanceSchedule && (
        <AxlModalConfirm
          alignTitle={'left'}
          isOpen={isOpenAdvanceSchedule}
          handleClose={() => this.handleConfirm('isOpenAdvanceSchedule', false)}
          componentTitle={<Box display={'inline-flex'} alignItems={'center'} style={{gap: 8}}><AccessTimeIcon fontSize='small' style={{marginTop: -3}}/> <span>{driverAnnouncement.schedule_time && 'EDIT'} SCHEDULE</span></Box>}
          componentChildren={
            <AdvanceScheduleContent
              timezone={timezone}
              handleChange={(field, val) => this.handleFormAdvanceSchedule(field, val)}
              schedule={schedule || null}
              isEdit={!!driverAnnouncement.schedule_time}
              originScheduleTime={driverAnnouncement.schedule_time}
              originScheduleTimezone={driverAnnouncement.schedule_timezone}
              error={error}
            />
          }
          textOK={'Schedule'}
          componentAction={
            <Box display='flex' justifyContent='flex-end' px={1} style={{gap: 8}}>
              <Button onClick={() => this.handleConfirm('isOpenAdvanceSchedule', false)} disabled={isSaving} variant='outlined' style={detailStyles.btnBack} size='small'>Cancel</Button>
              {driverAnnouncement.schedule_time && <Button onClick={() => this.handleConfirm('isOpenRemove', true)} disabled={isSaving} variant='outlined' style={detailStyles.btnRemoveSchedule} size='small'>Remove Schedule</Button>}
              <Button onClick={() => this.sendAnnouncement(moment(schedule, moment.tz.guess()).tz(timezone, true).valueOf())} variant='contained' color='primary' disabled={isSaving || !schedule} style={detailStyles.btnSend} size='small'>
                {isSaving && <CircularProgress size={20}/>}
                {!isSaving && 'Schedule'}
              </Button>
            </Box>
          }
          isSaving={isSaving}
        />
      )}
      {isOpenSendNow && (
        <AxlModalConfirm
          isOpen={isOpenSendNow}
          handleClose={() => this.handleConfirm('isOpenSendNow', false)}
          componentChildren={
            !disabled 
            ? <Box textAlign={'center'} lineHeight={1.3}>
                {driverAnnouncement.schedule_time && (
                  <Box>
                    <span>Sending this announcement now will remove the schedule on</span>
                    <span style={{color: '#4a90e2'}}>&nbsp;{formatScheduleTime}.</span>
                  </Box>
                )}
                <Box color={'#d0021b'}>Your recent announcement changes are not yet saved.</Box>
                <Box>Do you want to save and send now?</Box>
            </Box>
            : (
              driverAnnouncement.schedule_time 
              ? <Box display={'flex'} flexDirection={'column'} alignItems={'center'} lineHeight={1.4}>
                  <Box maxWidth={350} textAlign={'center'}>
                    <span>Sending this announcement now will remove the schedule on</span>
                    <span style={{color: '#4a90e2'}}>&nbsp;{formatScheduleTime}.</span>
                  </Box>
                  <Box>Are you sure to send it now instead?</Box>
                  </Box>
              : <Box textAlign={'center'}>Are you sure to send this announcement now?</Box>)
          }
          textOK={!disabled ? 'Save & Send' : 'Send'}
          handleOK={() => this.sendAnnouncement(null)}
          isSaving={isSaving}
          maxWidth={'xs'}
        />
      )}
      {isOpenDiscard && (
        <AxlModalConfirm
          isOpen={isOpenDiscard}
          handleClose={() => this.handleConfirm('isOpenDiscard', false)}
          componentChildren={<Box textAlign={'center'}>Are you sure to discard recent changes on the announcement content?</Box>}
          textOK={'Discard Change'}
          handleOK={() => this.handleDiscardChange()}
          customStyleSave={detailStyles.btnWarning}
          isSaving={isSaving}
          maxWidth={'xs'}
        />
      )}

      {isOpenRemove && driverAnnouncement.schedule_time && (
        <AxlModalConfirm
          isOpen={isOpenRemove && !!driverAnnouncement.schedule_time}
          handleClose={() => this.handleConfirm('isOpenRemove', false)}
          componentChildren={<Box textAlign={'center'}>Are you sure to remove current schedule on 
            <span style={{color: '#4a90e2'}}>&nbsp;{formatScheduleTime}</span>?
          </Box>}
          textOK={'Remove Schedule'}
          handleOK={() => this.handleRemoveSchedule()}
          customStyleSave={detailStyles.btnRemoveSchedule}
          isSaving={isRemoving}
        />
      )}

      {isOpenMessage && (
        <AxlModalConfirm
          isOpen={isOpenMessage}
          handleClose={() => this.handleConfirm('isOpenMessage', false)}
          componentChildren={<Box textAlign={'center'}>Are you sure to save recent changes on the announcement content?</Box>}
          handleOK={() => this.updateCommunication()}
          isSaving={isSaving}
          maxWidth={'xs'}
        />
      )}

      {isOpenRemoveAll && (
        <AxlModalConfirm
          isOpen={isOpenRemoveAll}
          handleClose={() => this.handleConfirm('isOpenRemoveAll', false)}
          componentChildren={<Box textAlign={'center'}>Are you sure to remove all drivers from recipients list?</Box>}
          handleOK={() => this.removeDrivers()}
          isSaving={isSaving}
          textOK={'Remove All'}
          customStyleSave={detailStyles.btnWarning}
          maxWidth={'xs'}
        />
      )}
    </div>
  }
}

export default withStyles(customStyles)(DriverAnnouncementDetail);
