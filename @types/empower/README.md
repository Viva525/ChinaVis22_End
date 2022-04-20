# Installation
> `npm install --save @types/empower`

# Summary
This package contains type definitions for empower (https://github.com/power-assert-js/empower).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/empower.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/empower/index.d.ts)
````ts
// Type definitions for empower 1.2
// Project: https://github.com/power-assert-js/empower
// Definitions by: vvakame <https://github.com/vvakame>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.5

import { Options as CoreOptions } from 'empower-core';
import { Formatter } from 'power-assert-formatter';

/**
 * Enhances Power Assert feature to assert function/object.
 *
 * @param originalAssert An instance of standard `assert` function or any assert-like object to enhance.
 * @param formatter A formatter function created by power-assert-formatter.
 * @param options Configuration options. If not passed, default options will be used.
 * @return Enhanced assert function/object.
 */
declare function empower<T>(originalAssert: T, formatter: Formatter, options?: empower.Options): T;

declare namespace empower {
    // The omitted options can be provided, but they will be always overridden.
    type Options = Omit<CoreOptions, 'modifyMessageBeforeAssert' | 'onError'> & {
        /**
         * If truthy, modify message property of `AssertionError` on rethrow.
         *
         * @default false
         */
        modifyMessageOnRethrow?: boolean | undefined;
        /**
         * If truthy, add `powerAssertContext` property to `AssertionError` on rethrow.
         *
         * @default false
         */
        saveContextOnRethrow?: boolean | undefined;
    };

    /**
     * Returns default options object for `empower` function.
     */
    function defaultOptions(): Required<Options>;
}

export = empower;

````

### Additional Details
 * Last updated: Tue, 06 Jul 2021 19:03:12 GMT
 * Dependencies: [@types/empower-core](https://npmjs.com/package/@types/empower-core), [@types/power-assert-formatter](https://npmjs.com/package/@types/power-assert-formatter)
 * Global values: none

# Credits
These definitions were written by [vvakame](https://github.com/vvakame).
