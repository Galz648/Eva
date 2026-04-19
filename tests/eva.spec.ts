import { test, describe, expect } from "bun:test"
import { Environment, Eva, type Expr } from "../src/eva"


describe("Self Evaluating Expressions", () => {

    test("can evaluate number", () => {
        const env = new Environment(null)
        const num = 3
        const eva = new Eva(new Environment(null))
        eva.eval(num, env)
    })


    test("Should evaluate as string", () => {
        const env = new Environment(null)
        const str = "'abc'"
        const eva = new Eva()
        const evaluated_string = eva.eval(str, env)

        expect(evaluated_string).toEqual(str.slice(1, -1))
    })
})

describe("Variables", () => {
    test("should succeed with variable lookup", () => {
        const env = new Environment(null)
        const eva = new Eva()
        env.define("x", 10)
        const result = env.lookup("x")
        expect(result).toEqual(10)
    })

    test("should fail with variable lookup", () => {
        const env = new Environment(null)
        const eva = new Eva()
        expect(() => env.lookup("x")).toThrow(new Error("Variable x not found"))
    })


    test("should succeed with variable lookup in parent environment", () => {
        const env = new Environment(null)
        const eva = new Eva(new Environment(null, new Map([["x", 10]])))
        const result = eva.eval("x")
        expect(result).toEqual(10)
    })
})

describe("Commands", () => {
    test("Should define (var) variable", () => {
        const env = new Environment(null)
        const eva = new Eva()
        const result = eva.eval(["var", "x", 10], env)
        expect(result).toEqual(10)
    })

})

describe("Math Operations", () => {

    test("can add numbers", () => {
        const env = new Environment(null)
        const str: Expr = ["+", 1, 2]
        const eva = new Eva()
        const calculation = eva.eval(str, env)

        expect(calculation).toEqual(3)
    })

    test("should perform complex (nested) number addition", () => {
        const env = new Environment(null)
        const str: Expr = ["+", 5, ["+", 1, 2]]
        const eva = new Eva()
        const calculation = eva.eval(str, env)

        expect(calculation).toEqual(8)
    })

    test("can multiply numbers", () => {
        const env = new Environment(null)
        const str: Expr = ["*", 2, 2]
        const eva = new Eva()
        const calculation = eva.eval(str, env)

        expect(calculation).toEqual(4)
    })
})


describe("Blocks", () => {
    test("should evaluate expressions inside of block (begin keyword)", () => {
        const env = new Environment(null)
        const eva = new Eva()
        const calculation = eva.eval(['begin', [['var', 'x', 10], ['var', 'y', 10], ['+', ['*', 'x', 'y'], 30]]], env)


        expect(calculation).toEqual(130)
    })

    test("should evaluate nested expressions inside block", () => {
        const env = new Environment(null)
        const eva = new Eva()
        const calculation = eva.eval(['begin',
            [['var', 'x', 10],
            ['begin',
                [
                    ['var', 'x', 20],
                    'x',
                ]
            ],
                'x'
            ]], env)


        expect(calculation).toEqual(10)
    })

    test("should evalute outer scope variable inside inner scope", () => {
        const env = new Environment(null)
        const eva = new Eva()
        const calculation = eva.eval(
            ['begin',
                [['var', 'value', 10],
                ['var', 'result', ['begin',
                    [
                        ['var', 'x', ['+', 'value', 10]],
                        'x'
                    ]
                ]],
                    "result"
                ]], env)


        expect(calculation).toEqual(20)

    })

    test("should evalute outer scope variable inside inner scope", () => {
        const env = new Environment(null)
        const eva = new Eva()
        const calculation = eva.eval(
            ['begin',
                [
                    ['var', 'data', 10],
                    ['begin',
                        [
                            ['set', 'data', 100],
                        ]
                    ],
                    "data"
                ]], env)


        expect(calculation).toEqual(20)

    })
})
