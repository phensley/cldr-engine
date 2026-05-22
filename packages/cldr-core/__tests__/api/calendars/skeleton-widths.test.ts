import { calendarsApi } from '../../_helpers';

// Spec-derived expectations (TR35 "Matching Skeletons" + CLDR 48.2 data),
// NOT Intl comparisons: Intl cannot express 2-digit numeric requests or
// pattern-width freezes. d15 = Mon 2024-07-15, d5 = Sat 2024-07-05 (UTC).
const d15 = { date: 1721030400000, zoneId: 'UTC' };
const d5 = { date: 1720166400000, zoneId: 'UTC' };

test('rule 2: pattern field lengths are authoritative when skeleton lengths match', () => {
  // fr short/available yMd pattern is "dd/MM/y": requested yMd (1==1) freezes
  // BOTH digit counts (day 2, month 2).
  expect(calendarsApi('fr').formatDate(d5, { skeleton: 'yMd' })).toEqual('05/07/2024');
  expect(calendarsApi('fr').formatDate(d15, { skeleton: 'yMd' })).toEqual('15/07/2024');
  // 1-digit patterns stay 1-digit (freeze in the narrow direction).
  expect(calendarsApi('en').formatDate(d5, { skeleton: 'yMd' })).toEqual('7/5/2024');
});

test('rule 2: widths adjust only when skeleton lengths differ', () => {
  // requested yMMd (month length 2) vs matched yMd (length 1): widen.
  expect(calendarsApi('en').formatDate(d15, { skeleton: 'yMMd' })).toEqual('07/15/2024');
  // 2-digit pattern locales keep their digits for yMd.
  expect(calendarsApi('pl').formatDate(d15, { skeleton: 'yMd' })).toEqual('15.07.2024');
  expect(calendarsApi('lt').formatDate(d15, { skeleton: 'yMd' })).toEqual('2024-07-15');
  expect(calendarsApi('sv').formatDate(d15, { skeleton: 'yMd' })).toEqual('2024-07-15');
  expect(calendarsApi('hu').formatDate(d15, { skeleton: 'yMd' })).toEqual('2024. 07. 15.');
});

test('standards are keyed by CLDR dateSkeletons (no shadowing of available entries)', () => {
  // ja/zh full is y年M月d日EEEE (dateSkeletons: yMMMEEEEd), so available
  // yMEd ("y/M/d(E)" / "y/M/dE") is reachable for numeric-month requests.
  expect(calendarsApi('ja').formatDate(d15, { skeleton: 'yMEd' })).toEqual('2024/7/15(月)');
  expect(calendarsApi('zh').formatDate(d15, { skeleton: 'yMEd' })).toEqual('2024/7/15周一');
  // es available yMMMMEd ("EEE, d 'de' MMMM 'de' y") is distance-0 for yMMMMdE.
  expect(calendarsApi('es').formatDate(d15, { skeleton: 'yMMMMdE' })).toEqual('lun, 15 de julio de 2024');
});
