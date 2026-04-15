import { test, describe, expect } from "bun:test"
import { Eva, isString, type Expr } from "../src/eva"

test("can evaluate number", () => {
    const num = 3
    const eva = new Eva()
    eva.eval(num)
})


test("Should evaluate as string", () => {
    const str = "'ABC'"
    const eva = new Eva()
    const evaluated_string = eva.eval(str)

    expect(evaluated_string).toEqual(str.slice(1, -1))
})


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


