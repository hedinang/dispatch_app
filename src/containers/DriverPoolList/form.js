import React, { Component } from 'react';
import { Link} from 'react-router-dom';
import { AxlButton, AxlInput } from 'axl-reactjs-ui';
import styles from './styles';
import {inject, observer} from "mobx-react";

@inject('driverPoolStore', 'driverPoolListStore')
@observer
class DriverPoolForm extends Component {
  componentDidMount() {
    const {driverPoolStore, driverPoolListStore} = this.props;
    const { formStore } = driverPoolStore;

    if (this.props.match.params.poolId) {
      driverPoolStore.getCrew(this.props.match.params.poolId, (pool) => {
        formStore.data = pool;
      })
    } else {
      formStore.data = {};
    }
  }

  save = (e) => {
    const {driverPoolStore, driverPoolListStore} = this.props;
    const cb = () => {
      driverPoolListStore.search();
      this.props.history.push('/driver-pools');
    };

    if (this.props.match.params.crewId) {
      driverPoolStore.editPool(this.props.match.params.poolId, cb);
    } else {
      driverPoolStore.createPool(cb);
    }
  };

  render() {
    const {driverPoolStore} = this.props;
    const { formStore } = driverPoolStore;
    const {data} = formStore;

    return <div>
      <h4>{this.props.match.params.poolId ? `Edit Pool`: 'Create Driver Pool'}</h4>
      <div style={{textAlign: 'left'}}>
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
          <div style={styles.formLabel}>Region</div>
          <div>
            <AxlInput style={{width: '100%'}} name='region' value={data.region ? data.region : ''} onChange={formStore.handlerInput} />
          </div>
        </div>
        <br/>
        <div style={{textAlign: 'center'}}>
          <AxlButton style={{ margin: 0, minWidth: '180px'}} onClick={ this.save }>Save</AxlButton>
          <Link to={'/driver-crews'}>
            <AxlButton style={{ margin: 0, minWidth: '180px'}} bg={'none'}>Cancel</AxlButton>
          </Link>
        </div>
      </div>
    </div>
  }
}

export default DriverPoolForm
