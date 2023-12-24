import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
export const ListBoxChat = styled.div`
  flex: 1;
  overflow: hidden;
  padding: 10px 0 0;
`;
export const Inner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const Title = styled.div`
  font-family: 'AvenirNext-DemiBold';
  font-size: 20px;
  font-weight: 600;
  color: #4a4a4a;
  text-align: left;
  padding: 0 25px;
  margin: 20px 0 0;
`;
export const ChatInformation = styled.div`
  font-family: 'AvenirNext-Medium';
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  color: #b6b6b6;
  padding: 10px 0;
`;
export const TimeLineChat = styled(ChatInformation)`
  font-style: italic;
`;
export const ChatFormContainer = styled.div``;
export const Scrollable = styled.div`
  overflow-y: scroll;
  height: calc(100% - 28px);
  padding: 0 20px;
`;
export const LoadingContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

export const NoMessage = styled(LoadingContainer)`
  height: 100%;
`;
export const MapContainer = styled.div`
  height: 200px;
`;
export const HistoryPanelDetailContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;
export const ModalImageContainer = styled.div`
  width: 100%;
  height: 100%;
`;
export const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

export const PanelContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  width: 100%;
`;

export const PanelInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

export const PanelFlyInner = styled.div`
  overflow: hidden;
`;

export const CreatMessage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CreateText = styled.div`
  font-family: 'AvenirNext-Medium';
  font-size: 20px;
  color: #737273;
  cursor: pointer;
`;

export default {
  scrollable: {
    overflowY: 'scroll',
    height: 'calc(100% - 15px)',
    padding: '0 20px'
  },
  historyPanelStyle: {
    height: '100%',
    padding: 20,
    maxHeight: 'calc(100% - 60px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  activeChatboxPanelStyle: {
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalFile: {
    maxWidth: '100%',
    height: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px',
    overflow: 'hidden'
  },
  modalSendFile: {
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px',
    overflow: 'hidden'
  },
}