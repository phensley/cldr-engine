import { Cache } from '@phensley/cldr-utils';
import { pluralRules, PluralRules } from '@phensley/plurals';
import { buildMessageMatcher, parseMessagePattern, MessageCode, MessageMatcher } from './parser';
import { MessageArg, MessageEngine, MessageFormatFuncMap, MessageNamedArgs } from './evaluation';

const DEFAULT_CACHE_SIZE = 100;

export interface MessageFormatterOptions {
  language?: string;
  region?: string;

  // The plural rules you want to use. Otherwise it will be selected
  // using the language + region.
  plurals?: PluralRules;
  formatters?: MessageFormatFuncMap;
  cacheSize?: number;
}

/**
 * Convenience class that caches parsed messages.
 */
export class MessageFormatter {

  private plurals: PluralRules;
  private formatters: MessageFormatFuncMap;
  private matcher: MessageMatcher;
  private cache: Cache<MessageCode>;

  constructor(options: MessageFormatterOptions = { }) {
    this.formatters = options.formatters || {};
    this.plurals = options.plurals || pluralRules.get(options.language || 'root', options.region);
    const size = options.cacheSize || DEFAULT_CACHE_SIZE;
    this.matcher = buildMessageMatcher(Object.keys(this.formatters));
    this.cache = new Cache<MessageCode>(s => parseMessagePattern(s, this.matcher), size);
  }

  format(message: string, positional: MessageArg[], named: MessageNamedArgs): string {
    const code = this.cache.get(message);
    return new MessageEngine(this.plurals, this.formatters, code).evaluate(positional, named);
  }

  toString(): string {
    return `MessageFormatter(formatters=${JSON.stringify(Object.keys(this.formatters))} cached=${this.cache.size()})`;
  }

}
