import { getSupplemental } from '../../../cldr';

export const getWeekData = (): any => {
  const { WeekData } = getSupplemental();
  return WeekData;
};
