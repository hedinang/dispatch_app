import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('geocodeAddressListStore')
@observer
class GeocodeAddressListComponent extends Component {
  render() {
    const {geocodeAddressListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl} = this.props;
    const store = geocodeAddressListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store
    };

    return <List {...props} />
  }
}

export {GeocodeAddressListComponent}
