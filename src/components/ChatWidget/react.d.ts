declare module "react" {
  export type SetStateAction<S> = S | ((previousState: S) => S);
  export type Dispatch<A> = (value: A) => void;

  export function useEffect(
    effect: () => void | (() => void),
    dependencies?: readonly unknown[],
  ): void;

  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T>(initialValue: T | null): { current: T | null };

  export function useState<S>(
    initialState: S | (() => S),
  ): [S, Dispatch<SetStateAction<S>>];
}

declare module "react/jsx-runtime" {
  export function jsx(...args: any[]): any;
  export function jsxs(...args: any[]): any;
  export function Fragment(...args: any[]): any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
