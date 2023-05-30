const ArrayUtils = require('../source/array-utils.js').ArrayUtils;

describe("ArrayUtils", () => {

    it("Should pop", () => {
        // given
        const input = [1, 2, 3];
        // when
        const output = ArrayUtils.pop(input, 2);
        // then
        expect(input).toEqual([1]);
        expect(output).toEqual([3, 2]);
    });

    it("Should count", () => {
        // given
        const input = [{ x: 1 }, { x: 2 }, { x: 1 }];
        // when
        const result = ArrayUtils.count(input, 'x', 1);
        // then
        expect(result).toEqual(2);
    });

    it("Should find", () => {
        // given
        const input = [{ x: 1 }, { x: 2 }, { x: 1 }];
        // when
        const result = ArrayUtils.find(input, 'x', 2);
        // then
        expect(result).toEqual({x: 2});
    });
});
