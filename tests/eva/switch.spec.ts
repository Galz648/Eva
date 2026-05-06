import { describe, expect, test } from "bun:test";
import yyparse from "../../parser/evaParser" // Fix - replace with alias to root
import { Eva, type Expr } from "../../src/eva";
describe("Syntax Sugar", () => {
    test("evaluate switch statement correctly", () => {

        const eva = new Eva()
        const ast = yyparse.parse(`
        (begin
            (var x 10)
            (switch (== x 10) (begin (set x 100)) (200))
            x
        )`)
        const evaluated_ast = eva.eval(ast as Expr)
        expect(evaluated_ast).toEqual(100)
    })
})
