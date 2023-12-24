import React, { useState, useCallback, useEffect } from 'react';
import * as M from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';

import ListBoxChat from '../ListBoxChat';
import AxlButton from "../Button";

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    height: '100%',
    flexWrap: 'nowrap',
    flexDirection: 'column',
  },
  controls: {
    display: 'flex',
    alignContent: 'flex-start',
    flexDirection: 'row',
    width: '100%',
    overflowX: 'scroll',
  },
  lists: {},
}));

const ChatBox = (props) => {
  const { listMsg, checkToLoadMore, user, id } = props;
  const classes = useStyles();
  return (
    <M.Box height={1}>
      <M.Grid container className={classes.container}>
        <M.Grid xs={12} item container direction={'row'} style={{ overflow: 'hidden' }}>
          <M.Grid xs item container direction={`column`} wrap={`nowrap`} style={{ height: '100%' }}>
            <M.Grid xs={12} item style={{ overflow: 'hidden' }}>
              <ListBoxChat
                user={user}
                listMsg={listMsg}
                checkToLoadMore={checkToLoadMore} />
            </M.Grid>
          </M.Grid>
        </M.Grid>
        {!!listMsg.length && <M.Box align={'center'} pb={1}>
          <AxlButton
            style={{padding: '5px 15px'}}
            variant="outlined"
            color={`primary.gray`}
            bgcolor={`primary.main`}
            href={`${process.env.REACT_APP_SUPPORT_URL}/messages/${id}`} target={`_blank`}>{`Goto Chat`}</AxlButton>
        </M.Box>}
      </M.Grid>
    </M.Box>
  );
};
export default React.memo(ChatBox);
