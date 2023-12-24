import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import List from '../List';

@inject('assignmentListStore')
@observer
class AssignmentListComponent extends Component {
  render() {
    const {assignmentListStore, renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl, dataTestId} = this.props;
    const store = assignmentListStore.getStore(type);

    if (!store) return null;
    const props = {
      renderer, type, allowSelect, disabledIds, pagination, multipleSelect, baseUrl,
      store, dataTestId
    };

    return <List {...props} />
  }
}

export {AssignmentListComponent}
