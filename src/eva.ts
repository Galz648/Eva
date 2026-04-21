
type Scope = Map<string, string | number>
const commands = ["set", "var"] as const
type Command = typeof commands[number]
type BinOperators = "+" | "*" | "/" | "-"
const comparisonOperators = [">", "<", "==", "!==", "=>", "<="] as const
type ComparisonOperator = typeof comparisonOperators[number]
type Block = ['begin', Expr[]] // NOTE: this diverges from the use a block in the video series
type IfBlock = ['if', Expr, Expr, Expr]
type whileBlock = ["while", Expr, Block] // while, condition, code
type Expr = number | string | [BinOperators | ComparisonOperator, Expr, Expr] | [Command, string, Expr] | Block | IfBlock | whileBlock

class Environment {
    parent: Environment | null
    record: Scope = new Map()

    constructor(parent: Environment | null, record: Scope = new Map()) {
        this.parent = parent
        this.record = record
    }

    resolveScopeByVariableName(variable_name: string): Scope {
        // TODO: lookup in parent

        if (!this.record.has(variable_name)) {
            if (this.parent) {
                return this.parent.resolveScopeByVariableName(variable_name)
            }
            throw Error(`Variable ${variable_name} not found in scope: ${JSON.stringify(this.record)}`)
        }
        return this.record
    }

    lookup(variable_name: string): string | number {
        const scope = this.resolveScopeByVariableName(variable_name)
        const value = scope.get(variable_name)
        if (value !== undefined) {
            return value
        }
        else {
            throw new Error(`Could not resolve lookup for variable ${variable_name}`)
        }
    }

    define(variable_name: string, value: number | string) {
        // TODO: determine if this should throw an error if the variable already exists.
        this.record.set(variable_name, value)
        return value
    }

    assign(variable_name: string, value: number | string) {
        const scope = this.resolveScopeByVariableName(variable_name)
        // set the variable inside the found scope
        scope.set(variable_name, value)
    }
}

class Eva {
    global: Environment
    constructor(global: Environment = new Environment(null, new Map(
    ))) {
        this.global = global
    }

    evalBlock(block: Block, block_env: Environment) {


        let lastest_expression_evaluated // TODO: type this or something
        const expressions: Expr[] = block[1]
        //'begin', 
        // [
        //      ['var', 'x', 10], 
        //      ['var', 'y', 10], 
        //      ['+', ['*', 'x', 'y'], 30]
        // ]
        expressions.forEach((expr) => {
            lastest_expression_evaluated = this.eval(expr, block_env)
        })

        return lastest_expression_evaluated
    }
    eval(expr: Expr, env: Environment = this.global): any { // TODO:type return type
        // Self Evaluating Expressions

        if (isNumber(expr)) {
            return expr
        }

        if (isString(expr)) {
            return expr.slice(1, -1)
        }

        if (isVariableName(expr)) {
            return env.lookup(expr)
        }
        // ------------------------------------------------------------------
        // Math Operations
        if (expr[0] === "+") {
            return this.eval(expr[1], env) + this.eval(expr[2], env) // TODO: add runtime checks

        }
        if (expr[0] === "*") {
            return this.eval(expr[1], env) * this.eval(expr[2], env) // TODO: add runtime checks

        }
        // -----------------------------------------------------------------
        // Blocks - a sequence of expressions

        if (expr[0] === 'begin') {
            // should initialize a block scope environment
            const block_env = new Environment(env, new Map())
            return this.evalBlock(expr, block_env)
        }



        // Commands
        if (isCommand(expr[0])) {
            const [_, var_name, value] = expr
            if (expr[0] == "var") {

                if (isVariableName(var_name)) {
                    env.define(var_name, this.eval(value, env))
                }

                return this.eval(value, env)
            }
            if (expr[0] == "set") {
                // should set the value of the variable in the current environment
                env.assign(var_name as string, this.eval(value, env))
                return this.eval(value, env)
            }
        }

        if (isComparisonOperator(expr[0])) {
            const [operator, arg_1, arg_2] = expr
            const arg_1_value = this.eval(arg_1, env)
            const arg_2_value = this.eval(arg_2, env)

            if (!(isNumber(arg_1_value) && isNumber(arg_2_value))) {
                throw new Error(`Could not compare non-number values, after resolution and evaluation.\n\t expr: ${expr}\n\t typeof arg_1: ${typeof arg_1_value}\n\t typeof arg_2: ${typeof arg_2_value}`)
            }
            if (operator === ">") {
                return arg_1_value > arg_2_value ? true : false
            }
            if (operator === "<") {
                return arg_1_value < arg_2_value ? true : false
            }
            if (operator === "==") {
                return arg_1_value === arg_2_value ? true : false
            }


        }
        if (expr[0] === "if") {
            const [_, condition, if_branch, else_branch] = expr

            if (this.eval(condition, env) === true) { // TODO: replace literal with type
                return this.eval(if_branch, env)
            }
            else if (this.eval(condition, env) === false) {
                return this.eval(else_branch, env)
            }
            else {
                throw new Error(`if condition didn't evaluate to a boolean. ${JSON.stringify(condition)}`)
            }
        }

        if (expr[0] === "while") {
            const [_tag, condition, _do] = expr
            let result
            while (this.eval(condition, env)) {
                result = this.eval(_do, env)
            }
            return result
        }








        else {
            throw new Error(`Expr: ${expr} could not be evaluated`)
        }
    }

}

// function isVariableName(var_name: string): expr is string {

// }
function isString(expr: Expr): expr is string { //TODO: change return type to literal or something
    const result = typeof expr === "string" && (expr[0] === "'" && expr.slice(-1) === "'")
    // console.log(`isString input: ${JSON.stringify(result)} | result: ${JSON.stringify(result)} `)
    return result

}


// type guard number
function isNumber(expr: Expr): expr is number {
    return typeof expr == "number"
}

function isComparisonOperator(operator: string): operator is ComparisonOperator {
    return typeof operator === "string" && comparisonOperators.includes(operator as ComparisonOperator)
}
function isVariableName(expr: Expr): expr is string {
    return typeof expr === "string" && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(expr) // TODO: what does this match ? 
}
function isCommand(command: string): command is Command {

    return commands.includes(command as Command) //TODO: not sure why the as keyword is used here


}
export {
    Eva,
    isString,
    isNumber,
    type Expr,
    Environment
}

