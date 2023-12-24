import React from "react";
import * as M from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import {Container, Scroll, SimpleBox, ModalBox, CloseButton, BorderBox, NoScroll} from "./style";
import {useTheme} from "@material-ui/core";
import _ from "lodash";

export function AxlMUIBox({noscroll = false, ...props}) {
  return(<Container {...props}>
    {noscroll ? (
      <NoScroll height={1}>
        {props.children}
      </NoScroll>
    ) : (
      <Scroll>
        <M.Box>
          {props.children}
        </M.Box>
      </Scroll>
    )}
  </Container>);
}

export function AxlMUISimpleBox({bgcolor, children, square = false, ...props}) {
  return(children ? <SimpleBox square={square} bgcolor={`${bgcolor || 'primary.grayFourth'}`} {...props}>
    {children}
  </SimpleBox> : null);
}

export function AxlMUIBorderBox({children, ...props}) {
  const theme = useTheme();

  return(children ? <BorderBox {...props}>
    {children}
  </BorderBox> : null);
}

export function AxlMUIModalBox({
  bgcolor,
  onClose,
  children,
  closeTheme = 'main',
  ...props
}) {
  return(children ? <ModalBox elevation={props.elevation || 3} bgcolor={`${bgcolor || 'primary.white'}`} {...props}>
    {onClose && <CloseButton aria-label="delete" theme={closeTheme} onClick={onClose} />}
    {children}
  </ModalBox> : null);
}