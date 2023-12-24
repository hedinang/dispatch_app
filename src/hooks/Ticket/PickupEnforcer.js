import { useState, useEffect } from 'react';
import produce from 'immer';
import api from '../../stores/api';

export default function usePickupEnforcer() {
  const [updating, setUpdating] = useState(false);
  
  const updatePickupEnforcer = (sessionId, status, callback) => {
    setUpdating(true);
    return api.put(`/tickets/booking-sessions/${sessionId}/pickup-enforce`, {enforce_pickup_status: status}).then(resp => {
      setUpdating(false);
      if(resp.ok && resp.status === 200) {
        callback(resp.data);
      }

      return resp;
    });
  }


  return {
    updating,
    updatePickupEnforcer,
  };
}