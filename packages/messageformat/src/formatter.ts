import { Cache } from '@phensley/cldr-utils';
import { buildMessageMatcher, parseMessagePattern, MessageCode, MessageMatcher } from './parser';
import { MessageArg, MessageEngine, MessageFormatFuncMap, MessageNamedArgs } from './evaluation';

const DEFAULT_CACHE_SIZE = 100;

export interface MessageFormatterOptions {
  formatters?: MessageFormatFuncMap;
  cacheSize?: number;
}

/**
 * Convenience class that caches parsed messages.
 */
export class MessageFormatter {

  private formatters: MessageFormatFuncMap;
  private matcher: MessageMatcher;
  private cache: Cache<MessageCode>;

  constructor(private language: string, options: MessageFormatterOptions = {}) {
    this.formatters = options.formatters || {};
    const size = options.cacheSize || DEFAULT_CACHE_SIZE;
    this.matcher = buildMessageMatcher(Object.keys(this.formatters));
    this.cache = new Cache<MessageCode>(s => parseMessagePattern(s, this.matcher), size);
  }

  format(message: string, positional: MessageArg[], named: MessageNamedArgs): string {
    const code = this.cache.get(message);
    return new MessageEngine(this.language, this.formatters, code).evaluate(positional, named);
  }

  toString(): string {
    return `MessageFormatter(formatters=${JSON.stringify(Object.keys(this.formatters))} cached=${this.cache.size()})`;
  }

}
