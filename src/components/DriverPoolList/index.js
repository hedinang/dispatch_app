import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverPoolListStore')
@observer
class DriverPoolListComponent extends Component {
  render() {
    const {driverPoolListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl, dataTestId} = this.props;
    const store = driverPoolListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, dataTestId
    };

    return <List {...props} />
  }
}

export {DriverPoolListComponent}
