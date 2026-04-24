import { test, describe, expect } from "bun:test"
import { Environment, Eva, type Expr } from "../../src/eva"

describe("Math Operations", () => {

    test("can add numbers", () => {

        const str: Expr = ["+", 1, 2]
        const eva = new Eva()
        const calculation = eva.eval(str)

        expect(calculation).toEqual(3)
    })

    test("should perform complex (nested) number addition", () => {
        const str: Expr = ["+", 5, ["+", 1, 2]]
        const eva = new Eva()
        const calculation = eva.eval(str)

        expect(calculation).toEqual(8)
    })

    test("can multiply numbers", () => {

        const str: Expr = ["*", 2, 2]
        const eva = new Eva()
        const calculation = eva.eval(str)

        expect(calculation).toEqual(4)
    })
})
