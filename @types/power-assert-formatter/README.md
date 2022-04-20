# Installation
> `npm install --save @types/power-assert-formatter`

# Summary
This package contains type definitions for power-assert-formatter (https://github.com/twada/power-assert-formatter).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/power-assert-formatter.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/power-assert-formatter/index.d.ts)
````ts
// Type definitions for power-assert-formatter 1.4.1
// Project: https://github.com/twada/power-assert-formatter
// Definitions by: vvakame <https://github.com/vvakame>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare function powerAssertFormatter(options?:powerAssertFormatter.Options):powerAssertFormatter.Formatter;

declare namespace powerAssertFormatter {
    export interface Options {
        lineDiffThreshold?: number | undefined;
        maxDepth?: number | undefined;
        outputOffset?: number | undefined;
        anonymous?: string | undefined;
        circular?: string | undefined;
        lineSeparator?: string | undefined;
        ambiguousEastAsianCharWidth?: number | undefined;
        widthOf?: Function | undefined;
        stringify?: Function | undefined;
        diff?: Function | undefined;
        writerClass?: {new (): any;} | undefined;
        renderers?: any[] | undefined; // { string | Function }[]
    }

    export interface Formatter {
        (powerAssertContext:any): string;
    }

    export function defaultOptions():Options;
}

export = powerAssertFormatter;
export as namespace powerAssertFormatter;

````

### Additional Details
 * Last updated: Wed, 07 Jul 2021 17:02:35 GMT
 * Dependencies: none
 * Global values: `powerAssertFormatter`

# Credits
These definitions were written by [vvakame](https://github.com/vvakame).
