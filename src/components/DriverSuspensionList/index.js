import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverSuspensionStore')
@observer
class DriverSuspensionListComponent extends Component {
  render() {
    const {
      driverSuspensionStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      hiddenIfEmpty, header
    } = this.props;
    const store = driverSuspensionStore.getStore(type);

    if (!store) return null;

    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, hiddenIfEmpty, header
    };

    return <List {...props} />
  }
}

export {DriverSuspensionListComponent}
