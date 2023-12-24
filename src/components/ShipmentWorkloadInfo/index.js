import React, { useContext, useState, useEffect } from 'react';
import { AxlPanel, AxlButton, AxlLoading } from 'axl-reactjs-ui';
import { Context } from '../../providers/Parcel';
import {
  LOADED_PARCEL,
  UPDATE_PARCEL_LIST,
  UPDATE_IS_SAVING,
  ADD_BLANK_PARCEL,
  REMOVE_PARCEL_IN_LIST,
  CANCEL_EDIT_PARCEL,
} from '../../providers/Parcel/reducer';
import api from '../../stores/api';
import ParcelItem from '../ParcelItem';
import styles from './styles';
// import { downloadFile } from '../../utils/pdf';
export const LoadingBtn = () => (
  <div style={styles.loadingWrapper}>
    <div style={styles.loading}>
      <AxlLoading size={15} thin={1} color={`#FFF`} />
    </div>
  </div>
);
const ShipmentWorkloadInfo = props => {
  const { shipmentId, workload, downloadLabel } = props;
  const { state, dispatch } = useContext(Context);
  const [workloadParcel, setWorkloadParcel] = useState(workload);
  const { parcels, isSaving } = state;

  const [isShowPanel, setIsShowPanel] = useState(false);
  const [isEnableEdit, setIsEnableEdit] = useState(false);
  const [isShowDownload, setIsShowDownload] = useState(false);
  const [isEditParcel, setIsEditParcel] = useState(false);
  const [isDownloadShipment, setIsDownloadShipment] = useState(false);
  const [parcelTypeList, setParcelTypeList] = useState([]);
  const [error, setError] = useState('');
  // reset error msg
  useEffect(() => {
    if (error) setError('');
  }, [parcels]);

  useEffect(() => {
    api.get(`/shipments/${shipmentId}/parcels`).then(resp => {
      if (resp.ok) {
        dispatch({ type: LOADED_PARCEL, payload: resp.data });
      }
    });
    // api.get('/shipments/client-settings').then(response => {
    //   if (response.ok && response.data) {
    //     setParcelTypeList(response.data.parcel_types);
    //     setIsShowDownload(response.data.is_enable_label);
    //   }
    // });
  }, [shipmentId]);

  const downloadParcelPDF = parcel => e => {
    // setIsDownloadShipment(true);
    // api.get(`/shipments/${shipmentId}/parcels/${parcel.id}/label`).then(resp => {
    //   if (resp.ok) {
    //     var fileName = `order-${shipmentId}-${parcel.parcel_id.replace(/[^\w]+/g, "-")}-label.pdf`;
    //     downloadFile(fileName, 'PDF', resp.data.label);
    //   }
    //   setIsDownloadShipment(false);
    // });
  };

  const downloadShipmentParcelsPDF = e => {
    downloadLabel();
    // setIsDownloadShipment(true);
    // api.get(`/shipments/${shipmentId}/parcels/label`).then(resp => {
    //   if (resp.ok) {
    //     var fileName = `order-${shipmentId}-parcels-label.pdf`;
    //     downloadFile(fileName, 'PDF', resp.data.label);
    //   }
    //   setIsDownloadShipment(false);
    // });
  };
  const handleChangeField = (value, id, field) => {
    setError('');
    dispatch({ type: UPDATE_PARCEL_LIST, payload: { id, value, field } });
  };
  const hasDuplicatesParcelId = parcels => {
    let seen = new Set();
    return parcels
      .filter(p => p.parcel_id)
      .some(currentObject => {
        return seen.size === seen.add(currentObject.parcel_id).size;
      });
  };

  const handleSaveParcel = () => {
    if (isSaving) return;
    if (hasDuplicatesParcelId(parcels)) {
      setError('Parcel Id can not duplicate');
      return;
    }
    dispatch({ type: UPDATE_IS_SAVING, payload: true });
    api.put(`/shipments/${shipmentId}/parcels?byId=true`, parcels).then(rsp => {
      if (rsp.ok) {
        setIsEnableEdit(false);
        api.get(`/shipments/${shipmentId}/parcels`).then(resp => {
          if (resp.ok) {
            setWorkloadParcel(resp.data.length);
            dispatch({ type: LOADED_PARCEL, payload: resp.data });
          }
        });
      } else if (rsp.data && rsp.data.errors) {
        setError(rsp.data.errors[0]);
      } else {
        setError('Fail to save parcel. Please try again later');
      }
      dispatch({ type: UPDATE_IS_SAVING, payload: false });
    });
  };
  const addNewParcel = () => {
    dispatch({
      type: ADD_BLANK_PARCEL,
      payload: { id: `local-${Math.random() * Date.now()}`, type: parcelTypeList[0], shipment_id: shipmentId },
    });
  };
  const deleteParcel = id => {
    dispatch({ type: REMOVE_PARCEL_IN_LIST, payload: { id } });
    if (id && !id.startsWith('local-')) {
      api.delete(`/shipments/${shipmentId}/parcels/${id}`).then(resp => {
        if (resp.ok) {
          console.log('remove parcel success');
        } else {
          setError('Fail to remove parcel. Please try again later');
        }
      });
    }
  };
  const cancelEdit = () => {
    dispatch({ type: CANCEL_EDIT_PARCEL });
    setIsEnableEdit(false);
  };
  return (
    <AxlPanel style={styles.panelContainer}>
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderTitle}>{`Workload Info:`}</div>
        <div style={styles.panelHeaderRight}>
          <div style={styles.workloadNumber}>
            <span>Workload: </span>
            <span>{workload && typeof workload === "number" && workload.toFixed(2)}</span>
          </div>
          <div style={styles.panelHeaderArrow} onClick={() => setIsShowPanel(!isShowPanel)}>
            <i className={!isShowPanel ? 'fa fa-angle-down' : 'fa fa-angle-up'} />
          </div>
        </div>
      </div>
      {isShowPanel && (
        <div style={{ marginTop: '10px', position: 'relative' }}>
          {isDownloadShipment && <LoadingBtn />}
          {parcels.map(item => (
            <AxlPanel.Row style={styles.panelContent}>
              <ParcelItem
                parcel={item}
                handleChangeField={handleChangeField}
                onDownloadLabel={downloadParcelPDF(item)}
                parcelTypeList={parcelTypeList}
                isEnableEdit={isEnableEdit}
                deleteParcel={deleteParcel}
                isShowDownload={isShowDownload}
              />
            </AxlPanel.Row>
          ))}
          <div style={styles.error}>{error}</div>
          <div style={styles.buttonWrap}>
            {!isEnableEdit && (
              <React.Fragment>
                  <AxlButton tiny bg={'white'} onClick={downloadShipmentParcelsPDF}>
                    Download All Labels
                  </AxlButton>
                {isEditParcel && (
                  <AxlButton
                    style={styles.editBtn}
                    tiny
                    bg={'white'}
                    onClick={() => {
                      setIsEnableEdit(true);
                    }}>
                    Edit Parcels
                  </AxlButton>
                )}
              </React.Fragment>
            )}
            {isEnableEdit && (
              <React.Fragment>
                <AxlButton tiny bg={'blueGrayMain'} onClick={addNewParcel}>
                  Add New Parcel
                </AxlButton>
                <AxlButton style={styles.cancelBtn} tiny bg={'blueGray'} onClick={cancelEdit}>
                  Cancel
                </AxlButton>
                <AxlButton style={styles.saveBtn} tiny bg={'periwinkle'} onClick={handleSaveParcel}>
                  Save
                  {isSaving && <LoadingBtn />}
                </AxlButton>
              </React.Fragment>
            )}
          </div>
        </div>
      )}
    </AxlPanel>
  );
};

export default ShipmentWorkloadInfo;
