import { Cache } from '@phensley/cldr-utils';
import { pluralRules, PluralRules } from '@phensley/plurals';
import { buildMessageMatcher, parseMessagePattern, MessageCode, MessageMatcher } from './parser';
import { MessageArg, MessageEngine, MessageFormatFuncMap, MessageNamedArgs } from './evaluation';
import { DefaultMessageArgConverter, MessageArgConverter } from './evaluation/converter';

const DEFAULT_CACHE_SIZE = 100;

/**
 * Configures a MessageFormatter instance.
 *
 * @public
 */
export interface MessageFormatterOptions {

  /**
   * Language code, e.g. "en"
   */
  language?: string;

  /**
   * Region code. e.g. "US"
   */
  region?: string;

  /**
   * The plural rules you want to use. Otherwise it will be selected
   * using the language + region.
   */
  plurals?: PluralRules;

  /**
   * Functions to map raw arguments to the types required by the internal tags,
   * 'plural', 'select', 'selectordinal'.
   */
  converter?: MessageArgConverter;

  /**
   * Custom formatting functions.
   */
  formatters?: MessageFormatFuncMap;

  /**
   * Number of parsed messages to cache internally.
   */
  cacheSize?: number;
}

/**
 * Convenience class that caches parsed messages.
 *
 * @public
 */
export class MessageFormatter {

  private plurals: PluralRules;
  private converter: MessageArgConverter;
  private formatters: MessageFormatFuncMap;
  private matcher: MessageMatcher;
  private cache: Cache<MessageCode>;

  constructor(options: MessageFormatterOptions = {}) {
    this.formatters = options.formatters || {};
    this.converter = options.converter || new DefaultMessageArgConverter();
    this.plurals = options.plurals || pluralRules.get(options.language || 'root', options.region);
    const size = options.cacheSize || DEFAULT_CACHE_SIZE;
    this.matcher = buildMessageMatcher(Object.keys(this.formatters));
    this.cache = new Cache<MessageCode>(s => parseMessagePattern(s, this.matcher), size);
  }

  /**
   * Parse and evaluate the message against the given argument. Internally caches parsed
   * messages for reuse.
   */
  format(message: string, positional: MessageArg[], named: MessageNamedArgs): string {
    const code = this.cache.get(message);
    return new MessageEngine(this.plurals, this.converter, this.formatters, code)
      .evaluate(positional, named);
  }

  /**
   * String representation of this formatter.
   */
  toString(): string {
    return `MessageFormatter(formatters=${JSON.stringify(Object.keys(this.formatters))} cached=${this.cache.size()})`;
  }

}
