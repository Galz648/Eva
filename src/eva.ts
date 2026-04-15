
type Expr = number | string | (Expr)[]
class Eva {
    eval(expr: Expr) {

        if (isNumber(expr)) {
            return expr
        }

        if (isString(expr)) {
            return expr.slice(1, -1)
        }

        if (expr[0] === "+") {
            return this.eval(expr[1]) + this.eval(expr[2]) // TODO: add runtime checks

        }

        else {
            throw Error(`Expr: ${expr} could not be evaluated`)
        }
    }
}


function isString(expr: Expr): expr is string {

    if (!(typeof expr === "string")) {
        return false
    }

    if (expr[0] == "'" && expr.slice(-1) === "'") {
        return true
    }
    else {
        console.warn("not sure what should happen in this else branch")
        return false
    }
}
// type guard number

function isNumber(expr: Expr): expr is number {

    if (typeof expr === "number") {
        return true
    }

    return false

}
export {
    Eva,
    isString,
    isNumber,
    type Expr
}

