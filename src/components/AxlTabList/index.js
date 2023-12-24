import { AppBar, Tab } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import React from 'react'

function AxlTabList(props) {
  const {value, onChange, className, tabList, children, classes, ...otherProps} = props;
  const activeTab = tabList && tabList.find(tab => tab.value === value);

  return (
    <TabContext value={value}>
      <AppBar position="static" className={className && className.appBar}>
        <TabList onChange={onChange} className={className && className.tabs} {...otherProps}>
          {tabList && tabList.map(tab => (
            <Tab label={tab.label} value={tab.value} classes={classes && classes.tab} key={tab.value}/>
          ))}
        </TabList>
      </AppBar>
      <TabPanel value={value} className={className && className.tabPanel}> { activeTab && activeTab.tabPanelComponent }</TabPanel>
    </TabContext>
  )
}

export default AxlTabList