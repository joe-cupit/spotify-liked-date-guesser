export function getDateDifferenceInDays(date1 : Date, date2 : Date) {
  let timeDiff = Math.abs(date1.getTime() - date2.getTime());
  let daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
}