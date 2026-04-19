import { describe, expect, test } from "bun:test";
import { Environment, Eva } from "../src/eva";

describe("Self Evaluating Expressions", () => {

    test("can evaluate number", () => {
        const env = new Environment(null)
        const num = 3
        const eva = new Eva(new Environment(null))
        eva.eval(num, env)
    })


    test("Should evaluate as string", () => {
        const env = new Environment(null)
        const str = "'abc'"
        const eva = new Eva()
        const evaluated_string = eva.eval(str, env)

        expect(evaluated_string).toEqual(str.slice(1, -1))
    })
})
