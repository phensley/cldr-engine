import { getSupplemental } from '../../../cldr';

export const getTimeData = (): any => {
  const { TimeData } = getSupplemental();
  return { timeData: TimeData };
};
