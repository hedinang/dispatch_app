import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import DriverList from '../../containers/DriverList/index';

@inject('driverListStore')
@observer
class DriverListScreen extends Component {

  toggleOrder = (field) => (e) => {
    this.props.driverListStore.toggleOrder(field);
  };

  render() {
      return <div>
          <DriverList
            ordering={this.props.driverListStore.filters}
            toggleOrder={this.toggleOrder}
            history={this.props.history}
          />
      </div>
  }
}

export default DriverListScreen
