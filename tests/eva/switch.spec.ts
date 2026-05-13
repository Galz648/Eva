import { describe, expect, test } from "bun:test";
import yyparse from "../../parser/evaParser" // Fix - replace with alias to root
import { Eva, type Expr } from "../../src/eva";

describe("Syntax Sugar", () => {
    test("evaluate switch statement (with else branch)", () => {

        const eva = new Eva()
        const ast = yyparse.parse(`
            (begin
            (var x 5)
            (switch (
            ((== x 10) 100)
            ((> x 10) 200)
            (else 300))
            )
        )`)
        const evaluated_ast = eva.eval(ast as Expr)
        expect(evaluated_ast).toEqual(100)
    })
    test("evaluate switch statement (without else branch)", () => {

        const eva = new Eva()
        const ast = yyparse.parse(`
            (begin
            (var x 10)
            (switch (
            ((== x 10) 100)
            ((> x 10) 200)
            )
            )
        )`)
        console.log(ast)
        const evaluated_ast = eva.eval(ast as Expr)
        expect(evaluated_ast).toEqual(100)
    })


    /*
    ["switch", [
    [ "==", "x", 10 ],
    [ "==", "x", 10 ],
    // ], ["else", 300]]
    [ "switch", [
    [ "==", "x", 10 ], 100], [[ ">", "x", 10 ], 200
  ], [ "else", 300 ] ]

     */
    // test("evaluate switch statement (with else branch)", () => {

    //     const eva = new Eva()
    //     const ast = yyparse.parse(`
    //     (begin
    //         (var x 10)
    //         (switch ((== x 10) 100)
    //                 ((> x 10) 200)
    //                 (else     300))
    //     )`)
    //     const evaluated_ast = eva.eval(ast as Expr)
    //     expect(evaluated_ast).toEqual(100)
    // })
})





