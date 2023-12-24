import { Box, CircularProgress } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import React from 'react'
import { Redirect, Route } from 'react-router-dom';
import { compose } from 'recompose';

function RolesAuthRoute(props) {
    const {roles, children, userStore, path} = props;
    
    const canAccess = userStore && userStore.user && userStore.user.scopes && userStore.user.scopes.some(userRole => roles.includes(userRole));

    if(!userStore.isFetchedUser) {
        return (
            <Box display="flex" alignItems={'center'} justifyContent={'center'} style={{height: '100vh', width: '100%'}}>
                <CircularProgress size={75} thickness={2} />
            </Box>
        )
    }

    return (
        <Route
          path={path}
          render={() =>
            canAccess ? (
              children
            ) : (
              <Redirect to={{ pathname: "/" }} />
            )
          }
        />
    );
}

export default compose(
    inject('userStore'),
    observer
  )(RolesAuthRoute);