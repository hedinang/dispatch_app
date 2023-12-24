import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import ReactWindowList from '../List/ReactWindowList';

@inject('driverListStore')
@observer
class DriverLazyList extends Component {
  render() {
    const {driverListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl, filters, height, width, offsetBottom} = this.props;
    const store = driverListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, filters
    };

    return <ReactWindowList {...props}/>
  }
}

export {DriverLazyList}
