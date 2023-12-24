import React, { Component } from 'react';
import {Route, Switch, Link} from 'react-router-dom';

import { AxlTable, AxlPagination, AxlSearchBox, AxlButton, AxlModal } from 'axl-reactjs-ui';
import Moment from 'react-moment';
import styles from './styles';
import {inject, observer} from "mobx-react";
import { saveAs } from 'file-saver';
import {DriverPoolListComponent} from "../../components/DriverPoolList";
import DriverCrewForm from './form';

@inject('driverPoolListStore', 'driverPoolStore')
@observer
class DriverPoolList extends Component {
  removePool = (item) => (e) => {
    const {driverPoolStore, driverPoolListStore} = this.props;
    driverPoolStore.deletePool(item.id, () => {
      driverPoolListStore.search();
    })
  };

  render() {
    const {driverPoolListStore} = this.props;
    const { filters, searching, result } = driverPoolListStore;
    const renderer = {
      no_of_drivers: (no_of_drivers, item) => <Link to={`/driver-pools/${item.id}`}>
        (<strong>{no_of_drivers ? no_of_drivers : 0}</strong>)
      </Link>,
      actions: (v, item) =><span>
        <span style={styles.actionItem}>
          <Link to={`/driver-pools/${item.id}`}>
            <i style={{cursor: 'pointer'}} className="fa fa-eye"></i>
          </Link>
        </span>        
      </span>
    };

    return <div style={{textAlign: 'left'}}>
      <DriverPoolListComponent pagination renderer={renderer} />
      <Switch>
        <Route exact path={`/driver-pools/new`} render={ (props) =>
          <AxlModal style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}} onClose={() => this.props.history.push(`/driver-pools`)}>
            <DriverCrewForm {...props} />
          </AxlModal>} />

        <Route exact path={`/driver-pools/:poolId/edit`} render={ (props) =>
          <AxlModal style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}} onClose={() => this.props.history.push(`/driver-pools`)}>
            <DriverCrewForm {...props} />
          </AxlModal>} />
      </Switch>
    </div>
  }
}

export default DriverPoolList
