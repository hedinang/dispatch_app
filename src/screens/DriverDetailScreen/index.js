import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import DriverDetailContainer from '../../containers/DriverDetail';

@inject('driverStore', 'userStore')
@observer
class DriverDetailScreen extends Component {
  render() {
      return (
        <DriverDetailContainer {...this.props} />
      )
  }
}

export default DriverDetailScreen