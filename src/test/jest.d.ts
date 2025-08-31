/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import type { Mock } from "jest";

declare global {
  var fetch: Mock<typeof fetch>;
}
