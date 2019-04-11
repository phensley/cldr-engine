import { customFramework, customPack } from '../_helpers';

test('correct', () => {
  const lang = 'en';
  const cfg = { calendars: ['buddhist'] };
  const path = customPack(lang, cfg);
  const framework = customFramework(path, cfg);
  expect(() => framework.get(lang)).not.toThrow();
});

test('mismatch', () => {
  const lang = 'en';
  const path = customPack(lang, { calendars: ['buddhist']});
  const framework = customFramework(path, { calendars: [] });
  expect(() => framework.get(lang)).toThrowError('Checksum mismatch');
});
