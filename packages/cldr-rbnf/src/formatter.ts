
// API NumbersImpl

    // this.algorithmic = new AlgorithmicNumberingSystems(bundle.spellout(),
    //   bundle.tag().expanded(), bundle.languageScript());



  // formatRuleBased(n: DecimalArg, options?: RuleBasedFormatOptions): string {
  //   options = options || {};
  //   const rule = options.rule || 'spellout-numbering';
  //   const params = this.privateApi.getNumberParams('latn', 'default');
  //   const system = this.algorithmic.rbnf(rule, params.symbols);
  //   const info = this.privateApi.getContextTransformInfo();
  //   return system ?
  //     this.numbers.formatRuleBased(this.bundle, this.numbers.stringRenderer(params),
  //       system, info, coerceDecimal(n), options, params) : '';
  // }

  // ruleBasedFormatNames(): string[] {
  //   return this.algorithmic.rulenames.slice(0);
  // }

// INTERNAL NumbersImpl

  /**
   * Prototyping the spellout interface and implementation.
   *
   * VERY ALPHA UNTIL FURTHER NOTICE
   *
   * @alpha
   */
  // formatRuleBased<T>(bundle: Bundle, renderer: NumberRenderer<T>,
  //     system: AlgorithmicNumberingSystem, transform: ContextTransformInfo,
  //     n: Decimal, options: RuleBasedFormatOptions, params: NumberParams): T {

  //   const round = options.round || 'half-even';

  //   // Use standard number pattern to set fallback options for min/max digits, etc.
  //   const latnInfo = this.numbers.numberSystem.get('latn') as NumberSystemInfo;
  //   const info = this.numbers.numberSystem.get(params.numberSystemName) || latnInfo;
  //   const decimalFormats = info.decimalFormats;
  //   const latnDecimalFormats = latnInfo.decimalFormats;
  //   const standardRaw = decimalFormats.standard.get(bundle) || latnDecimalFormats.standard.get(bundle);
  //   const pattern = this.getNumberPattern(standardRaw, n.isNegative());

  //   // Adjust number using pattern
  //   // TODO: mark ordinal rules with flags explicitly
  //   const ordinal = system.name.indexOf('ordinal') !== -1;
  //   if (ordinal) {
  //     // Ordinals must to be rounded to nearest integer
  //     options = {...options, maximumFractionDigits: 0 };
  //   }
  //   const ctx = new NumberContext(options, round, false, false);
  //   ctx.setPattern(pattern);
  //   n = ctx.adjust(n);

  //   // TODO: support parts formatting with rbnf
  //   const fallback = (p: string, num: Decimal) => {
  //     const _p = this.getNumberPattern(p, num.isNegative());
  //     return this.stringRenderer(params).render(num, _p, '', '', params.symbols.decimal, ctx.minInt, false);
  //   };

  //   // Format the number as a string
  //   let s = system.format(n, fallback);

  //   // Context transform the result and return it
  //   s = this.internals.general.contextTransform(s, transform, options.context, 'number-spellout');
  //   return renderer.make('spellout', s);
  // }
