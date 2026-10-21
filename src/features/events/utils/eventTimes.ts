export const eventWorkingStartHour = 8;
export const eventWorkingEndHour = 23;
export const eventTimeStepMinutes = 30;
export const eventTimeRegex = /^((0[8-9]|1\d|2[0-2]):[0-5]\d|23:00)$/;

export const eventHourOptions = Array.from(
  {
    length:
      ((eventWorkingEndHour - eventWorkingStartHour) * 60) /
        eventTimeStepMinutes +
      1,
  },
  (_, index) => {
    const totalMinutes =
      eventWorkingStartHour * 60 + index * eventTimeStepMinutes;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    return {
      id: value,
      name: value,
    };
  },
);

export const eventTimeToMinutes = (value: string) => {
  if (!eventTimeRegex.test(value)) {
    return null;
  }

  const [hour, minute] = value.split(':').map(Number);

  return hour * 60 + minute;
};
