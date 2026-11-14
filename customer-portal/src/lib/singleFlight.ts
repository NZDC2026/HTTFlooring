// Leading-edge debounce: duplicate clicks share a pending action, then observe a cooldown.
// Never build deduplication keys from credentials or bodies.
export function singleFlight<A extends unknown[], T>(action: (...args: A) => Promise<T>, cooldown = 400) {
  let pending: Promise<T> | undefined;
  let until = 0;
  return (...args: A): Promise<T> => {
    if (pending) return pending;
    if (Date.now() < until) return Promise.reject(new Error('Please wait before trying again.'));
    pending = Promise.resolve().then(() => action(...args)).finally(() => { pending = undefined; until = Date.now() + cooldown; });
    return pending;
  };
}
