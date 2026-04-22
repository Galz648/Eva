import { expect, test } from "bun:test";
import yyparse from "../../parser/evaParser"
test("should convert S expression block to AST", () => {
    const ast = yyparse.parse("(begin (var x 10) (var y 20))")
    expect(ast).toBeDefined();
});
