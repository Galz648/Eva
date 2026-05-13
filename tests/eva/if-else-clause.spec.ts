import { describe, test, expect } from "bun:test";
import { Eva } from "../../src/eva";
import yyparse from "../../parser/evaParser";

describe("if-else clause", () => {
  test("evaluates if condition to consequent (if branch)", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var x 42)
        (var y 0)
        (if (> x 10)
          (set y 1)
          (set y -1)
        )
        y
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(1);
  });


  test("evaluates if condition to alternate (else branch)", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var x 2)
        (var y 0)
        (if (> x 10)
          (set y 1)
          (set y -1)
        )
        y
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(-1);
  });

  test("else branch handles nested expressions", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var x 0)
        (var res 0)
        (if (== x 1)
          (set res 100)
          (set res (+ 2 3))
        )
        res
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(5);
  });

  test("if branch handles expressions as condition (false)", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var x 5)
        (if (== x 7)
          99
          123
        )
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(123);
  });

  test("if branch handles expressions as condition (true)", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var x 7)
        (if (== x 7)
          99
          123
        )
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(99);
  });
});

describe("else clause", () => {
  test("executes alternate when condition is false", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var x 1)
        (if (== x 2)
          10
          20
        )
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(20);
  });

  test("alternate branch handles complex expression", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var y 1)
        (if (== y 2)
          (set y (* 2 10))
          (set y (+ 3 8))
        )
        y
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(11);
  });

  test("alternate branch can be nested if", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (begin
        (var flag 0)
        (var out 0)
        (if (== flag 1)
          (set out 100)
          (if (> 2 1)
            (set out 200)
            (set out 300)
          )
        )
        out
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(200);
  });

  test("alternate branch can return value directly", () => {
    const eva = new Eva();
    const ast = yyparse.parse(`
      (if false
        400
        500
      )
    `);
    const result = eva.eval(ast);
    expect(result).toEqual(500);
  });
});
