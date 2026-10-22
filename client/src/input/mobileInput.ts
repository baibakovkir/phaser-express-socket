import type { GameInput } from '@moba/shared';

export const mobileInput: Pick<GameInput, 'dx' | 'dy' | 'attack'> = {
  dx: 0,
  dy: 0,
  attack: false,
};

let pendingCast: GameInput['cast'];

export function queueMobileCast(cast: NonNullable<GameInput['cast']>): void {
  pendingCast = cast;
}

export function takeMobileCast(): GameInput['cast'] {
  const cast = pendingCast;
  pendingCast = undefined;
  return cast;
}

export function resetMobileInput(): void {
  mobileInput.dx = 0;
  mobileInput.dy = 0;
  mobileInput.attack = false;
  pendingCast = undefined;
}
