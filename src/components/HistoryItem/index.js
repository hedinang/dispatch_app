import React, { Fragment, useState } from 'react'

import HistoryEventJson from '../HistoryEventJson'
import colors from '../../themes/colors';

const Dot = ({color, onClick, dotLeft}) => <div onClick={() => onClick()} style={{position: 'absolute', top: 7, left: dotLeft, width: 7, height: 7, borderRadius: '50%', cursor: "pointer", backgroundColor: color}}/>

const statusColor = (s) => {
    if (!s) return colors.grayMain
    if (['SUCCEEDED', 'GEOCODED', 'DROPOFF_SUCCEEDED', 'RECEIVED_OK', 'SUCCESSED'].indexOf(s) >=0 ) return colors.lightGreen
    if (['EN_ROUTE', 'COMING_SOON'].indexOf(s) >=0 ) return colors.main
    if (['READY', 'transaction', 'update-bonus'].indexOf(s) >=0 ) return colors.lightOrange
    if (['FAILED', 'GEOCODE_FAILED', 'DROPOFF_FAILED', 'PICKUP_FAILED'].indexOf(s) >=0 ) return colors.darkRed
    
    if (['book', 'activate', 'accept-route'].indexOf(s) >=0 ) return colors.green
    if (['finish', 'add-redelivery'].indexOf(s) >=0 ) return colors.lightBlue
    if (['un-book', 'unassign', 'unassign_dsp', 'split_assignment', 'deactivate', 'un-route'].indexOf(s) >=0 ) return colors.red
    if (['assign', 'assign_dsp', 'check-in', 'create'].indexOf(s) >=0 ) return colors.bluish
    if (['DATE', 'activate', 'STARTED'].indexOf(s) >=0 ) return colors.grayThird

    if (['CREATED', 'ASSIGNED'].indexOf(s) >=0 ) return colors.grayThirteenth
    if (['PICKUP_SUCCEEDED', 'PICKUPED'].indexOf(s) >=0 ) return colors.periwinkle
    if (['ROUTED', 'PICKUP_READY', 'DROPOFF_READY'].indexOf(s) >=0 ) return colors.maize
    if (['payment'].indexOf(s) >=0 ) return colors.yellowTwo
    return colors.grayMain
}

function HistoryItem({children, status, event, dotLeft = 0}) {
  const [isShowModal, setIsShowModal] = useState(false);

  const handleToggleModal = (value) => {
    setIsShowModal(value)
  }

  return (
    <Fragment>
        <Dot color={statusColor(status)} onClick={() => handleToggleModal(true)} dotLeft={dotLeft} />
        {children}

        {isShowModal && <HistoryEventJson isShowModal={isShowModal} event={event} handleToggleModal={(v) => handleToggleModal(v)} />}
    </Fragment>
  )
}

export default HistoryItem