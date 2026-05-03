import { describe, expect, test } from "bun:test";
import yyparse from "../../parser/evaParser" // Fix - replace with alias to root
import { Eva, type Expr } from "../../src/eva";


describe("Lambda Functions", () => {

    test("should interpret lambda functions correctly", () => {
        const eva = new Eva()
        const ast = yyparse.parse(`
        (begin
            (def onClick(callback) 
                (begin
                    (var x 10)
                    (var y 20)
                    (callback (+ x y))
                )
            )
    
            (onClick (lambda (data) (* data 10)))
        
            )`)
        expect(ast).toBeDefined();
        const evaluated_ast = eva.eval(ast as Expr)
        expect(evaluated_ast).toEqual(300)
    });
    
    test("Should define a variable as a lambda expression, and call it", () => {
        const eva = new Eva()
        const ast = yyparse.parse(`
        (begin (
            var x (lambda (data) (* data 10)) 
    
                )
            (x 10) 
        )
    
    
            `)
        expect(ast).toBeDefined();
        // console.log(ast)
        const evaluated_ast = eva.eval(ast as Expr)
        expect(evaluated_ast).toEqual(100)
        // expect(evaluated_ast).toMatchObject({
        //     params: expect.anything(),
        //     body: expect.any(Array),
        //     env: expect.anything(),
        // });
    })
    
    
    test("Should save lambda function to variable", () => {
        const eva = new Eva()
        const ast = yyparse.parse(`
        (begin
        
            (var square 
                (lambda (x) (* x x))
            )
            (square 2)
        )
        `)
        expect(ast).toBeDefined();
        const evaluated_ast = eva.eval(ast as Expr)
        expect(evaluated_ast).toEqual(4)
    })
    
    
    test("lambda form evaluates to a user function object", () => {
        const eva = new Eva();
        const ast = yyparse.parse("(begin (lambda (x) (* x x)))") as Expr;
        const v = eva.eval(ast);
        expect(v).toMatchObject({
            params: expect.anything(),
            body: expect.any(Array),
            env: expect.anything(),
        });
    });
});
