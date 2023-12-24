import React, {useEffect, useState} from 'react';
import {
  ThemeProvider,
  ButtonGroup, IconButton, Box, ClickAwayListener, Grow, Paper, Popper, MenuList, Checkbox, Button, Radio, Typography, MenuItem
} from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import {mainTheme, lightTheme, primaryTheme} from "./themes";
import useStyles, * as S from './styles';
import ClearIcon from '@material-ui/icons/Clear';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import AxlMUIInput from "../AxMUIInput";
import colors from "../../../themes/colors";

const mapToTheme = {
  light: lightTheme,
  main: mainTheme,
  primary: primaryTheme,
};

export default function AxlMUISelect({
  theme = 'main',
  search = true,
  fullWidth = false,
  checkbox = true,
  clear = true,
  single = false,
  showAll = false,
  onChange = () => {},
  defaultChecked = null,
  placeholder = 'Select value',
  searchPlaceholder = 'Search here...',
  placeholderSize = 14,
  spacing = 0,
  ...props
}) {
  // style
  const classes = useStyles();
  // global
  const anchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [checkedValues, setCheckedValues] = useState([]);
  const [options, setOptions] = useState(props.options || []);
  // Defined
  const _isValues = options.filter(option => _.includes(checkedValues, option.value)).map(op => op.label);
  const _isShow = _isValues.length ? (showAll ? _isValues.join(", ") : `${_isValues.length} selected`) : placeholder;

  function handleCheck(checkedName) {
    let newNames = [];
    if(single) {
      newNames = [checkedName];
    } else {
      newNames = checkedValues.includes(checkedName)
        ? checkedValues.filter(name => name !== checkedName)
        : [...(checkedValues || []), checkedName];
    }
    setCheckedValues(newNames);
    if(onChange)
      onChange(newNames);
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOptions(props.options);
    setOpen(false);
  };

  const onSearch = ({ target: { value } }) => {
    const search = _.debounce((v) => {
      let newItems = props.options;
      if(v) {
        newItems = _.filter(options, (option) => _.includes(option.label.toLowerCase(), v.trim().toLowerCase()));
      } else {
        newItems = props.options;
      }
      setOptions(newItems)

  }, 300);

    search(value);
  };

  const clearValues = () => {
    setCheckedValues([]);
    setOptions(props.options);
    onChange([])
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);

  useEffect(() => {
    if (anchorRef && anchorRef.current && prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    setOptions(props.options)
  }, [props.options]);

  useEffect(() => {
    setCheckedValues([defaultChecked].filter(a => a));
  }, [defaultChecked]);

  return (
    <ThemeProvider theme={mapToTheme[theme]}>
      <Box m={spacing} display={'flex'} alignItems={'center'}>
        {props.trigger ? <Box ref={anchorRef} onClick={handleToggle}>{React.cloneElement(props.trigger)}</Box> :
          <Button
            fullWidth={fullWidth}
            style={checkedValues.length ? {borderColor: colors.periwinkle} : {}}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}>
            <Typography style={{fontSize: placeholderSize, flex: 1}}
            dangerouslySetInnerHTML={{ __html: _isShow }}/>
            {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </Button>}
        {clear && <IconButton className={[classes.iconButton, classes.clearButton]} onClick={clearValues}>
          <ClearIcon fontSize={'small'} />
        </IconButton>}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          style={{
            zIndex: 9999,
            maxHeight: 'calc(100vh - 20px)',
            overflowY: 'scroll',
          }}>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocus={false}
                      autoFocusItem={false}>
                      {search && <Box>
                        <AxlMUIInput onChange={onSearch} placeholder={searchPlaceholder} />
                      </Box>}
                      {options.map((option, idx) => <S.MenuItem
                        key={idx}
                        onClick={() => handleCheck(option.value)}>
                        {
                          checkbox ?
                            !single ? <Checkbox
                                key={idx}
                                value={option.value}
                                checked={_.includes(checkedValues, option.value)}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                              /> : <Radio
                                      checked={_.includes(checkedValues, option.value)}
                                      value={option.value}/> : null
                        }
                        <S.Text dangerouslySetInnerHTML={{__html: `${option.label}`}} />
                      </S.MenuItem>)}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
      </Box>
    </ThemeProvider>
  );
}
