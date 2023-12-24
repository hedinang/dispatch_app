import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverProbationStore')
@observer
class DriverProbationSearch extends Component {
  render() {
    const {
      driverProbationStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      hiddenIfEmpty, header
    } = this.props;
    const store = driverProbationStore.getStore(type);

    if (!store) return null;

    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, hiddenIfEmpty, header
    };

    return <List {...props} />
  }
}

export {DriverProbationSearch}