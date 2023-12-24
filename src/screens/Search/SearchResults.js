import React, { Component } from 'react';
import { AxlTable, AxlPanel, AxlModal } from 'axl-reactjs-ui';
import _ from 'lodash';
import Slider from "react-slick";
import moment from 'moment-timezone';
import { inject, observer } from 'mobx-react';

import styles, * as E from './styles';

@inject('shipmentStore')
@observer
class SearchResults extends Component {
	constructor(props) {
		super(props);
		this.state = {
      showShipmentPicture: null,
      showSignaturePicture: null
		}
	}

	onSelectShipment(shipment) {
		const { shipmentStore } = this.props
		shipmentStore.selectShipment(shipment)
	}

  onShowShipmentModal = (shipment) => () => { this.setState({showShipmentPicture: {[shipment.id]: true}}) }

  onCloseShipmentModal = (shipment) => () => { this.setState({showShipmentPicture: {[shipment.id]: false}}) }

  onShowSignatureModal = (shipment) => () => { this.setState({showSignaturePicture: {[shipment.id]: true}}) }

  onCloseSignatureModal = (shipment) => () => { this.setState({showSignaturePicture: {[shipment.id]: false}}) }

  onGoTracking = (shipment) => (e) => {
		window.open(`${process.env.REACT_APP_TRACKING_URL + '/' + shipment.tracking_code}`);
		e.preventDefault();
		e.stopPropagation();
  }

		render() {
				const { shipmentStore } = this.props
				const { shipmentSearchResult } = shipmentStore;
				const { showShipmentPicture, showSignaturePicture } = this.state;
				let shipments = shipmentSearchResult.results ? shipmentSearchResult.results : [];
		    const settings = {
	        dots: false,
	        infinite: false,
	        speed: 500,
	        slidesToShow: 1,
	        slidesToScroll: 1,
	        nextArrow: <SliderNextArrow />,
	        prevArrow: <SliderPrevArrow />
		    };

				return <div style={styles.list}>
						<E.List>
								<E.Table>
										<E.THead>
										<E.TR>
				              <E.TH className={`left th-1`}>{`Order Info`}</E.TH>
				              <E.TH className={`left th-2`}>{`Customer Info`}</E.TH>
				              <E.TH className={`left th-3`}>{`Driver Info`}</E.TH>
				              <E.TH className={`left th-4`}>{`Status`}</E.TH>
										</E.TR>
										</E.THead>
										<E.TBody>
											{ shipments && shipments.map(({shipment, client, pod, label, doc, dropoff, driver}) => {
					              let stop_images = (pod && pod.images) ? pod.images : [];
					              let stop_signatures = (pod && pod.signatures) ? pod.signatures : [];
												const status = (dropoff && dropoff.status) ? dropoff.status : (
													(shipment && shipment.inbound_status) && shipment.inbound_status === 'MISSING' ? shipment.inbound_status : shipment.status
												);

											  return <E.TR style={{cursor: 'pointer'}} key={shipment.id} onClick={() => this.onSelectShipment(shipment)}>
												 <E.TD className={`tick`}>
														<E.Box>
															<AxlPanel style={styles.panelBox}>
																<AxlPanel.Row>
																	<AxlPanel.Col flex={0} style={{...styles.left, ...styles.colCenter, ...styles.colWhite}}>
																		<E.LogoContain>
																			<E.Logo src={client.logo_url} width={62} height={62} />
																		</E.LogoContain>
																	</AxlPanel.Col>
																	<AxlPanel.Col style={styles.colCenter}>
																		<E.Text className={`right word-break`}>{ shipment.internal_id }</E.Text>
																		<E.Text className={`right`}>{ moment(shipment.dropoff_earliest_ts).format('MM/DD/YY') } { moment.tz(shipment.dropoff_earliest_ts, moment.tz.guess()).format("hh:mm A z") } - { moment.tz(shipment.dropoff_latest_ts, moment.tz.guess()).format("hh:mm A z")}</E.Text>
																	</AxlPanel.Col>
																</AxlPanel.Row>
															</AxlPanel>
														</E.Box>
													</E.TD>
													<E.TD>
														<E.Box>
															<AxlPanel style={styles.panelBox}>
																<AxlPanel.Row>
																	<AxlPanel.Col style={styles.colCenter}>
																		<E.TextBold className={`left`}>
																			<E.Icon><i className="fa fa-user" /></E.Icon>
																			{shipment.customer.name}
																		</E.TextBold>
																		<E.TextBold className={`left`}>
																			<E.Icon><i className="fa fa-home" /></E.Icon>
																			{shipment.dropoff_address.street}, {shipment.dropoff_address.city}, {shipment.dropoff_address.state} {shipment.dropoff_address.zipcode}
																		</E.TextBold>
																	</AxlPanel.Col>
																	<AxlPanel.Col flex={0} style={{...styles.colCenter, ...styles.colStart}}>
																		<E.Text className={`right`}><E.Link onClick={this.onGoTracking(shipment)}>{shipment.tracking_code}</E.Link></E.Text>
																	</AxlPanel.Col>
																</AxlPanel.Row>
															</AxlPanel>
														</E.Box>
													</E.TD>
													<E.TD>
														<E.Box>
															<AxlPanel style={styles.panelBox}>
																<AxlPanel.Row>
																	<AxlPanel.Col style={styles.colCenter}>
																		<E.TextBold className={`left`}><E.Icon><i className="fa fa-user" /></E.Icon>{ _.defaultTo(doc.driverName, '-') }</E.TextBold>
																		<E.TextBold className={`left`}><E.Icon><i className="fa fa-phone" /></E.Icon>{ _.defaultTo(driver && driver.phone_number, '-') }</E.TextBold>
																	</AxlPanel.Col>
																	<AxlPanel.Col flex={0} style={{...styles.colCenter, ...styles.colStart}}>
																		<E.Label className={`right`}>{ _.defaultTo(doc.label, '-') }</E.Label>
																	</AxlPanel.Col>
																</AxlPanel.Row>
															</AxlPanel>
														</E.Box>
													</E.TD>
													<E.TD style={styles.TDIndex}>
														<E.Box style={{color: styles.colorStatus[status]}} className={`tick`}>
															<AxlPanel style={styles.panelBox}>
																<AxlPanel.Row>
																	<AxlPanel.Col flex={1} style={styles.colCenter}>
																		<E.Text className={`left`}>
																			<span style={{color: styles.colorStatus[status]}}>{ status }</span>
																		</E.Text>
																		<E.Text className={`left`}>{(dropoff && dropoff.remark) ? <Eclipse strings={dropoff.remark} /> : '-'}</E.Text>
																	</AxlPanel.Col>
																	<AxlPanel.Col flex={0} style={styles.colCenter}>
																		<E.Text className={`right`}>
																			{(dropoff && dropoff.actual_departure_ts) ? <span style={{color: styles.colorStatus[status]}}>@{ moment.tz(dropoff.actual_departure_ts, moment.tz.guess()).format("hh:mm A z") }</span> : '-'}
																		</E.Text>
																		<E.Text className={`right`} onClick={(e) => e.stopPropagation() }>
																			<E.Button onClick={this.onShowSignatureModal(shipment)} style={{opacity: stop_signatures.length > 0 ? 1 : 0.2}}><E.IconImage src={`assets/images/svg/edit.svg`} /></E.Button>
																			<E.Button onClick={this.onShowShipmentModal(shipment)} style={{opacity: stop_images.length > 0 ? 1 : 0.2}}><E.IconImage src={`assets/images/svg/camera.svg`} /></E.Button>
																			{(showSignaturePicture && showSignaturePicture[shipment.id] && stop_signatures.length > 0) && <AxlModal
																					onClose={this.onCloseSignatureModal(shipment)}
																					style={styles.modalStyle}
																					containerStyle={styles.modalContainer}
																			>
																				<div style={styles.wrapImages}>
																						{stop_signatures && (
																							<Slider {...settings}>
																								{stop_signatures.map((img, index) => (
																									<div key={index}>
																										<div style={{height: '100%', backgroundColor: '#fff'}}>
																											<img src={img.data} style={styles.imageShipment} alt="Signature" />
																										</div>
																									</div>
																								))}
																							</Slider>
																						)}
																				</div>
																			</AxlModal>}
																			{(showShipmentPicture && showShipmentPicture[shipment.id] && stop_images.length > 0 ) && <AxlModal
																					onClose={this.onCloseShipmentModal(shipment)}
																					style={styles.modalStyle}
																					containerStyle={styles.modalContainer}
																			>
																				<div style={styles.wrapImages}>
																						{stop_images && <Slider {...settings}>{stop_images.map((img, index) => <div key={index}><div style={{height: '100%'}}><img src={img.url} style={styles.imageShipment} alt="POD" /></div></div>)}</Slider>}
																				</div>
																			</AxlModal>}
																		</E.Text>
																	</AxlPanel.Col>
																</AxlPanel.Row>
															</AxlPanel>
														</E.Box>
													</E.TD>
												</E.TR>
											})}
											{ (!shipments || shipments.length < 1) && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <E.TR key={i}>{[0, 1, 2, 3].map(j => <E.TD key={j}><E.BoxEmpty>{`-`}</E.BoxEmpty></E.TD>)}</E.TR>)}
										</E.TBody>
								</E.Table>
						</E.List>
				</div>
		}
}

export default SearchResults

function SliderPrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div style={{...styles.arrowButton, ...styles.arrowPrev}} onClick={onClick}><i style={styles.arrowIcon} className='fa fa-angle-left' /></div>
  );
}

function SliderNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div style={{...styles.arrowButton, ...styles.arrowNext}} onClick={onClick}><i style={styles.arrowIcon} className='fa fa-angle-right' /></div>
  );
}

class Eclipse extends Component {
	state = {
		show: false
	};

	showEclip = () => {
		this.setState({show: true})
	}

	render() {
		const { strings } = this.props;
		const { show } = this.state;
		let strs = [];
		strs[0] = strings.slice(0, 28);
		strs[1] = strings.slice(32);

		return <span><span>{strs[0]}</span>{strs[1] !== '' && <span>{!show && <E.Expand onClick={this.showEclip}> ... </E.Expand>}{show && <span>{strs[1]}</span>}</span>}</span>
	}
}
