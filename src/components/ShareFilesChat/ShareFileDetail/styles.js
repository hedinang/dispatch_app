import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;
export const ImageContainer = styled.div`
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;
`;
export const Image = styled.img`
  width: 100%;
  height: auto;
`;
export const DownloadContainer = styled.div`
  display: flex;
  align-self: flex-end;
  padding-right: 20px;
  margin: 10px 0;
`;
export const DownloadButton = styled.button`
  border: none;
  background: none;
  font-size: 25px;
  cursor: pointer;
`;
export const DownloadButtonImage = styled.img`
  width: 21px;
  max-width: 100%;
`;

export default {

}