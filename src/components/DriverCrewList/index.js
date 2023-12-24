import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverCrewListStore')
@observer
class DriverCrewListComponent extends Component {
  render() {
    const {driverCrewListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl, regions, dataTestId} = this.props;
    const store = driverCrewListStore.getStore(type);
    store.DEFAULT.filters.regions = regions

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, dataTestId
    };

    return <List {...props} />
  }
}

export {DriverCrewListComponent}
