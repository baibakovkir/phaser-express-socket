import { useEffect, useRef } from 'react';
import { EventBus, GameEvents } from '../events/EventBus';

export function usePhaserEvent<K extends keyof GameEvents>(
  event: K,
  handler: GameEvents[K]
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler = (...args: Parameters<GameEvents[K]>) => {
      (handlerRef.current as (...args: Parameters<GameEvents[K]>) => void)(...args);
    };
    EventBus.on(event, wrappedHandler as GameEvents[K]);
    return () => EventBus.off(event, wrappedHandler as GameEvents[K]);
  }, [event]);
}
