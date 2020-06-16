import * as antlr4 from "antlr4"
import { ECMAScriptVisitor as DelvenVisitor } from "./parser/ECMAScriptVisitor"
import { ECMAScriptParser as DelvenParser, ECMAScriptParser } from "./parser/ECMAScriptParser"
import { ECMAScriptLexer as DelvenLexer } from "./parser/ECMAScriptLexer"
import { RuleContext } from "antlr4/RuleContext"
import { PrintVisitor } from "./PrintVisitor"
import ASTNode from "./ASTNode";
import { ExpressionStatement, Literal, Script, BlockStatement, Statement } from "./nodes";
import { Syntax } from "./syntax";
let fs = require("fs");

/**
 * Version that we generate the AST for. 
 * This allows for testing different implementations
 * 
 * Currently only ECMAScript is supported
 * 
 * https://github.com/estree/estree
 */
export enum ParserType { ECMAScript }
export type SourceType = "code" | "filename";
export type SourceCode = {
    type: SourceType,
    value: string
}
export interface Marker {
    index: number;
    line: number;
    column: number;
};

export default abstract class ASTParser {
    private visitor: (typeof DelvenVisitor | null)
    constructor(visitor?: DelvenASTVisitor) {
        this.visitor = visitor || new DelvenASTVisitor();
    }

    generate(source: SourceCode): ASTNode {
        let code;
        switch (source.type) {
            case "code":
                code = source.value;
                break;
            case "filename":
                code = fs.readFileSync(source.value, "utf8");
                break;
        }

        let chars = new antlr4.InputStream(code);
        let lexer = new DelvenLexer(chars);
        let tokens = new antlr4.CommonTokenStream(lexer);
        let parser = new DelvenParser(tokens);
        let tree = parser.program();
        // console.info(tree.toStringTree())
        tree.accept(new PrintVisitor());
        console.info("---------------------");
        let result = tree.accept(this.visitor);
        return result;
    }

    /**
     * Parse source and genereate AST tree
     * @param source 
     * @param type 
     */
    static parse(source: SourceCode, type?: ParserType): ASTNode {
        if (type == null)
            type = ParserType.ECMAScript;
        let parser;
        switch (type) {
            case ParserType.ECMAScript:
                parser = new ASTParserDefault();
                break;
            default:
                throw new Error("Unkown parser type");
        }
        return parser.generate(source)
    }
}

class ASTParserDefault extends ASTParser {

}
function type(o) {
    return o && o.constructor && o.constructor.name
}

export class DelvenASTVisitor extends DelvenVisitor {
    constructor() {
        super();
    }

    private asMarker(metadata: any) {
        return { index: 1, line: 1, column: 1 };
    }

    private decorate(node: any, marker: Marker): any {
        node.start = 0;
        node.end = 0;
        return node;
    }

    // Visit a parse tree produced by ECMAScriptParser#program.
    visitProgram(ctx: RuleContext) {
        console.info("visitProgram: " + ctx.getText());
        // Interval { start: 0, stop: 0 }
        let interval = ctx.getSourceInterval();
        console.info('interval : %s', JSON.stringify(interval))
        // visitProgram ->visitSourceElements -> visitSourceElement -> visitStatement
        let statements: any = [];
        if (ctx.getChildCount() > 1) { // exclude <EOF>
            if (ctx.getChild(0).getChildCount() > 0) {
                let node = ctx.getChild(0).getChild(0).getChild(0);
                let statement = this.visitStatement(node);
                statements.push(statement);
            }
        }
        let metadata = {
            start: {
                line: 1,
                column: interval.start,
                offset: 0
            },

            end: {
                line: 1,
                column: interval.stop,
                offset: 0
            }
        };

        let script = new Script(statements);
        return this.decorate(script, this.asMarker(metadata));
    };

    // Visit a parse tree produced by ECMAScriptParser#statement.
    visitStatement(ctx: RuleContext) {
        console.info("visitStatement [%s] : %s", ctx.getChildCount(), ctx.getText());
        if (ctx.getChildCount() != 1) {
            throw new Error("Wrong child count, expected 1 got : " + ctx.getChildCount());
        }

        let node: RuleContext = ctx.getChild(0);
        let type = node.ruleIndex;
        if (type == ECMAScriptParser.RULE_block) {
            return this.visitBlock(node);
        } else if (type == ECMAScriptParser.RULE_expressionStatement) {
            return this.visitExpressionStatement(node);
        }
        else {
            throw new Error("Unhandled type XX: " + type);
        }
    };

    // Visit a parse tree produced by ECMAScriptParser#block.
    visitBlock(ctx: RuleContext) {
        console.info("visitBlock: " + ctx.getText() + " == " + ctx);
        let body = [];
        for (let i = 0; i < ctx.getChildCount(); ++i) {
            let node: RuleContext = ctx.getChild(i);
            let type = node.ruleIndex;
            if (type == ECMAScriptParser.RULE_statementList) {
                let statementList = this.visitStatementList(node);
                for (let index in statementList) {
                    body.push(statementList[index]);
                }
            } else if (type == ECMAScriptParser.RULE_expressionStatement) {
                let expression = this.visitExpressionStatement(node);
                body.push(expression);
            }

            else if (type == undefined) {
                continue;
            }
            else {
                throw new Error("Unhandled type : " + type);
            }
        }

        // TODO : Implement me
        return new BlockStatement(body);
    };


    // Visit a parse tree produced by ECMAScriptParser#statementList.
    visitStatementList(ctx: RuleContext) {
        console.info("visitStatementList: " + ctx.getText());
        let body = [];
        for (let i = 0; i < ctx.getChildCount(); ++i) {
            let node: RuleContext = ctx.getChild(i);
            let type = node.ruleIndex;
            if (type == ECMAScriptParser.RULE_statement) {
                let statement: any = this.visitStatement(node);
                body.push(statement);
            } else if (type == undefined) {
                continue;
            }
            else {
                throw new Error("Unhandled type : " + type);
            }
        }
        return body;
    };

    // Visit a parse tree produced by ECMAScriptParser#variableStatement.
    visitVariableStatement(ctx: RuleContext) {
        console.info("visitVariableStatement: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#variableDeclarationList.
    visitVariableDeclarationList(ctx: RuleContext) {
        console.info("visitVariableDeclarationList: " + ctx.getText());

    };


    // Visit a parse tree produced by ECMAScriptParser#variableDeclaration.
    visitVariableDeclaration(ctx: RuleContext) {
        console.info("visitVariableDeclaration: " + ctx.getText());

    };


    // Visit a parse tree produced by ECMAScriptParser#initialiser.
    visitInitialiser(ctx: RuleContext) {
        console.info("visitInitialiser: " + ctx.getText());
    };


    // Visit a parse tree produced by ECMAScriptParser#emptyStatement.
    visitEmptyStatement(ctx: RuleContext) {
        console.info("visitEmptyStatementXX: " + ctx.getText());
    };


    // Visit a parse tree produced by ECMAScriptParser#expressionStatement.
    visitExpressionStatement(ctx: RuleContext) {
        console.info("visitExpressionStatement: " + ctx.getText());
        if (ctx.getChildCount() != 1) {
            throw new Error("Wrong child count, expected 1 got : " + ctx.getChildCount());
        }
        // visitExpressionStatement:>visitExpressionSequence:>visitLiteralExpression
        let node: RuleContext = ctx.getChild(0); // visitExpressionSequence 
        let expression = node.getChild(0);
        let expressionId = expression.ruleIndex;
        let literal;
        if (expressionId == ECMAScriptParser.RULE_singleExpression) {            
            literal = this.visitLiteralExpression(expression);            
        } else {
            throw new Error("Unhandled type : " + type);
        }

        let interval = expression.getSourceInterval();
        let statement = new ExpressionStatement(literal);
        const metadata = {
            start: {
                line: 1,
                column: interval.start,
                offset: 0
            },

            end: {
                line: 1,
                column: interval.stop,
                offset: 3
            }
        };

        return this.decorate(statement, this.asMarker(metadata));
    };


    // Visit a parse tree produced by ECMAScriptParser#ifStatement.
    visitIfStatement(ctx: RuleContext) {
        console.info("visitIfStatement: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#DoStatement.
    visitDoStatement(ctx: RuleContext) {
        console.info("visitDoStatement: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#WhileStatement.
    visitWhileStatement(ctx: RuleContext) {
        console.info("visitWhileStatement: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ForStatement.
    visitForStatement(ctx: RuleContext) {
        console.info("visitWhileStatement: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ForVarStatement.
    visitForVarStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ForInStatement.
    visitForInStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ForVarInStatement.
    visitForVarInStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#continueStatement.
    visitContinueStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#breakStatement.
    visitBreakStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#returnStatement.
    visitReturnStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#withStatement.
    visitWithStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#switchStatement.
    visitSwitchStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#caseBlock.
    visitCaseBlock(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#caseClauses.
    visitCaseClauses(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#caseClause.
    visitCaseClause(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#defaultClause.
    visitDefaultClause(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#labelledStatement.
    visitLabelledStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#throwStatement.
    visitThrowStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#tryStatement.
    visitTryStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#catchProduction.
    visitCatchProduction(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#finallyProduction.
    visitFinallyProduction(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#debuggerStatement.
    visitDebuggerStatement(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#functionDeclaration.
    visitFunctionDeclaration(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#formalParameterList.
    visitFormalParameterList(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#functionBody.
    visitFunctionBody(ctx: RuleContext) {
        console.info("visitFunctionBody: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#arrayLiteral.
    visitArrayLiteral(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#elementList.
    visitElementList(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#elision.
    visitElision(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#objectLiteral.
    visitObjectLiteral(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#propertyNameAndValueList.
    visitPropertyNameAndValueList(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PropertyExpressionAssignment.
    visitPropertyExpressionAssignment(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PropertyGetter.
    visitPropertyGetter(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PropertySetter.
    visitPropertySetter(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#propertyName.
    visitPropertyName(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#propertySetParameterList.
    visitPropertySetParameterList(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#arguments.
    visitArguments(ctx: RuleContext) {
        console.info("visitArguments: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#argumentList.
    visitArgumentList(ctx: RuleContext) {
        console.info("visitArgumentList: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#expressionSequence.
    visitExpressionSequence(ctx: RuleContext) {
        console.info("visitExpressionSequence: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#TernaryExpression.
    visitTernaryExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#LogicalAndExpression.
    visitLogicalAndExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PreIncrementExpression.
    visitPreIncrementExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ObjectLiteralExpression.
    visitObjectLiteralExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#InExpression.
    visitInExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#LogicalOrExpression.
    visitLogicalOrExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#NotExpression.
    visitNotExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PreDecreaseExpression.
    visitPreDecreaseExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ArgumentsExpression.
    visitArgumentsExpression(ctx: RuleContext) {
        console.info("visitArgumentsExpression: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ThisExpression.
    visitThisExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#FunctionExpression.
    visitFunctionExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#UnaryMinusExpression.
    visitUnaryMinusExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PostDecreaseExpression.
    visitPostDecreaseExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#AssignmentExpression.
    visitAssignmentExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#TypeofExpression.
    visitTypeofExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#InstanceofExpression.
    visitInstanceofExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#UnaryPlusExpression.
    visitUnaryPlusExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#DeleteExpression.
    visitDeleteExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#EqualityExpression.
    visitEqualityExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#BitXOrExpression.
    visitBitXOrExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#MultiplicativeExpression.
    visitMultiplicativeExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#BitShiftExpression.
    visitBitShiftExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#ParenthesizedExpression.
    visitParenthesizedExpression(ctx: RuleContext) {
        console.info("visitParenthesizedExpression: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#AdditiveExpression.
    visitAdditiveExpression(ctx: RuleContext) {
        console.info("visitAdditiveExpression: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#RelationalExpression.
    visitRelationalExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#PostIncrementExpression.
    visitPostIncrementExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#BitNotExpression.
    visitBitNotExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#NewExpression.
    visitNewExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#LiteralExpression.
    visitLiteralExpression(ctx: RuleContext) {
        console.info("visitLiteralExpression: " + ctx.getText());
        if (ctx.getChildCount() != 1) {
            throw new Error("Wrong child count, expected 1 got : " + ctx.getChildCount());
        }
        // visitLiteralExpression: > visitLiteral:  visitNumericLiteral:
        let node: RuleContext = ctx.getChild(0);
        let expression = node.getChild(0);
        let expressionId = expression.ruleIndex;
        if (expressionId == ECMAScriptParser.RULE_numericLiteral) {            
            return this.visitNumericLiteral(ctx);            
        } else {
            throw new Error("Unhandled type : " + type);
        }
    };


    // Visit a parse tree produced by ECMAScriptParser#ArrayLiteralExpression.
    visitArrayLiteralExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#MemberDotExpression.
    visitMemberDotExpression(ctx: RuleContext) {
        console.info("visitMemberDotExpression: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#MemberIndexExpression.
    visitMemberIndexExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#IdentifierExpression.
    visitIdentifierExpression(ctx: RuleContext) {
        console.info("visitIdentifierExpression: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#BitAndExpression.
    visitBitAndExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#BitOrExpression.
    visitBitOrExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#AssignmentOperatorExpression.
    visitAssignmentOperatorExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#VoidExpression.
    visitVoidExpression(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };

    // Visit a parse tree produced by ECMAScriptParser#assignmentOperator.
    visitAssignmentOperator(ctx: RuleContext) {
        console.info("visitAssignmentOperator: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#literal.
    visitLiteral(ctx: RuleContext) {
        console.info("visitLiteral: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#numericLiteral.
    visitNumericLiteral(ctx: RuleContext) {
        console.info("visitNumericLiteral: " + ctx.getText());
        let value = ctx.getText();
        let expression = new Literal("number", value);
        return expression;''
    };


    // Visit a parse tree produced by ECMAScriptParser#identifierName.
    visitIdentifierName(ctx: RuleContext) {
        console.info("visitIdentifierName: " + ctx.getText());
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#reservedWord.
    visitReservedWord(ctx: RuleContext) {
        console.info("visitReservedWord: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#keyword.
    visitKeyword(ctx: RuleContext) {
        console.info("visitKeyword: " + ctx.getText());

        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#futureReservedWord.
    visitFutureReservedWord(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#getter.
    visitGetter(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };


    // Visit a parse tree produced by ECMAScriptParser#setter.
    visitSetter(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };

    // Visit a parse tree produced by ECMAScriptParser#eos.
    visitEos(ctx: RuleContext) {
        //console.trace('not implemented')
        this.visitChildren(ctx);
    };

    // Visit a parse tree produced by ECMAScriptParser#eof.
    visitEof(ctx: RuleContext) {
        console.trace('not implemented')
        this.visitChildren(ctx);
    };

}