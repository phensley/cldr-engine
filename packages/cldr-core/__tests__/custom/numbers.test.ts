import { buildConfig, numbersApi } from '../_helpers';

test('custom number system', () => {
  const cfg = buildConfig({ ['number-system-name']: ['arabext'] });
  const api = numbersApi('en', cfg);
  let s: string;

  s = api.formatDecimal('1234.56789', { nu: 'arabext' });
  expect(s).toEqual('۱,۲۳۴.۵۶۸');

  s = api.formatDecimal('1234.56789');
  expect(s).toEqual('1,234.568');

  // Missing number system falls back to 'latn' number system for patterns but uses the
  // given number system's digits
  s = api.formatDecimal('1234.56789', { nu: 'beng' });
  expect(s).toEqual('১,২৩৪.৫৬৮');
});
