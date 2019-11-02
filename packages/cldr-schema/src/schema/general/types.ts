import {
  ContextTransformFieldType,
  FieldArrow,
  ListPatternPositionType,
  Vector1Arrow
} from '@phensley/cldr-types';

export interface LayoutSchema {
  readonly characterOrder: FieldArrow;
  readonly lineOrder: FieldArrow;
}

export interface ListPatternsSchema {
  readonly and: Vector1Arrow<ListPatternPositionType>;
  readonly andShort: Vector1Arrow<ListPatternPositionType>;
  readonly or: Vector1Arrow<ListPatternPositionType>;
  readonly unitLong: Vector1Arrow<ListPatternPositionType>;
  readonly unitNarrow: Vector1Arrow<ListPatternPositionType>;
  readonly unitShort: Vector1Arrow<ListPatternPositionType>;
}

export interface ContextTransformsSchema {
  readonly contextTransforms: Vector1Arrow<ContextTransformFieldType>;
}
