import { test, describe, expect } from "bun:test"
import { Environment, Eva, type Expr } from "../../src/eva"

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

    test("Should set variable in outer scope within inner scope", () => {
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


        expect(calculation).toEqual(100)

    })
})
