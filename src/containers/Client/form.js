import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import { AxlButton, AxlInput } from 'axl-reactjs-ui';
import styles from './styles';
import {inject, observer} from "mobx-react";

@inject('clientStore')
@observer
class ClientSettingForm extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {clientStore} = this.props;
    const { settingStore } = clientStore;
    if (this.props.match.params.id) {
      clientStore.getSettings(this.props.match.params.id, (data) => {
        if (data.settings && data.settings.settings) {
          settingStore.data = data.settings.settings;
        } else {
          settingStore.data = {};
        }
      })
    } else {
      settingStore.data = {};
    }
  }

  save = (e) => {
    const {clientStore} = this.props;
    const cb = () => {
      clientStore.search();
      this.props.history.push('/clients');
    };

    if (this.props.match.params.id) {
      clientStore.updateSettings(this.props.match.params.id, cb);
    }
  };

  search = (e) => {
    const {clientStore} = this.props;
    clientStore.search();
  };


  render() {
    const {clientStore} = this.props;
    const { settingStore, isLoading } = clientStore;
    const {data} = settingStore;

    const isOnDemand = settingStore.getField('on_demand', false) === "true" ||
                          settingStore.getField('on_demand', false) === true ? true: false;

    return <div style={styles.container}>
      <h4 style={styles.title}>Setting of Client</h4>
      <div style={{textAlign: 'left'}}>
        <div style={styles.formWrapper}>
          <div>
            <input type='checkbox' name='geocode_immediately' checked={settingStore.getField('geocode_immediately', false) === "true" ||
            settingStore.getField('geocode_immediately', false) === true ? true: false} onChange={settingStore.handlerInput} />
            Geocode Immediately
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div>
            <input type='checkbox' name='on_demand' checked={isOnDemand} onChange={settingStore.handlerInput} />
            Enable On Demand
          </div>
        </div>
        {isOnDemand && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Max Create Time Before</div>
          <div>
            <AxlInput type='number' style={{width: '100%'}} name='ondeman_max_create_time_before' value={settingStore.getField('ondeman_max_create_time_before', '')} onChange={settingStore.handlerInput} />
          </div>
        </div>}
        {isOnDemand && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Max Time Space (Between dropoff latest and dropoff earliest time)</div>
          <div>
            <AxlInput type='number' style={{width: '100%'}} name='ondeman_max_time_space' value={settingStore.getField('ondeman_max_time_space', '')} onChange={settingStore.handlerInput} />
          </div>
        </div>}
        <br/>
        {settingStore.getErrors() && settingStore.getErrors().length > 0 && <ul>{settingStore.getErrors().map((error, index) => <li key={index}>
          <span style={styles.error}>{error}</span>
        </li>)}</ul>}
        <div style={{textAlign: 'center'}}>
          <AxlButton style={styles.chooseDriverAction} onClick={ this.save }>{`Save`}</AxlButton>
          <Link to={'/clients'}>
            <AxlButton style={styles.chooseDriverAction} bg={'none'}>{`Cancel`}</AxlButton>
          </Link>
        </div>
      </div>
    </div>
  }
}

export default ClientSettingForm
