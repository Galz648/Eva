import { describe, expect, test } from "bun:test";
import yyparse from "../../parser/evaParser" // Fix - replace with alias to root
import { Eva, type Expr } from "../../src/eva";


describe("Function Definition", () => {

    test.todo("Should define and call a user defined functions (no params)", () => {
        const eva = new Eva()
        const ast = yyparse.parse(`(begin
         (def square (x))
            (* x x))`) as Expr
        expect(ast).toBeDefined();

    })
})

describe("Function Call", () => {
    test("should call builtin functions", () => {
        const eva = new Eva()
        eva.eval(["+", 1, 2])
    })


    test("Should evaluate function as closure", () => {
        const eva = new Eva()
        const ast = yyparse.parse(`
            (begin
              (var x 10)
              (def foo () (begin (var x 20) x))
              (foo)
            )
       
                `) as Expr
        expect(ast).toBeDefined();
        expect(eva.eval(ast)).toBe(20)
    })
})




