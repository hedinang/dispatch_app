import React, { Component } from 'react';
import {Route, Switch, Link} from 'react-router-dom';
import { AxlTable, AxlPagination, AxlSearchBox, AxlButton, AxlInput, AxlTextArea, AxlCheckbox, AxlSelect, AxlReselect } from 'axl-reactjs-ui';
import styles from './styles';
import {inject, observer} from "mobx-react";
import _ from "lodash";

@inject('geocodeAddressListStore')
@observer
class GeocodeAddressForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      NAVIGATION_DIFFICULTIES: [
        {label: 'EXTREME', value: 'EXTREME'},
        {label: 'HARD', value: 'HARD'},
        {label: 'MEDIUM', value: 'MEDIUM'},
        {label: 'EASY', value: 'EASY'},
      ],
      RDIS: [
        {label: 'RESIDENTIAL', value: 'RESIDENTIAL'},
        {label: 'COMMERCIAL', value: 'COMMERCIAL'},
      ]
    }
  }
  componentDidMount() {
    const {geocodeAddressListStore} = this.props;
    const { formStore } = geocodeAddressListStore;

    if (this.props.match.params.addressId) {
      geocodeAddressListStore.get(this.props.match.params.addressId, (data) => {
        formStore.data = data;
      })
    } else {
      formStore.data = {};
    }
  }

  save = (e) => {
    const {geocodeAddressListStore} = this.props;
    const cb = () => {
      geocodeAddressListStore.search();
      this.props.history.push('/geocode-addresses');
    };

    if (this.props.match.params.addressId) {
      geocodeAddressListStore.edit(this.props.match.params.addressId, cb);
    } else {
      geocodeAddressListStore.create(cb);
    }
  };

  render() {
    const {geocodeAddressListStore} = this.props;
    const { formStore } = geocodeAddressListStore;
    const {data} = formStore;
    const requiredIndicator = <span style={{color: 'red', fontWeight: 'bolder', fontSize: '10px'}}> * required</span>;
    const streetFilled = data.street_variants && data.street_variants.join().length > 0;
    const cityFilled = data.city_variants && data.city_variants.join().length > 0;
    const stateFilled = data.state_variants && data.state_variants.join().length > 0;
    const saveDisabled = !(streetFilled && cityFilled && stateFilled && data.zipcode && data.latitude && data.longitude && data.navigation_difficulty && data.rdi);
    const modifyMode = this.props.match.params.addressId ? 'Edit' : 'Create';
    if (modifyMode === 'Create' && [null, undefined].includes(data.uncharted)) {
      _.set(data, "uncharted", true);
    }
    return <div>
      <h4>{`${modifyMode} Address`}</h4>
      <div style={{textAlign: 'left'}}>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Street { streetFilled ? null : requiredIndicator}</div>
          <div>
            <AxlTextArea style={{width: '100%'}} value={data.street_variants ? data.street_variants : ''} name='street_variants' isMulti={true} onChange={formStore.handlerTextarea} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>City {cityFilled ? null : requiredIndicator}</div>
          <div>
            <AxlTextArea style={{width: '100%'}} value={data.city_variants ? data.city_variants : ''} name='city_variants' onChange={formStore.handlerTextarea} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>State {stateFilled ? null : requiredIndicator}</div>
          <div>
            <AxlTextArea style={{width: '100%'}} value={data.state_variants ? data.state_variants : ''} name='state_variants' onChange={formStore.handlerTextarea} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Zipcode {data.zipcode ? null : requiredIndicator}</div>
          <div>
            <AxlInput style={{width: '100%'}} name='zipcode' value={data.zipcode ? data.zipcode : ''} onChange={formStore.handlerInput} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Latitude {data.latitude ? null : requiredIndicator}</div>
          <div>
            <AxlInput style={{width: '100%'}} name='latitude' value={data.latitude ? data.latitude : ''} onChange={formStore.handlerInput} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Longitude {data.longitude ? null : requiredIndicator}</div>
          <div>
            <AxlInput style={{width: '100%'}} name='longitude' value={data.longitude ? data.longitude : ''} onChange={formStore.handlerInput} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Uncharted (Check this box IF you are inserting/altering newly-constructed/hard-to-locate home which can only be navigated with lat-lng)</div>
          <div>
            <AxlCheckbox name='uncharted' checked={!!data.uncharted} onChange={formStore.handlerCheckbox}  />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Access Code
            {data.suggested_access_codes ? <strong> - Consider drivers suggestions <em style={{color: 'purple'}}>{data.suggested_access_codes.join(', ')}</em></strong> : null}
          </div>
          <div>
            <AxlInput style={{width: '100%'}} name='access_code' value={data.access_code ? data.access_code : ''} onChange={formStore.handlerInput} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Additional Instruction
            {data.suggested_additional_instructions ? <strong> - Consider drivers suggestions <em style={{color: 'purple'}}>{data.suggested_additional_instructions.join(', ')}</em></strong> : null}
          </div>
          <div>
            <AxlTextArea style={{width: '100%'}} name='additional_instruction' value={data.additional_instruction ? data.additional_instruction : ''} onChange={formStore.handlerTextarea} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Navigation Difficulty {data.navigation_difficulty ? null : requiredIndicator}</div>
          <div>
            <AxlReselect theme='main' name='navigation_difficulty' value={data.navigation_difficulty ? {label: data.navigation_difficulty, value: data.navigation_difficulty} : null} onChange={formStore.handlerReactSelect('navigation_difficulty')} options={this.state.NAVIGATION_DIFFICULTIES}/>
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Residential Delivery Indicator {data.rdi ? null : requiredIndicator}</div>
          <div>
            <AxlReselect theme='main' name='rdi' value={data.rdi ? {label: data.rdi, value: data.rdi} : null} onChange={formStore.handlerReactSelect('rdi')} options={this.state.RDIS} />
          </div>
        </div>
        <br/>
        <div style={{textAlign: 'center'}}>
          <AxlButton style={{ margin: 0, minWidth: '180px'}} onClick={ this.save } disabled={saveDisabled}>Save</AxlButton>
          <Link to={'/geocode-addresses'}>
            <AxlButton style={{ margin: 0, minWidth: '180px'}} bg={'none'}>Cancel</AxlButton>
          </Link>
        </div>
      </div>
    </div>
  }
}

export default GeocodeAddressForm
