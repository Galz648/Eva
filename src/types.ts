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

type ElseBranch = [Expr]
type IfBranch = [Condition, Expr]
// type Branch = IfBranch | ElseBranch
type Condition = [ComparisonOperator, Expr, Expr]
type ComparisonExpr = [ComparisonOperator, Expr, Expr]
type SwitchBlock = ["switch", [Condition, Expr][], Expr?] // switch [<condition_1> <block_1>, ... , <condition_N> <block_N>] TODO: dtermine if these should be Expressions or Blocks
type RuntimeValue = number | string | boolean | Function | UserFunction
type Scope = Map<string, RuntimeValue>
const commands = ["set", "var"] as const
type Command = typeof commands[number]
type FunctionDefinition = ["def", string, string[], Expr] // definition keyword, function name, args, body
const comparisonOperators = [">", "<", "==", "!==", "=>", "<="] as const // TODO: move these to the global scope as functions
type ComparisonOperator = typeof comparisonOperators[number]
type Block = ['begin', ...Expr[]]
type IfBlock = ['if', Condition, Expr, Expr?] // if, condition, body, alternate
type whileBlock = ["while", Expr, Block] // while, condition, code
type LambdaFunction = ["lambda", Expr[], Expr]
type varDeclaration = ["var", string, Expr]
type varAssignment = ["set", string, Expr]
type Expr = number | string | Condition | varAssignment | varDeclaration | Block | IfBlock | whileBlock | FunctionCall | FunctionDefinition | LambdaFunction | SwitchBlock | ComparisonExpr
// function types
const builtins = ["null", "true", "false", ...comparisonOperators, ...commands] as const
type Builtin = typeof builtins[number]
type FunctionCall = [Builtin | string, ...Expr[]]


export type {
    Cursor,
    CallFrame,
    UserFunction,
    Condition,
    SwitchBlock,
    RuntimeValue,
    Scope,
    Command,
    FunctionDefinition,
    ComparisonOperator,
    Block,
    IfBlock,
    whileBlock,
    LambdaFunction,
    varDeclaration,
    varAssignment,
    Expr,
    Builtin,
    FunctionCall,
}
export {
    Environment,
    comparisonOperators,
    commands
}

