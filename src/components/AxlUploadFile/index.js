import React from 'react'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export const useStyles = makeStyles((theme) => ({
    imageContainer: {
        padding: '4px 0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        cursor: 'pointer',
        borderRadius: '4px'
    },
    spanUpload: {
        color: '#626262',
        fontSize: 12,
        marginTop: 4,
    },
    disabled: {
        backgroundColor: '#ededed',
    },
    small: {
        color: '#4a4a4a',
        fontStyle: 'italic',
        marginTop: 4,
        display: 'block', 
        fontFamily: 'AvenirNext',
        fontSize: 13
    }
}));

function AxlUploadFile({handleChange, subTitle, disabled, maxSize, fieldName}) {
    const classes = useStyles();

    return (
        <div>
            <label htmlFor={`attachment_${fieldName}`} className={clsx(classes.imageContainer, disabled && classes.disabled)}>
                <AddAPhotoIcon />
                {subTitle && <span className={classes.spanUpload}>{subTitle}</span>}
                {maxSize && <small className={classes.small}>Max size: {maxSize}Mb</small>}
            </label>
            <input type="file" hidden id={`attachment_${fieldName}`} accept="image/png, image/jpeg" onChange={(e) => handleChange(e)} disabled={disabled}/>
        </div>
    )
}

export default AxlUploadFile