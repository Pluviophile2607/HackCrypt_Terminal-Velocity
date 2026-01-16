import { io } from 'socket.io-client';

// In production, this would be the actual server URL
const URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

export const socket = io(URL, {
    autoConnect: false
});
