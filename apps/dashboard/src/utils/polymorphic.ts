type AsProp<T extends React.ElementType> = {
  as?: T;
};

type PropsToOmit<T extends React.ElementType, P> = keyof (AsProp<T> & P);

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type PolymorphicComponentProp<T extends React.ElementType, Props = {}> = React.PropsWithChildren<Props & AsProp<T>> &
  Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>;

export type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>['ref'];

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type PolymorphicComponentPropWithRef<T extends React.ElementType, Props = {}> = PolymorphicComponentProp<T, Props> & {
  ref?: PolymorphicRef<T>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PolymorphicComponentPropsWithRef<T extends React.ElementType, P = {}> = PolymorphicComponentPropWithRef<
  T,
  P
>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PolymorphicComponentProps<T extends React.ElementType, P = {}> = PolymorphicComponentProp<T, P>;

export type PolymorphicComponent<P> = {
  <T extends React.ElementType>(props: PolymorphicComponentPropsWithRef<T, P>): React.ReactNode;
};
