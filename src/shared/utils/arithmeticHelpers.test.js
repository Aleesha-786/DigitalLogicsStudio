import { cleanBin, binaryAdd, halfAdder } from "./arithmeticHelpers";

describe("cleanBin", () => {
  test("keeps only 0s and 1s", () => {
    expect(cleanBin("1a0 1'2")).toBe("101");
    expect(cleanBin("A'B + C")).toBe("");
  });

  test("handles empty values", () => {
    expect(cleanBin("")).toBe("");
    expect(cleanBin(null)).toBe("");
    expect(cleanBin(undefined)).toBe("");
  });
});

describe("binary helpers", () => {
  test("halfAdder", () => {
    expect(halfAdder("1", "1")).toEqual({ sum: "0", carry: "1" });
  });

  test("binaryAdd adds with carry and ignores non-binary characters", () => {
    expect(binaryAdd("110", "11", "0").sum).toBe("1001");
    expect(binaryAdd("1x0", "11", "0").sum).toBe("101");
  });
});
