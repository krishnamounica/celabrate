// src/utils/cartEvents.js
let listeners = new Set();

export const emitCartUpdated = () => {
  listeners.forEach(cb => cb());
};

export const onCartUpdated = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
