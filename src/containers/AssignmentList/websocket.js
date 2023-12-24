import { stores } from '../../stores';
import { useWebSocketHook } from '../../Utils/websocket-hook';

function WebSocket({date}) {
    const handleMessage = (msg) => {
        stores.assignmentStore.updateRiskyAssignment(msg)
    }
    
    useWebSocketHook(date, handleMessage, stores.assignmentStore.wsRisky);
    return (null);
}

export default WebSocket;