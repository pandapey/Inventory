let io = null;
export const setIO = (instance) => { io = instance; };
export const getIO = () => io;
export const emitStockUpdate = (payload) => { if (io) io.emit('stock:update', payload); };
export const emitNotification = (payload) => { if (io) io.emit('notification', payload); };
