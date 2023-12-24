import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('driverAnnouncementStore')
@observer
class DriverAnnouncementListComponent extends Component {
  render() {
    const {driverAnnouncementStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl} = this.props;
    const store = driverAnnouncementStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store
    };

    return <List {...props} />
  }
}

export {DriverAnnouncementListComponent}
