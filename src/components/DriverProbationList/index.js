import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverListStore')
@observer
class DriverProbationListComponent extends Component {
  render() {
    const {driverListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl, styles} = this.props;
    const store = driverListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, styles
    };

    return <List {...props} />
  }
}

export {DriverProbationListComponent}
