import type { GameInput } from '@moba/shared';

export const mobileInput: Pick<GameInput, 'dx' | 'dy'> = { dx: 0, dy: 0 };

type PendingCast = Required<Pick<GameInput, 'cast' | 'aimX' | 'aimY'>>;
const pendingCasts: PendingCast[] = [];

export function queueMobileCast(cast: PendingCast): void {
  if (pendingCasts.length < 4) pendingCasts.push(cast);
}

export function takeMobileCast(): PendingCast | undefined {
  return pendingCasts.shift();
}

export function resetMobileInput(): void {
  mobileInput.dx = 0;
  mobileInput.dy = 0;
  pendingCasts.length = 0;
}
