import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('solutionListStore')
@observer
class SolutionListComponent extends Component {
  render() {
    const {solutionListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect} = this.props;
    const store = solutionListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect,
      store
    };

    return <List {...props} />
  }
}

export {SolutionListComponent}
