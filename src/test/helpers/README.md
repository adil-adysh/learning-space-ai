# Test helpers

withSilentConsole

- `withSilentConsole()` returns an object `{ restore(): void }` that silences `console.debug` and `console.info` by default and lets you restore them when you need to see logs for debugging.

Usage:

```ts
import { withSilentConsole } from "../../test/helpers/withSilentConsole";

// Temporarily enable console in a single test
const s = withSilentConsole();
s.restore(); // restores console.debug/info

// Or to re-enable console only inside a test
// const s = withSilentConsole();
// try { /* run test steps that should print */ } finally { s.restore(); }
```
