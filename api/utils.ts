import dayjs from "dayjs";
import utc from "dayjs/utc";
import tz from "dayjs/tz";
dayjs.extend(utc);
dayjs.extend(tz);
(dayjs as any).tz.setDefault("Asia/Shanghai");

export const day = dayjs;

export const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
};
