import React, { Fragment, useEffect, useState } from 'react'

import { Box } from '@material-ui/core';
import moment from 'moment-timezone';
import Mustache from 'mustache';
import { compose } from 'recompose';
import { inject } from 'mobx-react';
import { useHistory } from 'react-router-dom';

import { lowerCase, upperCase, removeDash, replaceDash, convertMeterToMileString, convertSecondToHour, objectList, splitText, 
  capitalizeText, getDotColor, formatDateTime, renderLocation, compareObject
} from '../../Utils/events';
import HistoryEventJson from '../EventTemplates/HistoryEventJson';
import styles from './styles';

function MutacheEvent({eventMap, isWithoutSecond = false, locationStore}) {
  const [isShowModal, setIsShowModal] = useState(false);
  const [originViewMode, setOriginViewMode] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const selectorHoverMaps = document.querySelectorAll('.show-map-marker');
    selectorHoverMaps.forEach(ele => {
      const lat = ele.getAttribute('data-lat');
      const long = ele.getAttribute('data-long');
      ele.addEventListener('mouseenter', () => handleOnMouse(lat, long))
      ele.addEventListener('mouseleave', () => handleOnMouse(null, null))
    })

    const selectorClick = document.querySelectorAll('.template-click');
    selectorClick.forEach(ele => {
      const action = ele.getAttribute('data-action');
      const relID = ele.getAttribute('data-relID');
      const objectID = ele.getAttribute('data-objectID');
      ele.addEventListener('click', () => handleClickEvent(action, relID, objectID))
    })

    return () => {
      selectorHoverMaps.forEach(ele => {
        ['mouseenter', 'mouseleave'].map(event => ele.removeEventListener(event, () => handleOnMouse(null, null)))
      })

      selectorClick.forEach(ele => {
        ele.removeEventListener('click', () => handleClickEvent(null, null, null))
      })
    }
  }, [eventMap])

  const handleClickEvent = (action, relID, objectID) => {
    if(['void', 'discard', 'set_eta', 'book_eta', 'unbook_eta'].includes(action)) {
      const bookingSession = relID && relID.startsWith("BS_") ? relID : objectID;
      const ticketId = objectID && objectID.startsWith("TK_") ? objectID.replace("TK_", "") : "";

      history.replace(`/ticket-booking/${bookingSession}/ticket/${ticketId}/history`)
    }
  }

  const onViewDetail = (e) => {
    setIsShowModal(true)
    setSelectedEvent(e)
  }

  const handleToggleModal = (v) => {
    setIsShowModal(v)
  }

  const onViewMode = (key) => {
    if (originViewMode) {
      setOriginViewMode(false)
      setSelectedEvent(eventMap.get(key).converted)
    } else {
      setOriginViewMode(true)
      setSelectedEvent(eventMap.get(key).origin)
    }
  }

  const handleOnMouse = (lat, long) => {
    if (!lat || !long) {
      locationStore && locationStore.updateLocation(null);
      return;
    }

    locationStore && locationStore.updateLocation([long, lat]);
  }

  return (
    <Fragment>
      <div style={styles.innerItems}>
        <div style={styles.line}></div>
        {Array.from(eventMap.values()).map(({ origin, converted, template }, idx) => {
          if (converted.date) {
            return <div style={styles.item} key={idx}>
              <Box display={'flex'}>
                <div style={{flex: 1, position: 'relative'}}>
                  <div style={styles.lineDate}/>
                </div>
                <div style={{width: 200, textAlign: 'center'}}>
                  <span style={styles.date}>
                    {converted.date}
                  </span>
                </div>
                <div style={{flex: 1, position: 'relative'}}>
                  <div style={styles.lineDate}/>
                </div>
              </Box>
            </div>
          } else {
            const rendered = Mustache.render(template.content, { ...converted, ...origin,lowerCase, upperCase, removeDash, replaceDash, 
              objectList, convertMeterToMileString, convertSecondToHour, splitText, capitalizeText, formatDateTime, renderLocation, compareObject });
            return <div style={styles.item} key={idx}>
              <div style={styles.inner} className='item'>
                <div style={{...styles.car, backgroundColor: getDotColor(template.color, origin) || '#ccc' }} onClick={() => onViewDetail(origin)}/>
                <Box display={'flex'} flex={1} justifyContent={'space-between'} fontSize={12} fontFamily={'AvenirNext'} color={'rgb(74,74,74)'} lineHeight={1.7}>
                  <div style={styles.notes} dangerouslySetInnerHTML={{ __html: rendered }}  data-testid="event-content"/>
                  {isWithoutSecond && origin.ts && <div style={styles.time}>{moment.tz(origin.ts, moment.tz.guess()).format('hh:mm A z')}</div>}
                  {!isWithoutSecond && origin.ts && <div style={styles.time}>{moment.tz(origin.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
                </Box>
              </div>
            </div>
          }
        })}
      </div>
      <HistoryEventJson
        isShowModal={isShowModal}
        event={selectedEvent}
        handleToggleModal={(v) => handleToggleModal(v)}
        originViewMode={originViewMode}
        onViewMode={onViewMode}
        setOriginViewMode={setOriginViewMode}
      />

      {/* {showDriverProfile && driverData && (
        <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
          <DriverProfileInformation driver={driverData} />
          <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
        </AxlModal>
      )} */}
    </Fragment>
  )
}

export default compose(inject('locationStore'))(MutacheEvent)
