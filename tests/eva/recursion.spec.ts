import { expect, test } from "bun:test";
import yyparse from "../../parser/evaParser" // Fix - replace with alias to root
import { Eva, type Expr } from "../../src/eva";
test("Should parse and evaluate recursive function correctly ", () => {
    const eva = new Eva()
    const ast = yyparse.parse(`(begin 
        (def factorial (x) 
            (if (== x 1)
            1
            (* x (factorial (- x 1)))))

            (factorial 5)

    )`)
    expect(ast).toBeDefined();
    expect(eva.eval(ast as Expr)).toEqual(120)
});
