import styled from 'styled-components';

export const ParcelLabel = styled.div`
  color: #96979a;
  font-family: 'AvenirNext-DemiBold';
  margin-bottom: 5px;
`;
export const InputWrapper = styled.div`
  border-radius: 3px;
  border: solid 1px #cecece;
  width: 82px;
  padding: 2px 15px 2px 4px;
  position: relative;
  box-sizing: border-box;
  font-size: 11px;
`;
export const InputNoPadding = styled.div`
  border-radius: 3px;
  border: solid 1px #cecece;
  width: 103px;
  padding: 2px;
  position: relative;
  box-sizing: border-box;
  font-size: 11px;
`;
export const Unit = styled.span`
  position: absolute;
  right: 5px;
  top: 2px;
  color: #b0b0b0;
`;
export const Select = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  background: transparent;
  background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position-x: 100%;
  padding: 4px 20px 3px 5px;
  border-radius: 3px;
  font-size: 11px;
  font-family: AvenirNext;
  border: 1px solid #cecece;
  text-transform: capitalize;
`;
export default {
  disabled: {
    position: 'absolute',
    width: '100%',
    top: '0',
    height: '100%',
    backgroundColor: 'gray',
    opacity: '0.8',
    zIndex: '2',
  },
  firstCol: {
    flex: '3',
  },
  inputWeight: {
    width: '47px',
  },
  input: {
    border: 'none',
    width: '100%',
    fontFamily: 'AvenirNext',
  },
  colWide: {
    flex: '2',
  },
  normalCol: {
    paddingLeft: '10px',
  },
  typeIconWrapper: {
    position: 'absolute',
    left: '0',
    top: '-5px',
  },
  typeIcon: {
    width: '22px',
    height: '23px',
    objectFit: 'contain',
  },
  parcelLabel: {
    marginRight: '5px',
    position: 'relative',
  },
  btnDownload: {
    cursor: 'pointer',
    backgroundColor: '#fff',
    borderRadius: '3px',
    fontFamily: 'AvenirNext',
    fontSize: '10px',
    border: '1px solid #aba5ff',
    lineHeight: '10px',
    padding: '6px 4px 4px 20px',
    position: 'relative',
    color: '#aba5ff',
  },
  btnTrash: {
    cursor: 'pointer',
    borderRadius: '3px',
    border: 'none',
    position: 'relative',
    color: '#aba5ff',
  },
  labelIcon: {
    width: '14px',
    height: '14px',
    position: 'absolute',
    left: '3px',
    top: '3px',
    bottom: '0',
    objectFit: 'contain',
  },
  parcelContent: {
    fontFamily: 'AvenirNext',
    borderTop: '1px solid #ebebeb',
    paddingTop: '10px',
    margin: '10px 10px 0 5px',
  },
  type: {
    textTransform: 'capitalize',
  },
  panelHeaderTitle: {
    fontFamily: 'AvenirNext',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
    paddingLeft: '30px',
    position: 'relative',
    flex: 1,
  },
  parcelContainer: {
    borderRadius: '5px',
    backgroundColor: '#fff',
    padding: '10px',
    marginBottom: '15px',
    width: '100%',
  },
  panelHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  panelHeaderRight: {
    display: 'flex',
    flexDirection: 'row',
    flex: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelHeaderArrow: {
    cursor: 'pointer',
    fontSize: 30,
    color: '#bebfc0',
    margin: '0 5px',
  },
};
