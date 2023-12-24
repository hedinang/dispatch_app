import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverListStore')
@observer
class DriverListComponent extends Component {
  render() {
    const {driverListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl, filters, height, width, offsetBottom, dataTestId} = this.props;
    const store = driverListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, filters, dataTestId
    };

    return <List {...props}/>
  }
}

export {DriverListComponent}
