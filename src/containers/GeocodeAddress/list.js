import React, { Component } from 'react';
import {Route, Switch, Link} from 'react-router-dom';
import _ from 'lodash';

import { AxlTable, AxlPagination, AxlSearchBox, AxlButton, AxlModal } from 'axl-reactjs-ui';
import styles from './styles';
import {inject, observer} from "mobx-react";
import GeocodeAddressFrom from './form';
import {GeocodeAddressListComponent} from "../../components/GeocodeAddressList";
import GeocodeAddressDetail from "./detail";

@inject('geocodeAddressListStore')
@observer
class GeocodeAddressList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openStreetLink: false
    }
  }
  removeAddress = (item) => (e) => {
    const {geocodeAddressListStore} = this.props;
    geocodeAddressListStore.delete(item.id, () => {
      geocodeAddressListStore.search();
    })
  };

  changeSearch = (e) => {
    const {geocodeAddressListStore} = this.props;
    const value = e;

    if (value !== undefined) {
      geocodeAddressListStore.setFilters({
        q: value,
        page: 1
      });
    }
  };

  search = (e) => {
    const {geocodeAddressListStore} = this.props;
    geocodeAddressListStore.search();
  };

  render() {
    const renderer = {
      street: (v, item, result) => {
        let _result = item.street_variants;
        if (item.actual && item.actual.street_variants) {
          if (item.street_variants.indexOf(_.toUpper(item.actual.street)) === -1) {
            _result.push(item.actual.street)
          }
        }
        return <MoreLink links={_result} />
      },
      city: (v, item, result) => {
        let _result = item.city_variants;
        if(item.actual && item.actual.city) {
          if (item.city_variants.indexOf(_.toUpper(item.actual.city)) === -1) {
            _result.push(item.actual.city)
          }
        }
        return <MoreLink links={_result} />
      },
      state: (v, item, result) => {
        let _result = item.state_variants;
        if (item.atual && item.actual.state) {
          if (item.state_variants.indexOf(_.toUpper(item.actual.state)) === -1) {
            _result.push(item.actual.state)
          }
        }
        return <MoreLink links={_result} />
      },
      zipcode: (v, item) => item.zipcode,
      additional_instruction: (v, item) => item.additional_instruction,
      navigation_difficulty: (v, item) => item.navigation_difficulty,
      rdi: (v, item) => item.rdi,
      uncharted: (v, item) => `${item.uncharted}`.toUpperCase(),
      latlng: (n, item) => <div>
        <a target="_blank" href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}>{item.latitude}, {item.longitude}</a>
      </div>,
      actions: (v, item) =><span>
        <span style={styles.actionItem}>
          <Link to={`/geocode-addresses/${item.id}`}>
            <i style={{cursor: 'pointer'}} className="fa fa-eye"></i>
          </Link>
        </span> |
        <span style={styles.actionItem}>
          <Link to={`/geocode-addresses/${item.id}/edit`}>
            <i style={{cursor: 'pointer'}} className="fa fa-edit"></i>
          </Link>
        </span> |
        <span style={styles.actionItem}>
          <i onClick={this.removeAddress(item)} style={{cursor: 'pointer'}} className="fa fa-trash"></i>
        </span>
      </span>
    };

    return <div style={{textAlign: 'left'}}>
      <div style={styles.searchBar}>
        <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
        <div style={styles.btns}>
          <AxlButton onClick={this.search} bg={'periwinkle'} style={styles.searchButton} >Search</AxlButton>
          <Link to={'geocode-addresses/new'}>
            <AxlButton style={styles.searchButton}>NEW !</AxlButton>
          </Link>
        </div>
      </div>
      <GeocodeAddressListComponent pagination renderer={renderer} />
      <Switch>
        <Route exact path={`/geocode-addresses/new`} render={ (props) =>
          <AxlModal style={styles.modalFormStyle} onClose={() => this.props.history.push(`/geocode-addresses`)}>
            <GeocodeAddressFrom {...props} />
          </AxlModal>} />

        <Route exact path={`/geocode-addresses/:addressId`} render={ (props) =>
          <AxlModal style={styles.modalFormStyle} onClose={() => this.props.history.push(`/geocode-addresses`)}>
            <GeocodeAddressDetail {...props} />
          </AxlModal>} />

        <Route exact path={`/geocode-addresses/:addressId/edit`} render={ (props) =>
          <AxlModal style={styles.modalFormStyle} onClose={() => this.props.history.push(`/geocode-addresses`)}>
            <GeocodeAddressFrom {...props} />
          </AxlModal>} />
      </Switch>
    </div>
  }
}

export default GeocodeAddressList

export class MoreLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }
  render() {
    const { links } = this.props
    const { isOpen } = this.state

    return <span>
      <div>
        <span>{links[0]}</span>
        { (links.length > 1 && !isOpen) && <span onClick={() => this.setState({isOpen: true})} style={styles.moreLink}>{` + ${links.length - 1} more`}</span> }
      </div>
      { (links.length > 1 && isOpen) && links.slice(1).map((link, index) => <div key={index}>{link}</div>) }
    </span>
  }
}
