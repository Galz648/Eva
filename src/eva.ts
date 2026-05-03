type Cursor = {} // TODO: track the current word within the input string (have to deal with the generated parser)

interface CallFrame {
    env: Environment,
    cursor: Cursor
}
type UserFunction = {
    params: string[],
    body: Expr,
    env: Environment
}
type RuntimeValue = number | string | boolean | Function | UserFunction
type Scope = Map<string, RuntimeValue>
const commands = ["set", "var"] as const
type Command = typeof commands[number]
type FunctionDefinition = ["def", string, string[], Expr] // definition keyword, function name, args, body
const comparisonOperators = [">", "<", "==", "!==", "=>", "<="] as const // TODO: move these to the global scope as functions
type ComparisonOperator = typeof comparisonOperators[number]
type Block = ['begin', ...Expr[]]
type IfBlock = ['if', Expr, Expr, Expr]
type whileBlock = ["while", Expr, Block] // while, condition, code
type LambdaFunction = ["lambda", Expr[], Expr]
type varDeclaration = ["var", string, Expr]
type varAssignment = ["set", string, Expr]
type Expr = number | string | [ComparisonOperator, Expr, Expr] | varAssignment | varDeclaration | Block | IfBlock | whileBlock | FunctionCall | FunctionDefinition | LambdaFunction
// function types
const builtins = ["null", "true", "false", ...comparisonOperators, ...commands] as const
type Builtin = typeof builtins[number]
type FunctionCall = [Builtin | string, ...Expr[]]


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

    lookup(variable_name: string): RuntimeValue {
        const scope = this.resolveScopeByVariableName(variable_name)
        const value = scope.get(variable_name)
        if (value !== undefined) {
            return value
        }
        else {
            throw new Error(`Could not resolve lookup for variable ${variable_name}`)
        }
    }

    define(variable_name: string, value: RuntimeValue) {
        // TODO: determine if this should throw an error if the variable already exists.
        this.record.set(variable_name, value)
        return value
    }

    assign(variable_name: string, value: RuntimeValue) {
        const scope = this.resolveScopeByVariableName(variable_name)
        // set the variable inside the found scope
        scope.set(variable_name, value)
    }
}

class Eva {
    global: Environment
    call_stack: Array<CallFrame>
    constructor(global: Environment = new Environment(null, new Map(
        [
            ["+", (op1: number, op2: number) => op1 + op2],
            ["*", (op1: number, op2: number) => op1 * op2],
            ["-", (op1: number, op2: number) => {
                if (op2 === null) {
                    return -op1
                }
                return op1 - op2
            }],
            ["/", (op1: number, op2: number) => op1 / op2],
            ["==", (op1: number, op2: number): boolean => op1 === op2]

        ]
    ))) {
        this.global = global
        this.call_stack = []
    }

    evalBlock(block: Block, block_env: Environment) {


        let lastest_expression_evaluated // TODO: type this or something
        const expressions: Expr[] = block.slice(1) as Expr[]
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

        if (isLambdaFunction(expr)) {
            const [_tag, params, body] = expr as LambdaFunction

            // an example of where to define runtime semantics, such as capturing the environment (closures, php vs JS function runtime semantics)

            const fn = {
                params, body, env // lexical closure
            }

            return fn

        }

        if (isFunctionDefinition(expr)) {
            const [_tag, func_name, params, body] = expr as FunctionDefinition

            // an example of where to define runtime semantics, such as capturing the environment (closures, php vs JS function runtime semantics)
            // JIT transpile to a var declaration
            const fn: UserFunction = {
                params, body, env // lexical closure
            }

            const varExpr: varDeclaration = ["var", func_name, ["lambda", params, body]] // TODO: fix type error (params)

            return this.eval(varExpr, env)
        }

        // handle function call
        if (isFunction(expr)) {
            const [func_name, ...args] = expr as FunctionCall

            const frame = {
                cursor: {},
                env
            }
            // TODO: create an execution stack, including the environment, cursor (not implemented yet)
            this.call_stack.push(frame)

            console.debug(`pushed frame:`, frame)
            // evaluate the arguments, based on the environment
            const evaluated_args = [...args].map((arg) => this.eval(arg, env)) //TODO: change the 
            const callee = env.lookup(func_name)

            if (typeof callee === "function") { //TODO: change to a more reable form, not sure where the function type comes from here
                const call_result = callee(...evaluated_args)
                console.debug(`popped call:`, this.call_stack.pop())
                return call_result
            }

            // TODO: make more readable
            if (isUserDefinedFunction(callee)) {
                if (callee.params.length !== evaluated_args.length) {
                    throw new Error(`Function ${func_name} expected ${callee.params.length} args, received ${evaluated_args.length}`)
                }
                const activationRecord = new Map<string, RuntimeValue>()
                callee.params.forEach((param, i) => {
                    activationRecord.set(param, evaluated_args[i] as RuntimeValue)
                })
                const activationEnv = new Environment(callee.env, activationRecord)
                return this.eval(callee.body, activationEnv)
            }

            throw new Error(`Attempted to call non-function value: ${JSON.stringify(callee)}`)

        }
        // -----------------------------------------------------------------
        // Blocks - a sequence of expressions

        if (isBlock(expr)) {
            // should initialize a block scope environment
            const block_env = new Environment(env, new Map())
            return this.evalBlock(expr, block_env)
        }

        // Commands
        if (isCommandExpr(expr)) {
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

        if (isComparisonExpr(expr)) {
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
        if (isIfBlock(expr)) {
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

        if (isWhileBlock(expr)) {
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

function isLambdaFunction(expr: Expr): expr is LambdaFunction {
    return expr[0] === "lambda" && Array.isArray(expr)
}

// type guard number
function isNumber(expr: Expr): expr is number {
    return typeof expr == "number"
}

function isComparisonOperator(operator: string): operator is ComparisonOperator {
    return typeof operator === "string" && comparisonOperators.includes(operator as ComparisonOperator)
}
function isVariableName(expr: Expr): expr is string {
    return typeof expr === "string" && /^[+-/*a-zA-Z][a-zA-Z0-9_]*$/.test(expr) // TODO: what does this match ? 
}
function isCommand(command: string): command is Command {

    return commands.includes(command as Command) //TODO: not sure why the as keyword is used here
}

function isArrayExpr(expr: Expr): expr is Exclude<Expr, number | string> {
    return Array.isArray(expr)
}

function isFunction(expr: Expr): boolean {
    if (!isArrayExpr(expr) || typeof expr[0] !== "string") {
        return false
    }

    const tag = expr[0]
    return !isCommand(tag) && tag !== "begin" && tag !== "if" && tag !== "while" && tag !== "function" && !isComparisonOperator(tag) // terrible code, makes the check tightly bound to the definitions
}

function isBlock(expr: Expr): expr is Block {
    return isArrayExpr(expr) && expr[0] === "begin"
}

function isComparisonExpr(expr: Expr): expr is [ComparisonOperator, Expr, Expr] {
    return isArrayExpr(expr) && typeof expr[0] === "string" && isComparisonOperator(expr[0])
}

function isIfBlock(expr: Expr): expr is IfBlock {
    return isArrayExpr(expr) && expr[0] === "if"
}

function isWhileBlock(expr: Expr): expr is whileBlock {
    return isArrayExpr(expr) && expr[0] === "while"
}

function isCommandExpr(expr: Expr): expr is [Command, string, Expr] {
    return isArrayExpr(expr) && typeof expr[0] === "string" && isCommand(expr[0])
}


function isFunctionDefinition(expr: Expr): expr is FunctionDefinition {
    return isArrayExpr(expr) && (expr[0]) === "def"
}

function isUserDefinedFunction(value: RuntimeValue): value is UserFunction {
    return typeof value === "object" &&
        value !== null &&
        "params" in value &&
        "body" in value &&
        "env" in value
}

export {
    Eva,
    isString,
    isNumber,
    type Expr,
    Environment
}

