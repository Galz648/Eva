import { describe, expect, test } from "bun:test";
import { Environment, Eva } from "../src/eva";

describe("Variables", () => {
    test("should succeed with variable lookup", () => {
        const env = new Environment(null)
        const eva = new Eva()
        env.define("x", 10)
        const result = env.lookup("x")
        expect(result).toEqual(10)
    })

    test("should fail with variable lookup", () => {
        const env = new Environment(null)
        const eva = new Eva()
        expect(() => env.lookup("x")).toThrow(new Error("Variable x not found"))
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





