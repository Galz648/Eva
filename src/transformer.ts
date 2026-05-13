import type { Condition, Expr, IfBlock, SwitchBlock} from "./types";

export class Transformer {

    transformWhileToIfBlock(block: SwitchBlock): IfBlock {
        const [_tag, branches, alternate] = block
        // call recursive function -> get if statement
        return foo(branches) 
    }
}

function foo(branches: [Condition, Expr][]): IfBlock {
    // handle base base(s)
    if (branches.length === 1) {
        console.log(`branches: ${branches}`)
            const [condition, expr] = branches.pop()!
            return ["if", condition, expr]
    }

    // break into subproblem - slice the next branch
    let [current, ...rest] = branches
    let [current_condition, current_expr] = current!
    // call foo with subproblem 
    const sub_problem = foo(rest)
    // what to do with the subproblem? 
    return ["if", current_condition, current_expr, sub_problem]
}
