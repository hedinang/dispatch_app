import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  position: relative;
`;
export const Top = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 25px;
`;
export const Main = styled.div`
  flex: 1;
  overflow: hidden;
`;
export const Bottom = styled.div``;
export const MapContainer = styled.div`
  height: 200px;
`;
export const HistoryPanelDetailContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export default {
  historyPanelStyle: {
    height: '100%',
    padding: 20,
    maxHeight: 'calc(100% - 60px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }
}