import { test } from "bun:test";
import { Environment, Eva, type Expr } from "../../src/eva"
test("should call builtin functions", () => {
    const eva = new Eva()
    eva.eval(["+", 1, 2])
})
