import { Colors } from 'axl-reactjs-ui';

export default {
  container:{
    padding:'15px',
    paddingLeft:'20px',
    height:'100%',
    backgroundColor:'transparent',
    boxSizing: 'border-box',
    overflowY: 'scroll',
  },
  grayLine1:{
    borderRadius: '4px',
    boxShadow: '0.5px 0.5px 0.5px 0 rgba(0, 0, 0, 0.5)',
    height: '0.5px',
    backgroundColor: '#ffffff',
    margin:'15px 20px 15px 20px',
  },
  grayLine2:{
    borderRadius: '4px',
    boxShadow: '0.5px 0.5px 0.5px 0 rgba(0, 0, 0, 0.5)',
    height:'1px',
    backgroundColor: '#ffffff',
    margin:'0px 20px 15px 20px'
  },
  reattemptWrap:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center'
  },
  reattemptText:{
    fontFamily: 'AzoSans',
    fontSize:'14px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.12px',
    color: '#8d8d8d'
  },
  reattemptNumber:{
    marginLeft:'3px',
    marginRight:'3px',
    fontFamily: 'AzoSans',
    fontSize:'14px',
    fontWeight: 'bold',
    color: '#5a5a5a'
  },
  timeWrap:{
    display:'flex',
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between'
  },
  timeColumnWrap:{
    display:'flex',
    alignItems:'start',
    flexDirection:'column',
    marginTop:'15px'
  },
  timeTitleText:{
    fontFamily: 'AzoSans',
    fontSize: '12px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.12px',
    color: '#8d8d8d'
  },
  timeText:{
    marginTop:'5px',
    fontFamily: 'AzoSans',
    fontSize: '13px',
    fontWeight: '500',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.14px',
    color: '#5a5a5a'
  },
  titleWrap:{
    display:'flex',
    flexDirection:'row',
    backgroundColor:'transparent'
  },
  titleText:{
    fontFamily: 'AvenirNext-Bold',
    fontSize: '18px',
    fontWeight: '500',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.06px',
    textAlign: 'center',
    color: '#4a4a4a',
  },
  subTitleText:{
    fontFamily: 'AvenirNext-Bold',
    fontSize: '16px',
    fontWeight: '500',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.06px',
    textAlign: 'left',
    color: '#4a4a4a',
  }
}
