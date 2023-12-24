import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../../List';

@inject('clientStore')
@observer
class ClientListComponent extends Component {
  render() {
    const {
      clientStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      hiddenIfEmpty, header
    } = this.props;
    const store = clientStore.getStore(type);

    if (!store) return null;

    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, hiddenIfEmpty, header
    };

    return <List {...props} />
  }
}

export {ClientListComponent}
