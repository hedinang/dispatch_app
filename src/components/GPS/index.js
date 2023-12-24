import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import DirectionsIcon from '@material-ui/icons/Directions';

export function Copiable({txt, style, children}) {
    return <span onClick={() => {navigator.clipboard.writeText(txt || children)}} style={{...style, cursor: 'pointer'}}>{children || txt}</span>
}

const GpsLocation = inject("locationStore")(observer(({locationStore, geolocation, size, google, style, hideNumber, children}) => {
    const { latitude, longitude } = geolocation || {}
    const setPin = (ll) => locationStore && locationStore.updateLocation && locationStore.updateLocation(ll)
    // const setCenter = useSetRecoilState(mapCenterState)
    if (!latitude) return <React.Fragment></React.Fragment>
    const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14
    const margin = size === 'sm' ? 28 : size === 'lg' ? 50 : 40
    return <span onMouseOver={() => { setPin([parseFloat(longitude), parseFloat(latitude)])} }
                onMouseOut = {() => { setPin(null)}}
                // onClick={() => { setCenter({lat: parseFloat(lat), lng: parseFloat(lng)}); navigator.clipboard.writeText(`${parseFloat(lat).toFixed(5)},${parseFloat(lng).toFixed(5)}`) } }
                style={{display: 'inline-block', cursor: 'pointer', position: 'relative', fontSize: fontSize, paddingLeft: 0, border: 'solid 1px #e8e8e8', margin: 0, borderRadius: 5, backgroundColor: '#fff', ...style}}>
        <div style={{position: 'absolute', pointerEvents: 'none', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, left: 0, top: 0, bottom: 0, backgroundColor: '#f8f8f8', padding: 3, color: '#5a5a5a' }}>
            <Copiable txt={`${parseFloat(latitude).toFixed(4)},${parseFloat(longitude).toFixed(4)}`}>GPS</Copiable>
        </div>
        <span style={{pointerEvents: 'none', marginLeft: margin}}>
            {!hideNumber && <Copiable txt={`${parseFloat(latitude).toFixed(4)},${parseFloat(longitude).toFixed(4)}`} /> }
        </span>
        { google && <a href={`https://maps.google.com?q=${latitude},${longitude}`} rel="noreferrer" target="_blank"><DirectionsIcon style={{marginBottom: -5, marginLeft: 3}} fontSize='small' color='disabled' /></a>}
        { children }
    </span>
}))

export default GpsLocation