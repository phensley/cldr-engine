/**
 * Example of inconsistency in range formatting in ICU.
 * The output was produced with Node v23.7.0 and ICU 74.
 *
 * Below we format two dates two different ways:
 *
 *   2007-Jan-01 10:12
 *   2008-Jan-02 11:13
 *
 * We format "day" then "day and minutes". We get:
 *
 *    "1/1/2007 – 1/2/2008"
 *    "1, 12 – 2, 13"
 *
 * The first expands the pattern to include year and month,
 * but the second does not. The additional context is added
 * in one case but not the other.
 *
 */
const OPTS = [
  { day: 'numeric' },
  { day: 'numeric', minute: '2-digit' }
];
const start = new Date(Date.UTC(2007, 0, 1, 10, 12, 0));
const end = new Date(Date.UTC(2008, 0, 2, 11, 13, 0));
for (let i = 0; i < OPTS.length; i++) {
  const opts = OPTS[i];
  const fmt = new Intl.DateTimeFormat('en', opts);
  console.log(fmt.formatRange(start, end));
}
