import React, { Fragment, useState } from 'react'

import { Box, Grid, IconButton, Link, Typography } from '@material-ui/core'
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import AxlDialog from '../AxlDialog';

const ContainerInfo = ({children}) => <Box bgcolor={'#E4E3FC'} borderRadius={4} p={1} mb={2}>{children}</Box>
const LabelInfo = ({label, limitLine, handleShowMore, value}) => (
  <Box mb={limitLine ? 1 : 0} display={'flex'} justifyContent={limitLine ? 'space-between' : 'flex-start'}>
    <Typography style={{color: '#838383', fontWeight: 500}}>{label}</Typography>
    {limitLine && <Link onClick={limitLine ? () => handleShowMore(label, value) : null} style={{cursor: 'pointer', fontSize: 14}}>show more</Link>}
  </Box>
)

const ValueInfo = ({value, limitLine}) => (<Typography style={{
  color: '#4A4A4A', 
  fontWeight: 500, 
  WebkitBoxOrient: 'vertical', 
  WebkitLineClamp: 1,
  lineClamp: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...(limitLine && {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  lineClamp: 2,
})}}>{value}</Typography>)

const Info = ({items, fn, limitLine, handleShowMore}) => (
  <ContainerInfo>
    <Box display={'flex'} flexDirection={'column'} style={{gap: 8}}>
      {items.map((code, idx) => (
        <Box key={idx} display={'flex'} flexDirection={'column'}>
          <LabelInfo label={code.label} limitLine={limitLine} handleShowMore={handleShowMore} value={code.value}/>
          <ValueInfo value={typeof fn === 'function' ? fn(code.value) : code.value} limitLine={limitLine}/>
        </Box>
      ))}
    </Box>
  </ContainerInfo>
)

function DropoffInfo({stopInfo, shipmentMap, geocodeAddressMap}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');

  const {dropoff_info_groups} =  stopInfo;
  const sectionCodes = dropoff_info_groups && dropoff_info_groups.length > 0 && dropoff_info_groups.find(dig => dig.group_id === 'access_code');
  const sectionDropoffInstruction = dropoff_info_groups && dropoff_info_groups.length > 0 && dropoff_info_groups.find(dig => dig.group_id === 'dropoff_instruction');
  const sectionDropoffPreference = dropoff_info_groups && dropoff_info_groups.length > 0 && dropoff_info_groups.find(dig => dig.group_id === 'dropoff_preference');
  const sectionDispatchNotes = dropoff_info_groups && dropoff_info_groups.length > 0 && dropoff_info_groups.find(dig => dig.group_id === 'dispatch_note');
  const metadataDeliveryReason = stopInfo && stopInfo.metadata && stopInfo.metadata.DELIVERY_REASON && stopInfo.metadata.DELIVERY_REASON.SUCCEEDED;
  const suggestedCodes = geocodeAddressMap[shipmentMap.dropoff_geocoder_id] && geocodeAddressMap[shipmentMap.dropoff_geocoder_id].suggested_access_codes;
  const isExistCode = sectionCodes && sectionCodes.items && sectionCodes.items.length > 0;
  
  const getTitleByCode = (code) => {
    const findByCode = metadataDeliveryReason.find(f => f.code === code);
    return findByCode ? findByCode.title : '';
  }

  const handleShowMore = (label, content) => {
    setIsShowMore(!isShowMore);
    setLabel(label);
    setContent(content);
  }

  return (
    <Fragment>
      <ContainerInfo>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Grid container spacing={isExistCode ? 1 : 0} style={{maxWidth: '90%'}}>
            {isExistCode ? sectionCodes.items.map((code, idx) => (
              <Fragment key={idx}>
                <Grid item xs={4}>
                  <LabelInfo label={code.label}/>
                </Grid>
                <Grid item xs={8}>
                  <ValueInfo value={code.value}/>
                </Grid>
              </Fragment>
            )) : (
              <Grid item xs={4}>
                <Typography style={{color: '#838383', fontWeight: 500}}>Access Code</Typography>
              </Grid>
            )}
          </Grid>

          <IconButton size='small' onClick={() => setIsOpen(true)}>
            <MoreHorizOutlinedIcon/>
          </IconButton>
        </Box>
      </ContainerInfo>

      {sectionDropoffPreference && sectionDropoffPreference.items && sectionDropoffPreference.items.length > 0 && (
        <Info items={sectionDropoffPreference.items} fn={getTitleByCode} handleShowMore={handleShowMore} limitLine={true} />
      )}

      {sectionDropoffInstruction && sectionDropoffInstruction.items && sectionDropoffInstruction.items.length > 0 && (
        <Info items={sectionDropoffInstruction.items} handleShowMore={handleShowMore} limitLine={true}/>
      )}

      {sectionDispatchNotes && sectionDispatchNotes.items && sectionDispatchNotes.items.length > 0 && (
        <Info items={sectionDispatchNotes.items} handleShowMore={handleShowMore} limitLine={true}/>
      )}

      {isOpen && (
        <AxlDialog
          isOpen={isOpen}
          maxWidth='xs'
          handleClose={() => setIsOpen(false)}
          childrenTitle={"Access code addition request"}
          children={<Box>
            <Typography style={{color: '#4A4A4A', textTransform: 'uppercase', fontSize: 16, fontWeight: 500, marginBottom: 8}}>All available access codes</Typography>
            <Typography>{suggestedCodes && suggestedCodes.join(", ")}</Typography>
          </Box>}
        />
      )}

      {isShowMore && (
        <AxlDialog
          maxWidth='xs'
          isOpen={isShowMore}
          dividers={false}
          handleClose={() => handleShowMore("", "")}
          isShowClose={false}
          children={<Box minHeight={200}>
            <Box display={'flex'} justifyContent={'space-between'} mb={1}>
              <Typography style={{color: '#838383', fontWeight: 500}}>{label}</Typography>
              <Link onClick={() => handleShowMore("", "")} style={{cursor: 'pointer', fontSize: 14}}>show less</Link>
            </Box>
            <Box bgcolor={'#E4E3FC'} color={'#4A4A4A'} p={2} borderRadius={4}>{content}</Box>
          </Box>}
        />
      )}
    </Fragment>
  )
}

export default DropoffInfo