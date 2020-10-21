export var ECMAScriptLexer: typeof ECMAScriptLexer;
declare function ECMAScriptLexer(input: any): any;
declare class ECMAScriptLexer {
    constructor(input: any);
    _interp: any;
    constructor: typeof ECMAScriptLexer;
    get atn(): any;
    channelNames: string[];
    modeNames: string[];
    literalNames: (string | null)[];
    symbolicNames: (string | null)[];
    ruleNames: string[];
    grammarFileName: string;
    action(localctx: any, ruleIndex: any, actionIndex: any): void;
    OpenBrace_action(localctx: any, actionIndex: any): void;
    CloseBrace_action(localctx: any, actionIndex: any): void;
    StringLiteral_action(localctx: any, actionIndex: any): void;
    sempred(localctx: any, ruleIndex: any, predIndex: any): any;
    HashBangLine_sempred(localctx: any, predIndex: any): any;
    RegularExpressionLiteral_sempred(localctx: any, predIndex: any): any;
    OctalIntegerLiteral_sempred(localctx: any, predIndex: any): boolean;
    Implements_sempred(localctx: any, predIndex: any): any;
    StrictLet_sempred(localctx: any, predIndex: any): any;
    NonStrictLet_sempred(localctx: any, predIndex: any): boolean;
    Private_sempred(localctx: any, predIndex: any): any;
    Public_sempred(localctx: any, predIndex: any): any;
    Interface_sempred(localctx: any, predIndex: any): any;
    Package_sempred(localctx: any, predIndex: any): any;
    Protected_sempred(localctx: any, predIndex: any): any;
}
declare namespace ECMAScriptLexer {
    export const EOF: number;
    export const HashBangLine: number;
    export const MultiLineComment: number;
    export const SingleLineComment: number;
    export const RegularExpressionLiteral: number;
    export const OpenBracket: number;
    export const CloseBracket: number;
    export const OpenParen: number;
    export const CloseParen: number;
    export const OpenBrace: number;
    export const CloseBrace: number;
    export const SemiColon: number;
    export const Comma: number;
    export const Assign: number;
    export const QuestionMark: number;
    export const Colon: number;
    export const Ellipsis: number;
    export const Dot: number;
    export const PlusPlus: number;
    export const MinusMinus: number;
    export const Plus: number;
    export const Minus: number;
    export const BitNot: number;
    export const Not: number;
    export const Multiply: number;
    export const Divide: number;
    export const Modulus: number;
    export const Power: number;
    export const NullCoalesce: number;
    export const Hashtag: number;
    export const RightShiftArithmetic: number;
    export const LeftShiftArithmetic: number;
    export const RightShiftLogical: number;
    export const LessThan: number;
    export const MoreThan: number;
    export const LessThanEquals: number;
    export const GreaterThanEquals: number;
    export const Equals_: number;
    export const NotEquals: number;
    export const IdentityEquals: number;
    export const IdentityNotEquals: number;
    export const BitAnd: number;
    export const BitXOr: number;
    export const BitOr: number;
    export const And: number;
    export const Or: number;
    export const MultiplyAssign: number;
    export const DivideAssign: number;
    export const ModulusAssign: number;
    export const PlusAssign: number;
    export const MinusAssign: number;
    export const LeftShiftArithmeticAssign: number;
    export const RightShiftArithmeticAssign: number;
    export const RightShiftLogicalAssign: number;
    export const BitAndAssign: number;
    export const BitXorAssign: number;
    export const BitOrAssign: number;
    export const PowerAssign: number;
    export const ARROW: number;
    export const NullLiteral: number;
    export const BooleanLiteral: number;
    export const DecimalLiteral: number;
    export const HexIntegerLiteral: number;
    export const OctalIntegerLiteral: number;
    export const OctalIntegerLiteral2: number;
    export const BinaryIntegerLiteral: number;
    export const BigHexIntegerLiteral: number;
    export const BigOctalIntegerLiteral: number;
    export const BigBinaryIntegerLiteral: number;
    export const BigDecimalIntegerLiteral: number;
    export const Break: number;
    export const Do: number;
    export const Instanceof: number;
    export const Typeof: number;
    export const Case: number;
    export const Else: number;
    export const New: number;
    export const Var: number;
    export const Catch: number;
    export const Finally: number;
    export const Return: number;
    export const Void: number;
    export const Continue: number;
    export const For: number;
    export const Switch: number;
    export const While: number;
    export const Debugger: number;
    export const Function: number;
    export const This: number;
    export const With: number;
    export const Default: number;
    export const If: number;
    export const Throw: number;
    export const Delete: number;
    export const In: number;
    export const Try: number;
    export const As: number;
    export const From: number;
    export const Let: number;
    export const Class: number;
    export const Enum: number;
    export const Extends: number;
    export const Super: number;
    export const Const: number;
    export const Export: number;
    export const Import: number;
    export const Async: number;
    export const Await: number;
    export const Url: number;
    export const Select: number;
    export const Union: number;
    export const Where: number;
    export const Join: number;
    export const On: number;
    export const Produce: number;
    export const Using: number;
    export const All: number;
    export const Within: number;
    export const Implements: number;
    export const StrictLet: number;
    export const NonStrictLet: number;
    export const Private: number;
    export const Public: number;
    export const Interface: number;
    export const Package: number;
    export const Protected: number;
    export const Static: number;
    export const Yield: number;
    export const Identifier: number;
    export const StringLiteral: number;
    export const TemplateStringLiteral: number;
    export const WhiteSpaces: number;
    export const LineTerminator: number;
    export const NEWLINE: number;
    export const HtmlComment: number;
    export const CDataComment: number;
    export const UnexpectedCharacter: number;
    export const ERROR: number;
}
export {};