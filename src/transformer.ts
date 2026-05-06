import type { IfBlock, SwitchBlock, whileBlock } from "./types";

export class Transformer {

    transformWhileToIfBlock(block: SwitchBlock): IfBlock {
        const [_tag, condition, condition_body, alternate] = block
        const ifExpr: IfBlock = ["if", condition, condition_body, alternate]
        // #region agent log
        fetch('http://127.0.0.1:7741/ingest/8985d195-1e99-4005-a528-9dc8e4a0e3cd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'47d1dd'},body:JSON.stringify({sessionId:'47d1dd',runId:'pre-fix',hypothesisId:'H2',location:'transformer.ts:transformWhileToIfBlock',message:'switch→if transform',data:{blockLen:block.length,condition,condition_body,alternate,ifExpr},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return ifExpr
    }
}
