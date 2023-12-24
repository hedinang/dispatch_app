import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import _ from 'lodash';
import moment from 'moment';
import React, { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { toastMessage } from '../../constants/toastMessage';
import { isNumeric } from '../../Utils/number';

import InputNumber from '../InputNumber';
import Map from '../Map';

const DEFAULT_BOOK_STATE = {
    maxOCAC: '',
    minOCAC: '',
    minTourCost: '',
    maxTourCost: '',
    minShipment: '',
    maxShipment: '',
    zoneId: '',
    boundary: '',
    warehouseId: '',
    warehouse: undefined,
}

function ModalAddOrEditTicketBook({open, handleClose, bookingStore, ...props}) {
    const convertWarehouse = props.warehouses !== undefined && props.warehouses.map(wh => {
        return {
            value: wh.id,
            label: `[${wh.id}] ${wh.alias ? wh.alias + ' @ ' : ''}${wh.address.street}, ${wh.address.street2 && wh.address.street2 != '' ? ` ` + wh.address.street2 + `, ` : ''}${wh.address.city}, ${wh.address.state}, ${wh.address.zipcode}`,
            lat: wh.address.lat,
            lng: wh.address.lng,
        }
    })
    const {tour_cost_min, tour_cost_max, max_ccac, min_ccac, max_ocac, min_ocac, warehouse_id, boundary, shipment_count_max, shipment_count_min} = props.book !== undefined && props.book.attributes;
    const [bookState, setBookState] = useState({
        maxOCAC: max_ccac || max_ocac || '',
        minOCAC: min_ccac || min_ocac || '',
        minTourCost: tour_cost_min || '',
        maxTourCost: tour_cost_max || '',
        warehouseId: +warehouse_id || '',
        boundary: boundary || '',
        minShipment: shipment_count_min || '',
        maxShipment: shipment_count_max || '',
        zoneId: '',
        warehouse: convertWarehouse && convertWarehouse.find(f => f.value == warehouse_id) || undefined,
    })
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editBoundary, setEditBoundary] = useState(boundary);

    let dayOfWeek = null;
    if(bookingStore && bookingStore.activeSession && bookingStore.activeSession.session && bookingStore.activeSession.session.target_date && bookingStore.activeSession.session.timezone){
        const timezone = moment(new Date(bookingStore.activeSession.session.target_date)).tz(bookingStore.activeSession.session.timezone);
        const day = timezone ? timezone.format('ddd') : '';
        dayOfWeek = day.toUpperCase();
    }

    const zoneIds = _.map(bookingStore && bookingStore.activeSession && bookingStore.activeSession.session && bookingStore.activeSession.session.groups, 'unique_id');

    useEffect(() => {
        if(bookState.zoneId) {
        bookingStore.filterBookingByRegionZoneDay(bookState.zoneId, dayOfWeek).then(res => {
            if(res.ok) {
                setBookState(prev => ({
                    ...prev,
                    maxOCAC: res.data && (res.data.max_ocac === null || res.data.max_ocac === undefined) ? "" : res.data.max_ocac,
                    minOCAC: res.data && (res.data.min_ocac === null || res.data.min_ocac === undefined) ? "" : res.data.min_ocac,
                    minTourCost: res.data && (res.data.min_tour_cost === null || res.data.min_tour_cost === undefined) ? "" : res.data.min_tour_cost,
                    maxTourCost: res.data && (res.data.max_tour_cost === null || res.data.max_tour_cost === undefined) ? "" : res.data.max_tour_cost,
                    minShipment: res.data && (res.data.min_shipment_count === null || res.data.min_shipment_count === undefined) ? "" : res.data.min_shipment_count,
                    maxShipment: res.data && (res.data.max_shipment_count === null || res.data.max_shipment_count === undefined) ? "" : res.data.max_shipment_count,
                    boundary: res.data && res.data.boundary || "",
                    warehouseId: res.data && res.data.warehouse_id,
                    warehouse: convertWarehouse && convertWarehouse.find(f => f.value == res.data.warehouse_id) || undefined
                }))
                setEditBoundary(res.data && res.data.boundary)
            }
            else {
                setBookState(prev => ({
                    ...prev,
                    zoneId: bookState.zoneId
                }))
            }
        })
        }

    }, [bookState.zoneId])
    
    const handleChange = (e) => {
        const {name, value} = e.target;
        setBookState(prev => ({
            ...prev,
            [name]: value
        }))
        setIsDirty(true);
    }

    const handleSave = () => {
        const { activeSession} = bookingStore;
        if(bookState.minShipment && !isNumeric(+bookState.minShipment)) {
            toast.error('Min shipment invalid', {containerId: 'main'});
            return;
        }

        if(bookState.maxShipment && !isNumeric(+bookState.maxShipment)) {
            toast.error('Max shipment invalid', {containerId: 'main'});
            return;
        }

        if(bookState.minTourCost && !isNumeric(+bookState.minTourCost)) {
            toast.error('Min tour cost invalid', {containerId: 'main'});
            return;
        }

        if(bookState.maxTourCost && !isNumeric(+bookState.maxTourCost)) {
            toast.error('Max tour cost invalid', {containerId: 'main'});
            return;
        }

        if(bookState.minOCAC && !isNumeric(+bookState.minOCAC)) {
            toast.error('Min OCAC invalid', {containerId: 'main'});
            return;
        }

        if(bookState.maxOCAC && !isNumeric(+bookState.maxOCAC)) {
            toast.error('Max OCAC invalid', {containerId: 'main'});
            return;
        }

        if(+bookState.minShipment > +bookState.maxShipment) {
            toast.error(`Min shipment can't be larger than Max shipment`, {containerId: 'main'});
            return;
        }

        if(+bookState.minTourCost > +bookState.maxTourCost) {
            toast.error(`Min tour cost can't be larger than Max tour cost`, {containerId: 'main'});
            return;
        }

        if(+bookState.minOCAC > +bookState.maxOCAC) {
            toast.error(`Min OCAC can't be larger than Max OCAC`, {containerId: 'main'});
            return;
        }

        const payloadDefault = {
          "min_shipment": bookState.minShipment || 0,
          "max_shipment": bookState.maxShipment || 0,
          "min_tour_cost": bookState.minTourCost || 0,
          "max_tour_cost": bookState.maxTourCost || 0,
          "max_ocac": bookState.maxOCAC || 0,
          "min_ocac": bookState.minOCAC || 0,
          "boundary": editBoundary,
          "warehouse_id": bookState.warehouseId,
        }
        
        setIsSaving(true);
        if(props.book != undefined && props.book.id) {
            bookingStore.updateTicketGroup(activeSession.session.id, props.book != undefined && props.book.id, payloadDefault).then(
              res => {
                setIsSaving(false);
                if(!res.ok) {
                    toast.error(res && res.data && res.data.message || toastMessage.ERROR_UPDATING, {containerId: 'main'});
                    return;
                }
                handleClose();
                bookingStore.reloadSession();
                setIsDirty(false);
                setBookState(DEFAULT_BOOK_STATE)
                toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
              }
            ).catch(err => {
                setIsSaving(false);
                toast.error(err, {containerId: 'main'});
            })
        }
        else {
            const payloadAdd = {
                ...payloadDefault,
                "zone_id": bookState.zoneId,
            }
            bookingStore.addTicketGroup(activeSession.session.id, payloadAdd).then(
                res => {
                  setIsDirty(false);
                  setIsSaving(false);
                  if(!res.ok) {
                    toast.error(res && res.data && res.data.message || toastMessage.ERROR_SAVING, {containerId: 'main'});
                    return;
                  }
                  handleClose();
                  setBookState(DEFAULT_BOOK_STATE)
                  bookingStore.reloadSession()
                  toast.success(toastMessage.SAVED_SUCCESS, {containerId: 'main'});
                }
              ).catch(err => {
                setIsSaving(false);
                toast.error(err, {containerId: 'main'});
              })
        }
    
    }

    const handleChangeBoudary = (data, isRemove) => {
        if(isRemove) {
            setBookState(prev => ({
                ...prev,
                boundary: data,
            }))
            setIsDirty(true);
        }
        setEditBoundary(data);
        if(data) {
            setIsDirty(true);
        }
    }

    const handleChangeWarehouse = (v) => {
        setBookState(prev => ({
            ...prev,
            warehouse: v,
            warehouseId: v && v.value
        }))
        setIsDirty(true);
    }

    return (
        <Dialog onClose={handleClose} aria-labelledby="edit-ticket-book-group" open={open} fullWidth maxWidth="md">
            <DialogTitle id="edit-ticket-book-group" onClose={handleClose}>
                {props.book && props.book.id ? props.book.name : 'Add ticket book group'}
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {props.book == undefined && (
                        <Grid item xs={12}>
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel id="zone-id">Zone</InputLabel>
                                <Select
                                    labelId="zone-id"
                                    id="zone-id"
                                    value={bookState.zoneId}
                                    onChange={handleChange}
                                    label="zone"
                                    fullWidth
                                    name='zoneId'
                                >
                                    {
                                        bookingStore.zones.filter(f => !zoneIds.includes(f.id)).map(z => (
                                        <MenuItem value={z.id} key={z.id}>
                                            {z.name}
                                        </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={6}>
                        <InputNumber label='Min Shipment' value={bookState.minShipment} handleChange={handleChange} variant="outlined" isDecimal={false} type='number' tabIndex="1"/>
                    </Grid>
                    <Grid item xs={6}>
                        <InputNumber label='Max Shipment' value={bookState.maxShipment} handleChange={handleChange} variant="outlined" isDecimal={false} tabIndex="2" type='number'/>
                    </Grid>
                    <Grid item xs={6}>
                        <InputNumber label='Min Tour Cost' value={bookState.minTourCost} handleChange={handleChange} variant="outlined" tabIndex="3"/>
                    </Grid>
                    <Grid item xs={6}>
                        <InputNumber label='Max Tour Cost' value={bookState.maxTourCost} handleChange={handleChange} variant="outlined" tabIndex="4"/>
                    </Grid>
                    <Grid item xs={6}>
                        <InputNumber label='Min OCAC' value={bookState.minOCAC} handleChange={handleChange} variant="outlined" tabIndex="5" type='number'/>
                    </Grid>
                    <Grid item xs={6}>
                        <InputNumber label='Max OCAC' value={bookState.maxOCAC} handleChange={handleChange} variant="outlined" tabIndex="6" type='number'/>
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            onChange={(e, v) => handleChangeWarehouse(v)}
                            options={convertWarehouse}
                            getOptionLabel={(option) => option.label}
                            renderInput={(params) => <TextField {...params} label="Warehouse" variant="outlined" />}
                            value={bookState.warehouse || {value: '', label: '', lat: '', lng: ''}}
                            getOptionSelected={(o, v) => {
                                if(!v || v.value == "") { return true; }
                                return o.value == v.value
                            }}
                            disabled={!props.book || !props.book.id }
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Map 
                            warehouseInfo={bookState.warehouse} 
                            boundary={bookState.boundary} 
                            handleChangeBoudary={handleChangeBoudary}
                            strRegions={bookingStore && bookingStore.activeSession && bookingStore.activeSession.session && bookingStore.activeSession.session.attributes && bookingStore.activeSession.session.attributes.regions || ''}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{paddingRight: '24px'}}>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button color="primary" variant='contained' onClick={handleSave} disabled={isSaving || !isDirty} style={{marginLeft: '8px'}}>
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ModalAddOrEditTicketBook