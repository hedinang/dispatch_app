import { Colors } from 'axl-reactjs-ui';

export default {
    container: {
        paddingBottom: '50px',
        textAlign: 'left'
    },
    statusBox: {
        float: 'right'
    },
    body: {
        position: 'absolute',
        bottom: '70px',
        left: 0,
        right: 0,
        top: 0,
        overflowY: 'scroll'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        boxSizing: 'border-box',
        padding: '5px 10px 5px 10px',
        backgroundColor: Colors.veryLightGrey,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    groupButtons: {
        minWidth: 100
    },
    modalContainer: {
        display: 'flex'
    },
    modalStyle: {
        width: '480px',
        display: 'block',
        overflow: 'initial',
        backgroundColor: 'transparent',
        margin: 'auto',
        boxShadow: 'none'
    },
    modalImageStyle: {
        width: '650px',
        backgroundColor: '#FFF',
        padding: '30px 0'
    },
    wrapImages: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 9999
    },
    imageShipment: {
        width: 'auto',
        maxWidth: '100%',
        // maxHeight: '100%',
        maxHeight: 'calc(100vh - 100px)',
        margin: 'auto',
        backgroundColor: '#FFFF'
    },
    arrowButton: {
        width: '30px',
        height: '30px',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        margin: 'auto',
        zIndex: 10000,
        cursor: 'pointer'
    },
    arrowPrev: {
        left: 0
    },
    arrowNext: {
        right: 0
    },
    arrowIcon: {
      fontSize: '25px',
      color: '#fff'
    },
    verify: {
      height: '32px',
      borderRadius: '3px',
      backgroundColor: '#fff',
      color: 'rgb(170, 170, 170)',
      fontSize: '13px',
      lineHeight: '32px',
      padding: '0px 10px',
      minWidth: 100,
      textAlign: 'center',
      flexShrink: 0,
    },
    modalVerifyStyle: {
      width: '1200px',
      display: 'block',
      overflow: 'initial',
      backgroundColor: 'transparent',
      margin: 'auto',
      boxShadow: 'none',
    },
    slideTitle: {
      textAlign: 'center',
      width: '100%',
      display: 'block',
      color: '#887fff;',
    },
    verifedContent: {
      width:'100%',
      height:352,
      margin: '0px auto',
      boxShadow: "1.5px 0.5px 4px 0 rgba(0, 0, 0, 0.23)", 
      border: "solid 0.5px var(--pinkish-grey)"
    },
    verfiedImage: {
      width: '100%',
      height: 'auto',
    },
    verfiedImageItem: {
      width: '60px', 
      display: 'inline-block', 
      margin: '0px 7px',
      borderRadius: '2px',
      border: 'solid 0.5px #979797',
      backgroundColor: '#d8d8d8',
      position: 'relative',
      cursor: 'pointer'
    },
    verfiedImageIcon: {
      position: 'absolute',
      bottom: 0,
      left: 3,
      width: 20
    },
    verfiedLink: {
      width: '100%',
      textAlign:'center',
      fontWeight: 'bold',
      color: '#989798',
      fontSize: '14px',
      border: '1px solid #989798',
      padding: '11px 20px',
      borderRadius: '5px',
      margin: '0px auto',
    },
    label: {
        margin: '5px 0',
    }
}
