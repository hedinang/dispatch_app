import React, { Component, Fragment } from 'react'
import { inject, observer } from "mobx-react"
import Moment from 'react-moment'
import { texts, statuses } from '../../styled-components'
import DriverProfileInformation from '../DriverProfileInformation';
import DriverProfileRoutingTabs from '../DriverProfileRoutingTabs';
import { AxlModal } from 'axl-reactjs-ui';
import styles from './styles';
import Slider from "react-slick";
import GpsLocation from '../GPS';
import { toJS } from 'mobx';

function SliderPrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div style={{ ...styles.arrowButton, ...styles.arrowPrev }} onClick={onClick}><i style={styles.arrowIcon} className='fa fa-angle-left' /></div>
    );
}

function SliderNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div style={{ ...styles.arrowButton, ...styles.arrowNext }} onClick={onClick}><i style={styles.arrowIcon} className='fa fa-angle-right' /></div>
    );
}

@inject('driverStore')
export default class HistoricalDelivery extends Component {
    constructor(props) {
        super(props);
        this.state = {
            driverData: {},
            showDriverProfile: false,
            showShipmentPicture: false,
        }
        this.onShowDriverProfile = this.onShowDriverProfile.bind(this);
        this.onHideDriverProfile = this.onHideDriverProfile.bind(this)
    }

    onShowDriverProfile = (driver) => {
        const that = this;

        if (driver) {
            this.props.driverStore.get(driver.id, function (res) {
                if (res.status === 200) {
                    that.setState({ driverData: res.data, showDriverProfile: true });
                }
            });
        }
    }
    onHideDriverProfile = () => { this.setState({ showDriverProfile: false }) }

    render() {
        const { shipmentInfo } = this.props
        const { shipment, pod, events, dropoff, client, driver, label } = shipmentInfo || {}
        const { customer, id, dropoff_earliest_ts, status, inbound_status, dropoff_note, dropoff_access_code, tracking_code, dropoff_additional_instruction } = shipment
        const { name } = customer
        const { images } = pod || {}
        const withImages = images && images.length > 0
        const { showDriverProfile, driverData } = this.state
        const shipmentEvents = events ? toJS(events) : []
        const completeEvents = shipmentEvents.filter(e => e.type === 'OUTBOUND')
            .filter(e => e.action === 'update' || e.action === 'update_dropoff')
            .filter(e => e.state && e.state.status === 'SUCCEEDED')
            .filter(e => e.location && e.location.geolocation)
        const completeEvent = completeEvents.length > 0 ? completeEvents[0] : null
        for (let im of images) {
            const imEvents = shipmentEvents.filter(e => e.type === 'POD')
                .filter(e => e.action === 'picture')
                .filter(e => e.state && e.state.url && im.url.indexOf(e.state.url) == 0)
                .filter(e => e.location && e.location.geolocation)
            if (imEvents.length > 0) {
                im.event = imEvents[0]
            }
        }
        console.log(status, statuses[status])

        const settings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            nextArrow: <SliderNextArrow />,
            prevArrow: <SliderPrevArrow />
        };

        return <div>
            <div style={{ display: 'flex' }}>
                {client && client.logo_url && <div style={{ width: 45 }}>
                    <img src={client.logo_url} style={{ maxWidth: 40, maxHeight: 40 }} />
                </div>}
                <div style={{ flex: 1 }}>
                    <div><a style={texts.link} target='_blank' href={`/shipments/${id}`}><code>{id}</code></a> - <Moment format={'M/D/Y'}>{dropoff_earliest_ts}</Moment></div>
                    <div style={texts.label2}>{name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={statuses[status]}>{status}</div>
                    <div style={statuses[inbound_status]}>{inbound_status}</div>
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    <div>
                        <span style={texts.label1}>Dropoff note: </span>
                        <span>{dropoff_note || '-'}</span>
                    </div>
                    <div>
                        <span style={texts.label1}>Access Code: </span>
                        <span>{dropoff_access_code || '-'}</span>
                    </div>
                    <div>
                        <span style={texts.label1}>Additional Instructions: </span>
                        <span>{dropoff_additional_instruction || '-'}</span>
                    </div>
                    {dropoff && <div>
                        <span style={texts.label1}>Dropoff: </span>
                        <span style={statuses[dropoff.status]}>{dropoff.status} </span>
                        {dropoff && dropoff.actual_departure_ts && <span>@ <Moment format='M/D h:mA'>{dropoff.actual_departure_ts}</Moment> </span>}
                        { completeEvent && <GpsLocation geolocation={completeEvent.location.geolocation} size={'sm'} hideNumber={true} google={true} />}
                    </div>}
                    {dropoff && <div>
                        <span style={texts.label1}>Dropoff reason: </span>
                        <span>{dropoff.reason} - {dropoff.remark}</span>
                    </div>}
                    {driver && <div>
                        <span style={texts.label1}>By driver: </span>
                        <span style={{ cursor: 'pointer' }} onClick={() => this.onShowDriverProfile(driver)}>
                            {driver.first_name} {driver.middle_name} {driver.last_name} [{driver.id}]
                        </span>
                    </div>}
                    {label && <div>
                        <span style={texts.label1}>Assignment: </span>
                        <a style={texts.link} target='_blank' href={`/assignments/${label.assignment_id}/stops/${label.dropoff_stop_id}`}>{label.driver_label}</a>
                    </div>}
                </div>
                {withImages && <div style={{display: 'flex'}}>
                    {images.map((im, i) => <div key={i}>
                        <div>
                            <img onClick={() => { this.setState({ showShipmentPicture: true, stop_images: images }) }} style={{ maxWidth: 60, maxHeight: 120, border: 'solid 1px #efefef', cursor: 'pointer' }} key={i} src={im.url}></img>
                        </div>
                        <div>
                            { im.event && <GpsLocation geolocation={im.event.location.geolocation} size={'sm'} hideNumber={true} google={true} /> }
                        </div>
                    </div>)}
                </div>}
            </div>
            {(showDriverProfile && driverData) && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
                <DriverProfileInformation driver={driverData} />
                <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
            </AxlModal>}
            {(this.state.showShipmentPicture && this.state.stop_images && this.state.stop_images.length > 0) && (
                <AxlModal
                    onClose={() => this.setState({ showShipmentPicture: false })}
                    style={styles.podModalStyle}
                    containerStyle={styles.modalContainer}
                >
                    <div style={styles.wrapImages}>
                        <Slider {...settings}>{this.state.stop_images.map((img, index) => <div key={index}>
                            <div style={{ height: '100%', overflow: 'hidden' }}><img src={img.url} style={styles.imageShipment} alt="photo" /></div>
                        </div>)}</Slider>
                    </div>
                </AxlModal>
            )}
        </div>
    }
}