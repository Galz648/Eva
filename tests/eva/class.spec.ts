import { describe, expect, test } from "bun:test";
import yyparse from "../../parser/evaParser";
import { Eva, type Expr } from "../../src/eva";

describe("Class", () => {
  test("should define and instantiate a class", () => {
    const eva = new Eva();
    const ast = yyparse.parse()

    const evaluated = eva.eval(ast as Expr);
    expect(evaluated).toEqual(30);
  });

});
