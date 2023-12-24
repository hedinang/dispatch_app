import React from 'react';
import styles, * as E from './styles';
import moment from 'moment-timezone';
import _ from 'lodash';
import Slider from "react-slick";
import {AxlModal, AxlButton} from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import {copyToClipboard, copyToLocation} from "../../Utils/clipboard";
import AssignmentMap from "../AssignmentMap";

export default class AddressHistoryList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalSelected: null,
      modalAddressSelected: null,
    }
  }

  toggleModalPreview = (id) => {
    this.setState({modalSelected: (this.state.modalSelected !== id) ? id : null});
  }

  toggleAddressLocation = (id) => {
    this.setState({modalAddressSelected: (this.state.modalAddressSelected !== id) ? id : null});
  }

  renderActualTs(result){
    const actualTs = _.get(result, 'dropoff.actual_departure_ts') || _.get(result, 'dropoff.actual_arrival_ts') || null;
    const statusColors = {
      CREATED: 'gray',
      PENDING: 'yellow',
      SUCCEEDED: 'green',
      DELIVERED: 'green',
      DROPOFF_SUCCEEDED: 'green',
      PICKUP_SUCCEEDED: 'green',
      DROPOFF_FAILED: 'red',
      PICKUP_FAILED: 'red',
      CANCELLED_BEFORE_PICKUP: 'red',
      CANCELLED_AFTER_PICKUP: 'red',
    }

    return <E.Row>
      <E.Date>
        {actualTs ? moment(actualTs).format('MM/DD/YYYY') : '-'}
        <E.HL>{_.get(result, 'shipment.id', '-')}</E.HL>
      </E.Date>
      <E.Flex/>
      <E.StatusText style={{color: statusColors[_.get(result, 'shipment.status', 'CREATED')]}}>{`${_.get(result, 'shipment.status', '-')} ${_.defaultTo(actualTs && ('@'+ moment(actualTs).format('HH:mmA')), '-')}`}</E.StatusText>
    </E.Row>;
  }

  render() {
    const {results} = this.props;

    return results.map((result, i) => <E.Container key={i}>
      {this.renderActualTs(result)}
        <E.Box>
          <E.Row>
            <E.ClientContainer>
              <E.ClientAvatar src={_.get(result, 'client.logo_url', `/assets/images/logo.png`)} width={25}/>
            </E.ClientContainer>
            <E.Flex>
              <E.PadContainer>
                <E.CustomerName>{_.get(result, 'shipment.customer.name', '-')}</E.CustomerName>
                <E.Label>Drop-off note:</E.Label>
                <E.Text>{_.get(result, 'shipment.dropoff_note', '-')}</E.Text>
                <E.Label>Access code:</E.Label>
                <E.Text>{_.get(result, 'shipment.dropoff_access_code', '-')}</E.Text>
                <E.Label>Additional Instructions:</E.Label>
                <E.Text>{_.get(result, 'shipment.dropoff_additional_instruction', '-')}</E.Text>
              </E.PadContainer>
            </E.Flex>
            <E.Link>
              <E.PadContainer onClick={() => this.toggleAddressLocation(i)}>{`Pin`}</E.PadContainer>
              {(this.state.modalAddressSelected === i) && <AxlModal
                style={styles.modalStyle}
                onClose={() => this.toggleAddressLocation(i)}>
                <AddressLocation {...result} />
              </AxlModal>}
            </E.Link>
            <E.ImageContainer>
              {_.get(result, 'pod.images', []) && <E.ImagePreview
                src={_.get(result, 'pod.images', []) ? _.get(result, 'pod.images[0].url', []) : `/assets/images/logo.png`}
                width={40} onClick={() => this.toggleModalPreview(i)} />}
              {(this.state.modalSelected === i) && <AxlModal
                style={styles.modalStyle}
                onClose={() => this.toggleModalPreview(i)}>
                <AddressHistoryImagePreview {...result} />
              </AxlModal>}
            </E.ImageContainer>
          </E.Row>
        </E.Box>
      </E.Container>);
  }
}

@inject('messengerStore')
@observer
class AddressHistoryImagePreview extends React.Component {

  sendToCustomer = (text) => {
    const {messengerStore, shipment} = this.props;
    if(!text) return;

    messengerStore.refType = '';
    messengerStore.generateTopic()
    // copyToClipboard(text);

  }

  render() {
    const {
      dropoff,
    }                       = this.props;
    const picturies         = _.get(this.props, 'pod.images', []);
    const isShow            = !!picturies.length;
    const settings          = {
                                dots: false,
                                infinite: false,
                                speed: 300,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                arrows: false,
                                adaptiveHeight: false,
                              };
    const driverId          = _.get(dropoff, 'driver_id', null);
    const isShowSendButton  = driverId;

    return <E.SliderContainer>
      {isShow && <Slider {...settings}>{picturies.map((image, index) => <div key={index}>
        <E.SliderInner>
          <E.ImageSliderContainer>
            <E.ImagePreview src={image.url} alt="" />
          </E.ImageSliderContainer>
          <E.DescContainer>{`Photo taken @ ${moment(image._created).format('MM/DD/YYYY HH:mmA')} - [${_.get(image, 'event.location.geolocation.latitude', '-')} ${_.get(image, 'event.location.geolocation.longitude', '')}]`}</E.DescContainer>
          <E.ButtonContainer>
            <AxlButton
              compact
              disabled={!driverId}
              onClick={() => this.sendToCustomer(image.url)}>{`Send Photo to Driver`}</AxlButton>
          </E.ButtonContainer>
        </E.SliderInner>
      </div>)}</Slider>}
    </E.SliderContainer>
  }
}

@inject('messengerStore')
@observer
class AddressLocation extends React.Component {
  componentDidMount() {
    const {messengerStore} = this.props;
    const {dropoff} = this.props;
    if(dropoff) {
      messengerStore.setStopSelected(dropoff);
      messengerStore.loadPodsByStop();
    }
  }

  sendToDriver = () => {
    const {messengerStore}          = this.props;
    const {
      pods = []
    }                               = messengerStore;
    if(!pods.length) return;
  };

  render() {
    const {
      shipment,
      messengerStore
    }                               = this.props;
    const {
      pods = [],
      assignmentInfoInTopicSelected
    }                               = messengerStore;

    return <E.AddressContainer>
      <E.MapContainer>
        <AssignmentMap
          pods={pods}
          shipment={shipment} />
      </E.MapContainer>
      <E.DescContainer>{`Photo taken @ ${_.get(pods, '[0].event.ts') ? moment(_.get(pods, '[0].event.ts')).format('MM/DD/YYYY HH:mmA') : '-'} - [${_.get(pods, '[0]event.location.geolocation.latitude', '-')} ${_.get(pods, '[0]event.location.geolocation.longitude', '-')}]`}</E.DescContainer>
      <E.ButtonContainer onClick={this.sendToDriver}>
        <AxlButton compact onClick={() => {}}>{`Send Dropoff Pin to Driver`}</AxlButton>
      </E.ButtonContainer>
    </E.AddressContainer>
  }
}