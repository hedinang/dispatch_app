import React, { useState, useEffect } from 'react';
import { AxlPanel, AxlPopConfirm } from 'axl-reactjs-ui';
import InputMask from 'react-input-mask';
import { images } from '../../constants/images';
import styles, { ParcelLabel, InputWrapper, InputNoPadding, Unit, Select } from './styles';
const dimensionHolder = ' x ';
const typeIcon = type => {
  switch (type) {
    case 'box':
      return images.icon.box;
    case 'bag':
      return images.icon.bag;
    case 'tote':
      return images.icon.tote;
    default:
      return images.icon.box;
  }
};
// length x width x height
const renderDimension = dimension =>
  `${dimension.length}${dimensionHolder}${dimension.width}${dimensionHolder}${dimension.height}`;
const ParcelItem = props => {
  const { parcel, handleChangeField, parcelTypeList, isEnableEdit, onDownloadLabel, deleteParcel, isShowDownload } = props;
  const { id, parcel_id, dimensions, weight, type } = parcel;
  const typeSrc = typeIcon(type);
  const [isShowPanel, setIsShowPanel] = useState(false);
  const onChangeDimension = (e, id) => {
    if (e) handleChangeField(e.target.value, id, 'dimensions');
  };
  const onSelectType = (e, id) => {
    if (e) handleChangeField(e, id, 'type');
  };
  const onChangeParcelId = (e, id) => {
    if (e) handleChangeField(e.target.value, id, 'parcel_id');
  };
  const onChangeWeight = (e, id) => {
    if (e) handleChangeField(e.target.value, id, 'weight');
  };
  useEffect(() => {
    if (isEnableEdit) {
      setIsShowPanel(true);
    }
  }, [isEnableEdit]);
  return (
    <AxlPanel style={styles.parcelContainer}>
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderTitle}>
          <div style={styles.typeIconWrapper}>
            <img src={typeSrc} style={styles.typeIcon} />
          </div>
          {parcel_id}
          <span style={{fontSize: 12}}>{type} {renderDimension(dimensions)} in</span>
        </div>
        <div style={styles.panelHeaderRight}>
          {isEnableEdit ? (
            <AxlPopConfirm
              trigger={
                <button style={styles.btnTrash}>
                  <img src={images.icon.trash} />
                </button>
              }
              titleFormat={<div>{`Are you sure to delete this parcel?`}</div>}
              textFormat={<div>{parcel_id && `Parcel ID: ${parcel_id}`}</div>}
              okText={`OK`}
              onOk={() => deleteParcel(id)}
              cancelText={`Cancel`}
              onCancel={() => null}
            />
          ) : (
            <React.Fragment>
              {(isShowDownload && parcel_id) && (
                <div style={styles.parcelLabel}>
                  <button style={styles.btnDownload} onClick={onDownloadLabel}>
                    <img src={images.icon.downloadColor} style={styles.labelIcon} />
                    LABEL
                  </button>
                </div>
              )}
              <div style={styles.panelHeaderArrow} onClick={() => setIsShowPanel(!isShowPanel)}>
                <i className={!isShowPanel ? 'fa fa-angle-down' : 'fa fa-angle-up'} />
              </div>
            </React.Fragment>
          )}

          <div></div>
        </div>
      </div>
      {isShowPanel && (
        <AxlPanel.Row style={styles.parcelContent}>
          <AxlPanel.Col style={styles.firstCol}>
            <ParcelLabel>Parcel ID:</ParcelLabel>
            {isEnableEdit ? (
              <InputNoPadding>
                <input
                  style={styles.input}
                  onChange={e => onChangeParcelId(e, id)}
                  name="parcel_id"
                  value={parcel_id}
                />
              </InputNoPadding>
            ) : (
              <div>{parcel_id}</div>
            )}
          </AxlPanel.Col>
          <AxlPanel.Col style={styles.colWide}>
            <ParcelLabel>Dimension:</ParcelLabel>

            {isEnableEdit ? (
              <InputWrapper>
                <InputMask
                  value={renderDimension(dimensions)}
                  name="dimension"
                  onChange={e => onChangeDimension(e, id)}
                  alwaysShowMask
                  maskChar=" "
                  mask="99 x 99 x 99"
                  style={styles.input}
                />
                <Unit>in</Unit>
              </InputWrapper>
            ) : (
              <span>{renderDimension(dimensions)} in</span>
            )}
          </AxlPanel.Col>
          <AxlPanel.Col style={styles.normalCol}>
            <ParcelLabel>Weight:</ParcelLabel>
            {isEnableEdit ? (
              <InputWrapper style={styles.inputWeight}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  onChange={e => onChangeWeight(e, id)}
                  name="weight"
                  value={weight.value}
                />
                <Unit>lbs</Unit>
              </InputWrapper>
            ) : (
              <span>{weight.value} lbs</span>
            )}
          </AxlPanel.Col>
          <AxlPanel.Col style={styles.normalCol}>
            <ParcelLabel>Type:</ParcelLabel>
            {isEnableEdit ? (
              <Select
                onChange={s => {
                  onSelectType(s.target.value, id);
                }}
                defaultValue={type}>
                <option disabled selected value>
                  ---
                </option>
                {parcelTypeList.map((type, index) => (
                  <option key={index} value={type} style={styles.option}>
                    {type}
                  </option>
                ))}
              </Select>
            ) : (
              <div style={styles.type}>{type}</div>
            )}
          </AxlPanel.Col>
        </AxlPanel.Row>
      )}
    </AxlPanel>
  );
};

export default React.memo(ParcelItem);
