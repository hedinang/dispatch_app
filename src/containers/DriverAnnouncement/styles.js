import styled from "styled-components";
import { Colors } from 'axl-reactjs-ui';

export const Text_1 = styled.div`
  font-size: 12px;
  font-weight: normal;
  padding: 8px 20px;
  border: 1px solid #b9b9b9;
  border-radius: 5px;
  text-transform: uppercase;
  color: #b9b9b9;
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center; 
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Flex = styled.div`
  flex: 1;
`;

export const Poll = styled.div`
  margin-bottom: 15px;
`;

export const PollItem = styled.label`
  flex: 1;
  padding: 10px 5px;
  margin: 0 0 10px 0;
  background: #d6d8da;
  border-radius: 10px;
  border: 1px solid #9e9d9d;
  cursor: pointer;
  &:hover {
    border: 1px solid #7b7878;
  }
`;

export const PollList = styled.div`
  text-align: left;
  margin-top: 15px;
`;

export const DatePoll = styled.div`
  margin-bottom: 30px;
`;

export const SaveButtonWrap = styled.div`
  text-align: right;
`;

export default {
  formWrapper: {
    paddingBottom: '20px'
  },
  formLabel: {
    fontSize: '14px',
    color: '#9b9b9b',
    lineHeight: 1.71,
    paddingBottom: '5px'
  },
  actionItem: {
    paddingLeft: '5px',
    fontSize: '16px'
  },
  searchBar: {
    padding: '5px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    marginTop: 0,
    marginBottom: 0
  },
  modalListStyle: {
    position: 'absolute',
    overflow: 'auto',
    top: '20px',
    bottom: '60px',
    left: '8px',
    right: '8px',
  },
  mediaTypeOption: {
    padding: '6px 12px',
    borderRadius: 6,
    fontWeight: 'normal',
    color: '#ccc',
    cursor: 'pointer',
    display: 'none'
  },
  mediaTypeOptionSelected: {
    padding: '6px 12px',
    borderRadius: 6,
    border: 'solid 1px #ccc',
    fontWeight: 'bold',
    backgroundColor: '#f8f8f8'
  },
  searchBox: {
    height: 32,
  }
}
