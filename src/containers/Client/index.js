import React, { Component } from 'react';
import {Route, Switch, Link} from 'react-router-dom';

import { AxlTable, AxlPagination, AxlSearchBox, AxlButton, AxlModal } from 'axl-reactjs-ui';
import moment from 'moment';
import styles from './styles';
import {inject, observer} from "mobx-react";
import { saveAs } from 'file-saver';
import {ClientListComponent} from "../../components/Listing/ClientList";
import ClientSettingForm from './form';

@inject('clientStore')
@observer
class ClientList extends Component {
  changeSearch = (e) => {
    const {clientStore} = this.props;
    const value = e;

    if (value !== undefined) {
      clientStore.setFilters({
        q: value,
        page: 1
      });
    }
  };

  search = (e) => {
    const {clientStore} = this.props;
    clientStore.search();
  };

  render() {
    const {clientStore} = this.props;
    const { filters, searching, result } = clientStore;
    const renderer = {
      actions: (v, item) =><span>
        <span style={styles.actionItem}>
          <Link to={`/clients/${item.id}/settings`}>
            <i style={{cursor: 'pointer'}} className="fa fa-cogs"></i>
          </Link>
        </span>
      </span>
    };

    return <div style={{textAlign: 'left'}}>
      <div style={styles.searchBar}>
        <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
        <AxlButton loading={searching} compact onClick={this.search} bg={'periwinkle'} style={styles.searchButton} >Search</AxlButton>
      </div>
      <ClientListComponent pagination renderer={renderer} />
      <Switch>
        <Route exact path={`/clients/:id/settings`} render={ (props) =>
          <AxlModal style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
            <ClientSettingForm {...props} />
          </AxlModal>} />
      </Switch>
    </div>
  }
}

export default ClientList
