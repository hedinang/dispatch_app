/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable indent */
/* eslint-disable react/no-deprecated */
/* eslint-disable quotes */
/* eslint-disable quote-props */
/* eslint-disable max-classes-per-file */

import React from 'react';
import { Popup } from 'react-map-gl';
import Moment from 'react-moment';

const StopToolTip = (props) => {
  const { hoverStop } = props;
  const isDropoff = hoverStop && hoverStop.type === 'DROP_OFF';
  return (
    hoverStop && (
      <Popup
        tipSize={5}
        anchor="bottom"
        closeButton={false}
        longitude={isDropoff ? hoverStop.shipment.dropoff_address.lng : hoverStop.shipment.pickup_address.lng}
        latitude={isDropoff ? hoverStop.shipment.dropoff_address.lat : hoverStop.shipment.pickup_address.lat}
        closeOnClick
        offsetTop={-30}
        className={'map-tooltip'}
        onClose={() => this.setState({ hoverStop: null })}
      >
        <div style={{ fontSize: '13px', width: '140px', textAlign: 'center', margin: 0 }}>
          <div>
            ETA:{' '}
            <Moment interval={0} format={'hh:mm:ss a'}>
              {hoverStop.predicted_departure_ts}
            </Moment>
          </div>
          {hoverStop.actual_departure_ts && (
            <div>
              Actual:{' '}
              <Moment interval={0} format={'hh:mm:ss a'}>
                {hoverStop.actual_departure_ts}
              </Moment>
            </div>
          )}
        </div>
      </Popup>
    )
  );
};

export default React.memo(StopToolTip);
