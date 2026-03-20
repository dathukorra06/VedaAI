import { useEffect } from 'react';
import { useStore } from '../store/store';
import { io } from 'socket.io-client';
import { API_URL } from '../config/api';

export const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export const useJobSocket = () => {
    const { setJobInfo, setGeneratedPaper, currentAssignment, setView } = useStore();

    useEffect(() => {
        if (!currentAssignment?._id) return;
        
        const eventName = `job-${currentAssignment._id}`;
        
        const handleUpdate = (data: any) => {
            const { status, progress, message, paper } = data;
            setJobInfo(status, progress, message);
            if (paper) setGeneratedPaper(paper);
            if (status === 'done') {
              setTimeout(() => setView('output'), 800);
            }
        };

        socket.on(eventName, handleUpdate);
        return () => {
            socket.off(eventName, handleUpdate);
        };
    }, [currentAssignment?._id, setJobInfo, setGeneratedPaper, setView]);

    return socket;
};
