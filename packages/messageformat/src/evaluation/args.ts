/**
 * An argument value can have any type. We cast at the time of evaluation.
 * This allows us to accept rich arguments for user-defined custom formatters.
 *
 * @public
 */
export type MessageArg = any;

/**
 * Named args where each argument is given an explicit associative index or name.
 * These can override positional arguments.
 *
 * @public
 */
export type MessageNamedArgs = {
  [s: string]: MessageArg;
  [n: number]: MessageArg;
};

/**
 * Combined positional and named arguments.
 *
 * @public
 */
export type MessageArgs = {
  positional: MessageArg[];
  named: MessageNamedArgs;
};
