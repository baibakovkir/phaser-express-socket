import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { mobileInput, resetMobileInput } from '../input/mobileInput';
import { EventBus } from '../events/EventBus';

const STICK_RADIUS = 38;

export function MobileControls() {
  const activePointer = useRef<number | null>(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const release = () => {
      activePointer.current = null;
      resetMobileInput();
      setStick({ x: 0, y: 0 });
    };
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('blur', release);
      release();
    };
  }, []);

  const moveStick = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const screenX = event.clientX - (bounds.left + bounds.width / 2);
    const screenY = event.clientY - (bounds.top + bounds.height / 2);
    const dx = portrait ? screenY : screenX;
    const dy = portrait ? -screenX : screenY;
    const scale = Math.min(1, STICK_RADIUS / (Math.hypot(dx, dy) || 1));
    const x = dx * scale;
    const y = dy * scale;
    // The compact input protocol stores direction as signed integers.
    mobileInput.dx = Math.abs(x) >= 12 ? Math.sign(x) : 0;
    mobileInput.dy = Math.abs(y) >= 12 ? Math.sign(y) : 0;
    setStick({ x, y });
  };

  const releaseStick = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    mobileInput.dx = 0;
    mobileInput.dy = 0;
    setStick({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section aria-label="Touch game controls" className="pointer-events-none absolute inset-0 z-20 text-white">
        <div
          role="group"
          aria-label="Move joystick"
          data-testid="move-joystick"
          className="pointer-events-auto absolute bottom-4 left-4 h-28 w-28 rounded-full border-2 border-cyan-400 bg-slate-950/70 shadow-lg touch-none select-none"
          onPointerDown={event => {
            if (activePointer.current !== null) return;
            activePointer.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            moveStick(event);
          }}
          onPointerMove={moveStick}
          onPointerUp={releaseStick}
          onPointerCancel={releaseStick}
          onLostPointerCapture={releaseStick}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-cyan-200 bg-cyan-600/80" style={{ transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))` }} />
        </div>
        <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col items-end gap-2">
          <button
            type="button"
            aria-label="Select next target"
            className="h-10 min-w-24 rounded-lg border border-amber-300 bg-slate-950/80 px-3 text-xs font-bold touch-none select-none"
            onPointerDown={() => EventBus.emit('ui:cycle-target')}
          >
            Target
          </button>
          <button
            type="button"
            aria-label="Attack"
            className="h-12 min-w-24 rounded-full border-2 border-red-300 bg-red-800/90 px-4 font-bold shadow-lg touch-none select-none active:bg-red-500"
            onPointerDown={event => {
              event.currentTarget.setPointerCapture(event.pointerId);
              mobileInput.attack = true;
            }}
            onPointerUp={() => { mobileInput.attack = false; }}
            onPointerCancel={() => { mobileInput.attack = false; }}
            onLostPointerCapture={() => { mobileInput.attack = false; }}
          >
            Attack
          </button>
        </div>
    </section>
  );
}
