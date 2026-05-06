import { Transformer } from "./transformer";
import { type Block, type CallFrame, type Command, commands, type ComparisonOperator, comparisonOperators, Environment, type Expr, type FunctionCall, type FunctionDefinition, type IfBlock, type LambdaFunction, type RuntimeValue, type SwitchBlock, type UserFunction, type varDeclaration, type whileBlock } from "./types";


class Eva {
    global: Environment
    call_stack: Array<CallFrame>
    transformer: Transformer
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
        this.transformer = new Transformer()
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
            return this.evalLambda(expr as LambdaFunction, env)
        }

        if (isFunctionDefinition(expr)) {
            return this.evalFunctionDefinition(expr as FunctionDefinition, env)
        }

        if (isFunction(expr)) {
            return this.evalFunctionCall(expr as FunctionCall, env)
        }

        // Parenthesized atoms parse as single-element arrays, e.g. (200) -> [200]
        // Must run after function calls so (foo) -> ["foo"] is a zero-arity call, not lookup.
        if (Array.isArray(expr) && expr.length === 1) { // something to do with the parser
            return this.eval(expr[0] as Expr, env)
        }

        // -----------------------------------------------------------------
        // Blocks - a sequence of expressions

        if (isBlock(expr)) {
            return this.evalBeginBlock(expr, env)
        }

        if (isCommandExpr(expr)) {
            return this.evalVarOrSet(expr, env)
        }

        if (isComparisonExpr(expr)) {
            return this.evalComparison(expr, env)
        }

        if (isSwitchStatement(expr)) {
            return this.evalSwitch(expr as SwitchBlock, env)
        }

        if (isIfBlock(expr)) {
            return this.evalIf(expr as IfBlock, env)
        }

        if (isWhileBlock(expr)) {
            return this.evalWhile(expr, env)
        }

        return this.throwUnevaluatable(expr)
    }

    private evalLambda(expr: LambdaFunction, env: Environment): UserFunction {
        const [_tag, params, body] = expr

        // an example of where to define runtime semantics, such as capturing the environment (closures, php vs JS function runtime semantics)

        const fn = {
            params, body, env // lexical closure
        }

        return fn as UserFunction

    }

    private evalFunctionDefinition(expr: FunctionDefinition, env: Environment): any {
        const [_tag, func_name, params, body] = expr

        // an example of where to define runtime semantics, such as capturing the environment (closures, php vs JS function runtime semantics)
        // JIT transpile to a var declaration
        const fn: UserFunction = {
            params, body, env // lexical closure
        }

        const varExpr: varDeclaration = ["var", func_name, ["lambda", params, body]] // TODO: fix type error (params)

        return this.eval(varExpr, env)
    }

    private evalFunctionCall(expr: FunctionCall, env: Environment): any {
        const [func_name, ...args] = expr

        const frame = {
            cursor: {},
            env
        }
        // TODO: create an execution stack, including the environment, cursor (not implemented yet)
        this.call_stack.push(frame)

        // console.debug(`pushed frame:`, frame)
        // evaluate the arguments, based on the environment
        const evaluated_args = [...args].map((arg) => this.eval(arg, env)) //TODO: change the 
        const callee = env.lookup(func_name)

        if (typeof callee === "function") { //TODO: change to a more reable form, not sure where the function type comes from here
            const call_result = callee(...evaluated_args)
            // console.debug(`popped call:`, this.call_stack.pop())
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

    private evalBeginBlock(expr: Block, env: Environment): any {
        // should initialize a block scope environment
        const block_env = new Environment(env, new Map())
        return this.evalBlock(expr, block_env)
    }

    private evalVarOrSet(expr: [Command, string, Expr], env: Environment): any {
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

    private evalComparison(expr: [ComparisonOperator, Expr, Expr], env: Environment): any {
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

    private evalSwitch(expr: SwitchBlock, env: Environment): any {
        // const [_tag, [condition, block], else_branch ] = expr
        const if_expr = this.transformer.transformWhileToIfBlock(expr) // ["switch", [Condition, Expr], Expr]
        // #region agent log
        fetch('http://127.0.0.1:7741/ingest/8985d195-1e99-4005-a528-9dc8e4a0e3cd', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '47d1dd' }, body: JSON.stringify({ sessionId: '47d1dd', runId: 'pre-fix', hypothesisId: 'H2', location: 'eva.ts:isSwitchStatement', message: 'switch AST and transformed if', data: { switchExpr: expr, if_expr }, timestamp: Date.now() }) }).catch(() => { });
        // #endregion
        return this.eval(if_expr, env)
    }

    private evalIf(expr: IfBlock, env: Environment): any {
        const [_, condition, if_branch, else_branch] = expr
        // #region agent log
        fetch('http://127.0.0.1:7741/ingest/8985d195-1e99-4005-a528-9dc8e4a0e3cd', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '47d1dd' }, body: JSON.stringify({ sessionId: '47d1dd', runId: 'pre-fix', hypothesisId: 'H5', location: 'eva.ts:isIfBlock', message: 'if branches', data: { condition, if_branch, else_branch, elseIsArray: Array.isArray(else_branch), elseLen: Array.isArray(else_branch) ? else_branch.length : undefined }, timestamp: Date.now() }) }).catch(() => { });
        // #endregion

        const cond = this.eval(condition, env) // TODO: replace literal with type
        if (cond === true) {
            return this.eval(if_branch, env)
        }
        if (cond === false) {
            return this.eval(else_branch, env)
        }
        throw new Error(`if condition didn't evaluate to a boolean. ${JSON.stringify(condition)}`)
    }

    private evalWhile(expr: whileBlock, env: Environment): any {
        const [_tag, condition, _do] = expr
        let result
        while (this.eval(condition, env)) {
            result = this.eval(_do, env)
        }
        return result
    }

    private throwUnevaluatable(expr: Expr): never {
        // #region agent log
        fetch('http://127.0.0.1:7741/ingest/8985d195-1e99-4005-a528-9dc8e4a0e3cd', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '47d1dd' }, body: JSON.stringify({ sessionId: '47d1dd', runId: 'pre-fix', hypothesisId: 'H1', location: 'eva.ts:eval:fallthrough', message: 'eval fallthrough — unhandled expr', data: { typeofExpr: typeof expr, isArray: Array.isArray(expr), arrayLen: Array.isArray(expr) ? expr.length : undefined, firstType: Array.isArray(expr) && expr.length ? typeof expr[0] : undefined, stringified: JSON.stringify(expr) }, timestamp: Date.now() }) }).catch(() => { });
        // #endregion
        throw new Error(`Expr: ${expr} could not be evaluated`)
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
    return Array.isArray(expr)
        && expr[0] === "lambda"
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

// Tags that look like (tag ...) calls but are special forms, not calls.
// Keeps `commands` as the single source for var/set; comparison ops handled via isComparisonOperator.
const NOT_FUNCTION_CALL_TAGS = new Set<string>([
    "begin",
    "if",
    "while",
    "switch",
    "function",
    ...commands,
])

function isFunction(expr: Expr): boolean {
    if (!isArrayExpr(expr) || typeof expr[0] !== "string") {
        return false
    }
    const tag = expr[0]
    if (NOT_FUNCTION_CALL_TAGS.has(tag)) {
        return false
    }
    if (isComparisonOperator(tag)) {
        return false
    }
    return true
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

function isSwitchStatement(expr: Expr): expr is SwitchBlock { //TODO: fix type guard
    return isArrayExpr(expr) && expr[0] === "switch"
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

