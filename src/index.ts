import * as antlr4  from "antlr4"
import {ECMAScriptVisitor as DelvenVisitor} from "./parser/ECMAScriptVisitor"
import {ECMAScriptParser as  DelvenParser} from "./parser/ECMAScriptParser"
import {ECMAScriptLexer as DelvenLexer} from "./parser/ECMAScriptLexer"
import { RuleContext } from "antlr4/RuleContext"
import { PrintVisitor } from "./PrintVisitor"
let fs = require('fs');

// Grammar 
// https://github.com/antlr/grammars-v4/tree/master/javascript/javascript
// https://stackoverflow.com/questions/1786565/ebnf-for-ecmascript

console.info('Transpiller');
let input1 = "( 1 + 2 )" 
let input2 = "var x = function(y, z) { console.info('this is a string') ; }" 
let input3 = "var x =  2 + 4" 

let chars = new antlr4.InputStream(input2);
let lexer = new DelvenLexer(chars);
let tokens  = new antlr4.CommonTokenStream(lexer);
let parser = new DelvenParser(tokens);
parser.buildParseTrees = true;
let tree = parser.program();
// console.info(tree.toStringTree())
tree.accept(new PrintVisitor());

// Trick to prevent  
// All files must be modules when the '--isolatedModules' flag is provided.ts(1208)
export {} 