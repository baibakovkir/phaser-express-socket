import type { GameInput } from '@moba/shared';

export const mobileInput: Pick<GameInput, 'dx' | 'dy' | 'attack'> = {
  dx: 0,
  dy: 0,
  attack: false,
};

const pendingCasts: NonNullable<GameInput['cast']>[] = [];

export function queueMobileCast(cast: NonNullable<GameInput['cast']>): void {
  if (pendingCasts.length < 4) pendingCasts.push(cast);
}

export function takeMobileCast(): GameInput['cast'] {
  return pendingCasts.shift();
}

export function resetMobileInput(): void {
  mobileInput.dx = 0;
  mobileInput.dy = 0;
  mobileInput.attack = false;
  pendingCasts.length = 0;
}
