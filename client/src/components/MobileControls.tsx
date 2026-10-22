import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { mobileInput, queueMobileCast, resetMobileInput } from '../input/mobileInput';

const ABILITIES = ['Q', '1', '2', '3'] as const;
const STICK_RADIUS = 48;

export function MobileControls({ touchDevice }: { touchDevice: boolean }) {
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
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
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
    <section aria-label="Touch game controls" className={`flex-1 w-full bg-gray-900 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white ${touchDevice ? '' : 'md:hidden'}`}>
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-3 sm:justify-between">
        <div
          role="group"
          aria-label="Move joystick"
          data-testid="move-joystick"
          className="relative h-36 w-36 shrink-0 rounded-full border-2 border-cyan-500 bg-gray-800 touch-none select-none"
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
          <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border border-cyan-300 bg-cyan-600/80 pointer-events-none" style={{ transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))` }} />
        </div>
        <div className="flex min-w-0 flex-col items-end gap-3">
          <div className="grid grid-cols-4 gap-2">
            {ABILITIES.map(ability => (
              <button
                key={ability}
                type="button"
                aria-label={`Cast ${ability}`}
                className="h-12 w-11 rounded-lg border border-purple-400 bg-purple-800 font-bold touch-none select-none active:bg-purple-600"
                onPointerDown={() => queueMobileCast(ability)}
              >
                {ability}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Attack"
            className="h-16 min-w-24 rounded-full border-2 border-red-400 bg-red-700 px-4 font-bold touch-none select-none active:bg-red-500"
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
      </div>
    </section>
  );
}
