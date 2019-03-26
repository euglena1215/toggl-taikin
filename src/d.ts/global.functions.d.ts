declare namespace glFunctions {
  interface global {
    main(): void;
    doPost(e): void;
  }
}

declare var global: glFunctions.global;
