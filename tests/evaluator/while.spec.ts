import { test, describe, expect, xdescribe } from "bun:test"
import { Environment, Eva, type Expr } from "../../src/eva"


/* 
if <expression> <consequent> <alternate>


comparison operators

*/
describe("while", () => {
    test("should increment variable while condition is true", () => {
        const eva = new Eva()
        expect(eva.eval(["begin",
            ["var", "counter", 0],
            ["while", ["<", "counter", 10], ["begin",
                ["set", "counter", 10]
            ]],
            "counter"
        ])).toEqual(10)


    })

})
