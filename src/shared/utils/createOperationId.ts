const UUID_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

export const createOperationId = () =>
  UUID_TEMPLATE.replace(/[xy]/g, character => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 3) | 8).toString(16);
  });
