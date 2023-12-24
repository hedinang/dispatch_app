import produce from 'immer';

export const LOADING_PARCEL = 'LOADING_PARCEL';
export const LOADED_PARCEL = 'LOADED_PARCEL';
export const UPDATE_PARCEL_LIST = 'UPDATE_PARCEL_LIST';
export const UPDATE_IS_SAVING = 'UPDATE_IS_SAVING';
export const ADD_BLANK_PARCEL = 'ADD_BLANK_PARCEL';
export const REMOVE_PARCEL_IN_LIST = 'REMOVE_PARCEL_IN_LIST';
export const CANCEL_EDIT_PARCEL = 'CANCEL_EDIT_PARCEL';

export const initialState = {
  isLoading: false,
  isSaving: false,
  parcelsBackup: [],
  parcels: [
    {
      id: '',
      parcel_id: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'in',
      },
      weight: {
        value: '',
        unit: 'lb',
      },
      type: '',
    },
  ],
  parcel: {
    id: '',
    parcel_id: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'in',
    },
    weight: {
      value: '',
      unit: 'lb',
    },
    type: '',
  },
};

export const parcelReducer = (state, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOADING_PARCEL: {
        draft.isListing = true;
        break;
      }
      case LOADED_PARCEL: {
        draft.isListing = false;
        draft.parcels = action.payload;
        draft.parcelsBackup = action.payload;
        break;
      }
      case REMOVE_PARCEL_IN_LIST: {
        const { id } = action.payload;
        draft.parcels = state.parcels.filter(item => item.id !== id);
        break;
      }
      case UPDATE_PARCEL_LIST: {
        const { id, value, field } = action.payload;
        const index = state.parcels.findIndex(item => item.id === id);
        if (index > -1) {
          if (field === 'weight') {
            const valueWeight = { value, unit: 'lb' };
            draft.parcels[index].weight = valueWeight;
          } else if (field === 'dimensions') {
            const splitValue = value.split(' x ');
            const dimensionsObj = { length: splitValue[0], width: splitValue[1], height: splitValue[2], unit: 'in' };
            draft.parcels[index].dimensions = dimensionsObj;
          } else {
            draft.parcels[index][field] = value;
          }
        }
        break;
      }
      case UPDATE_IS_SAVING: {
        draft.isSaving = action.payload;
        break;
      }
      case ADD_BLANK_PARCEL: {
        const {id, type, shipment_id} = action.payload;
        draft.parcels.push({
          id,
          shipment_id,
          parcel_id: '',
          dimensions: {
            length: '',
            width: '',
            height: '',
            unit: 'in',
          },
          weight: {
            value: '',
            unit: 'lb',
          },
          type,
        });
        break;
      }
      case CANCEL_EDIT_PARCEL: {
        draft.parcels = state.parcelsBackup;
        break;
      }
      default:
        throw new Error();
    }
  });
