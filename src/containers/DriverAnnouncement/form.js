import React, { Component } from 'react';
import {Route, Switch, Link} from 'react-router-dom';
import {
  AxlTable,
  AxlPagination,
  AxlSearchBox,
  AxlButton,
  AxlInput,
  AxlTextArea,
  AxlSelect,
  AxlDateInput,
  AxlLoading
} from 'axl-reactjs-ui';
import styles, * as E from './styles';
import {inject, observer} from "mobx-react";
import {GroupField} from "../DispatchSearchFilter/styles";
import { consolidateStreamedStyles } from 'styled-components';
import moment from 'moment-timezone';

@inject('driverAnnouncementStore')
@observer
class DriverAnnouncementForm extends Component {
  constructor(props) {
    super(props);
    this.polls = {};
    this.pollOptions = {
      "0": "Interested, full-time",
      "1": "Interested, part-time",
      "2": "Not interested",
      "3": "Other",
    };
  }

  PROMOTIONAL_MESSAGE = {"sms":"Driver will only receive 1 SMS per hour if you choose Promotional", "email":"Driver will able to unsubscribe our email service if you choose Promotional"}

  componentDidMount() {
    const {driverAnnouncementStore} = this.props;
    const { formStore } = driverAnnouncementStore;

    if (this.props.match.params.announcementId) {
      driverAnnouncementStore.get(this.props.match.params.announcementId, (announcement) => {
        formStore.data = announcement;
        if(formStore.data.opinion_map) {
          this.polls = Object.assign({}, formStore.data.opinion_map);
        }
      })
    } else {
      formStore.data = {};
      formStore.setField('created_ts', moment().unix());
    }
    if (!formStore.getField('media_type')) {
      formStore.setField('media_type', 'sms');
    }
    
    if (!formStore.getField('is_promotional')) {
      formStore.setField('is_promotional', false);
    }
  }

  save = (e) => {
    const {driverAnnouncementStore} = this.props;
    const cb = () => {
      driverAnnouncementStore.search();
      this.props.history.push('/driver-announcements');
    };

    if (this.props.match.params.announcementId) {
      driverAnnouncementStore.edit(this.props.match.params.announcementId, cb);
    } else {
      driverAnnouncementStore.create(cb);
    }
  };

  selectPolls = (e) => {
    const {driverAnnouncementStore} = this.props;
    const { formStore } = driverAnnouncementStore;
    const {data} = formStore;
    var polls = {};
    if(e.target.checked) {
      polls = Object.assign(this.polls, {[e.target.value]: this.pollOptions[e.target.value]});
    } else {
      delete this.polls[e.target.value];
      polls = this.polls;
    }
    formStore.setField('opinion_map', polls);
  }

  handleChangePromotional = (e) => {
    const {driverAnnouncementStore} = this.props;
    const { formStore } = driverAnnouncementStore;
    formStore.setField(e.target.name, e.target.checked);
  }

  render() {
    const {driverAnnouncementStore} = this.props;
    const { formStore, loadingAnnouncement } = driverAnnouncementStore;
    const { data } = formStore;
    return !loadingAnnouncement ? <div>
      <h4>{this.props.match.params.announcementId ? `Edit Driver Announcement`: 'Create Driver Announcement'}</h4>
      <div style={{textAlign: 'left'}}>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Type</div>
          <div>
            <AxlSelect
              options={[{name: 'SMS', value: 'sms'}, {name: 'MESSENGER', value: 'messenger'}, {name: 'EMAIL', value: 'email'}]}
              name='media_type'
              onSelect={(v) => formStore.setField('media_type', v)}
              value={formStore.getField('media_type')} />
          </div>
        </div>
        {formStore.getField('media_type') != 'messenger' && <div style={styles.formWrapper}>
          <input name="is_promotional" id="is_promotional" checked={data.is_promotional==true} type="checkbox" onChange={this.handleChangePromotional} />
          <label style={styles.formLabel} for="is_promotional">Promotional ({this.PROMOTIONAL_MESSAGE[formStore.getField('media_type')]})</label>
        </div>
        }
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Name</div>
          <div>
            <AxlInput style={{width: '100%'}} value={data.name ? data.name : ''} name='name' onChange={formStore.handlerInput} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Description</div>
          <div>
            <AxlInput style={{width: '100%'}} name='description' value={data.description ? data.description : ''} onChange={formStore.handlerInput} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>communication</div>
          <div>
            <AxlTextArea style={{width: '100%'}} name='communication' value={data.communication ? data.communication : ''} onChange={formStore.handlerInput} />
            <code>{'Use ${first_name}, ${last_name} for driver first name and last name.'}</code>
          </div>
        </div>
        <br/>
        <div style={styles.formLabel}>Opinion expired time:</div>
        <E.DatePoll>
          <AxlDateInput
            theme={"main"}
            arrow
            clear="true"
            onChange = { (d) => formStore.setField('opinion_expired_ts', d) }
            options={{
              // maxDate: 'today',
              defaultValue: data.opinion_expired_ts,
              defaultDate: 'today',
              dateFormat: 'MMM DD, Y HH:mm:ss',
              placeHolder: 'today',
              enableTime: true,
              altInput: true,
              clickOpens: false,
            }}
          />
        </E.DatePoll>
        <E.Poll>
          <div style={styles.formLabel}>Opinions:</div>
          <E.Col>
            {/*{data.opinion_map && console.log(Object.values(data.opinion_map))}*/}
            {Object.values(this.pollOptions).map((e, i) => <E.PollItem key={i}>
              <input
                checked={data.opinion_map && data.opinion_map[i] && data.opinion_map[i].length}
                type="checkbox" name={`opinion_map`} value={i} onChange={this.selectPolls} />{e}</E.PollItem>)}
          </E.Col>
        </E.Poll>
        <div style={{textAlign: 'center'}}>
          <AxlButton style={{ margin: 0, minWidth: '180px'}} onClick={ this.save }>Save</AxlButton>
          <Link to={'/driver-announcements'}>
            <AxlButton style={{ margin: 0, minWidth: '180px'}} bg={'none'}>Cancel</AxlButton>
          </Link>
        </div>
      </div>
    </div> : <E.LoadingContainer>
      <AxlLoading thin={1} size={50} />
    </E.LoadingContainer>
  }
}

export default DriverAnnouncementForm
