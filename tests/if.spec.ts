import { test, describe, expect } from "bun:test"
import { Environment, Eva, type Expr } from "../src/eva"


/* 
if <expression> <consequent> <alternate>


comparison operators

*/
describe("if", () => {
    test("should evaluate if condition to if branch", () => {
        const eva = new Eva()

        const y_alternate = 30
        const block_evaluation = eva.eval(["begin", [
            ["var", "x", 20],
            ["var", "y", 1],
            ["if",
                [">", "x", 10],
                ["set", "y", 20],
                ["set", "y",y_alternate]
            ],
            "y"
        ]])

        expect(block_evaluation).toEqual(20)
    })
    test("should evaluate if condition to else branch", () => {
        const eva = new Eva()

        const y_after_assignment = 30
        const block_evaluation = eva.eval(["begin", [
            ["var", "x", 1],
            ["var", "y", 1],
            ["if",
                [">", "x", 10],
                ["set", "y", 20],
                ["set", "y", y_after_assignment]
            ],
            "y"
        ]])

        expect(block_evaluation).toEqual(y_after_assignment)
    })

})
