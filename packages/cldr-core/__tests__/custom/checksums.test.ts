import { customFramework, customPack } from '../_helpers';

test('correct', () => {
  const lang = 'en';
  const cfg = { calendars: ['buddhist'] };
  const path = customPack(lang, cfg);
  const framework = customFramework(path, cfg);
  framework.get(lang);
  expect(() => framework.get(lang)).not.toThrow();
});

test('mismatch', () => {
  const lang = 'en';
  const path = customPack(lang, { calendars: ['buddhist']});
  const framework = customFramework(path, { calendars: [] });
  expect(() => framework.get(lang)).toThrowError('Checksum mismatch');
});

test('mismatch (key order matters)', () => {
  const lang = 'en';
  const path = customPack(lang, { 'number-system-name': ['arab', 'guru', 'deva']});
  const framework = customFramework(path, { 'number-system-name': ['deva', 'guru', 'arab'] });
  expect(() => framework.get(lang)).toThrowError('Checksum mismatch');
});
