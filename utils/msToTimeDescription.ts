function addSingularPlural(value: number, ignore = false) {
  if (ignore) return "";
  return value === 1 ? "" : "s";
}

interface Options {
  short?: boolean;
  includeMs?: boolean;
}

// They have an extra space at the start to avoid the space between the number and the word
const longWords = {
  seconds: " second",
  minutes: " minute",
  hours: " hour",
  days: " day",
};

const shortWords = {
  seconds: "s",
  minutes: "m",
  hours: "h",
  days: "d",
};

export function rangeMsToTimeDescription(
  date1: number | Date,
  date2: number | Date = Date.now(),
  options: Options = {}
) {
  return msToTimeDescription(Math.abs(+date2 - +date1), options);
}

export default function msToTimeDescription(ms: number | Date, { short, includeMs }: Options = {}): string {
  const totalTimes = {
    milliseconds: +ms,
    seconds: Math.floor(+ms / 1000),
    minutes: Math.floor(+ms / 60000),
    hours: Math.floor(+ms / 3600000),
    days: Math.floor(+ms / 86400000),
  };
  const leftTimes = {
    milliseconds: totalTimes.milliseconds - totalTimes.seconds * 1000,
    seconds: totalTimes.seconds - totalTimes.minutes * 60,
    minutes: totalTimes.minutes - totalTimes.hours * 60,
    hours: totalTimes.hours - totalTimes.days * 24,
    days: totalTimes.days,
  };
  const words = short ? shortWords : longWords;

  const timeDescription = [];
  if (leftTimes.days > 0)
    timeDescription.push(`${leftTimes.days}${words.days}${addSingularPlural(leftTimes.days, short)}`);
  if (leftTimes.hours > 0 || timeDescription.length > 0)
    timeDescription.push(`${leftTimes.hours}${words.hours}${addSingularPlural(leftTimes.hours, short)}`);
  if (leftTimes.minutes > 0 || timeDescription.length > 0)
    timeDescription.push(`${leftTimes.minutes}${words.minutes}${addSingularPlural(leftTimes.minutes, short)}`);
  if (leftTimes.seconds > 0 || timeDescription.length > 0)
    timeDescription.push(`${leftTimes.seconds}${words.seconds}${addSingularPlural(leftTimes.seconds, short)}`);
  if (includeMs && leftTimes.milliseconds > 0)
    timeDescription.push(`${leftTimes.milliseconds}ms${addSingularPlural(leftTimes.milliseconds, short)}`);

  if (timeDescription.length === 0) return `0${words.seconds}${addSingularPlural(0, short)}`;
  else if (timeDescription.length === 1) return timeDescription[0];
  else if (short) return timeDescription.join(" ");
  else return timeDescription.slice(0, -1).join(", ") + " and " + timeDescription.slice(-1);
}

// Tests
// const now = new Date();
// const past = new Date();
// past.setDate(past.getDate() - 365);
// past.setHours(past.getHours() - 23);
// past.setMinutes(past.getMinutes() - 59);
// past.setMilliseconds(past.getMilliseconds() - 999);
// console.log(rangeMsToTimeDescription(past, now, { short: true, includeMs: true }));
