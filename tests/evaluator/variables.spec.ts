import { describe, expect, test } from "bun:test"
import { Environment, Eva } from "../../src/eva"

describe("Variables", () => {
    test("should resolve function from global scope via lookup (default global environment)", () => {

        const eva = new Eva();
       
        const result: Function = eva.global.lookup("+") as Function;
        expect(typeof result).toBe("function");
        expect(result(2, 3)).toEqual(5);

    })
    test("should resolve function from global scope via lookup", () => {
        const env = new Environment(null, new Map([["+", (a: number, b: number) => a + b]]));
        const eva = new Eva(env);
        const result: Function = env.lookup("+") as Function;
        expect(typeof result).toBe("function");
        expect(result(2, 3)).toEqual(5);

    })
    test("should resolve variable from global scope via lookup", () => {
        const globalEnv = new Environment(null, new Map([["x", 10]]))
        const eva = new Eva(globalEnv)
        const result = globalEnv.lookup("x")
        expect(result).toEqual(10)
    })
    test("Should succeed with variable lookup, through eval", () => {
        const eva = new Eva()
        eva.eval(["var", "x", 10])
        const x = eva.eval("x")
        expect(x).toEqual(10)
    })
    test("should succeed with variable lookup", () => { // TODO: change implementation - define "x" not using internal functions
        const env = new Environment(null)
        const eva = new Eva()
        env.define("x", 10)
        const result = env.lookup("x")
        expect(result).toEqual(10)
    })

    test("should fail with variable lookup", () => {
        const env = new Environment(null)
        const eva = new Eva()
        expect(() => env.lookup("x")).toThrow()
    })


    test("should succeed with variable lookup in parent environment", () => {
        const env = new Environment(null)
        const eva = new Eva(new Environment(null, new Map([["x", 10]])))
        const result = eva.eval("x")
        expect(result).toEqual(10)
    })
})

// TODO: consolidate these 2 describe blocks
describe("Commands", () => {
    test("Should define (var) variable", () => {
        const env = new Environment(null)
        const eva = new Eva()
        const result = eva.eval(["var", "x", 10], env)
        expect(result).toEqual(10)
    })

    test("Should assign (set) variable", () => {
        const env = new Environment(null)
        const eva = new Eva()
        env.define("x", 10) // TODO: refrain from using internal implementation in tests - replace with global declaration in `Environment`?
        const result = eva.eval(["set", "x", 20], env) // Set variable in current environment
        expect(result).toEqual(20)
    })

})





