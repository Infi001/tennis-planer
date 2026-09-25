import React, { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabase';

export const RealtimeStatus: React.FC = () => {
  const [status, setStatus] = useState<string>('initializing');
  const [lastPayload, setLastPayload] = useState<string>('none');

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setStatus('no-client');
      return;
    }

    const channel = sb.channel('debug_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_weeks' }, (payload) => {
        setLastPayload(new Date().toISOString() + ': ' + payload.eventType);
      })
      .subscribe((status, err) => {
        setStatus(status + (err ? ' (Error)' : ''));
      });

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 bg-black text-green-500 font-mono text-[10px] p-1 opacity-80 pointer-events-none">
      DB: {status} | Last: {lastPayload}
    </div>
  );
};
