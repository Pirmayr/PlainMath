/**
 * Created with JetBrains WebStorm.
 * User: PIC
 * Date: 6/27/13
 * Time: 9:47 PM
 * To change this template use File | Settings | File Templates.
 */

/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global alert, event, MathJax, accessor, touchScroll, helpers, Scanner, Parser, Compiler, TextInput, UIHandler*/

var easyMath = {
    uiHandler: null,

    keyboardLayout: [
        "(){}[]<>,.",
        "+-*" + helpers.CHR_MULTIPLICATION + "/^_=\\!",
        "0123456789",
        "qwertzuiop",
        "asdfghjkl" + helpers.CHR_DELETE,
        helpers.CHR_SPACE + "yxcvbnm" + helpers.CHR_ARROW_LEFT + helpers.CHR_ARROW_RIGHT
    ],

    templateDescriptions: [
        {name: helpers.NAME_BRACKETED_EXPRESSION, opType: helpers.SYM_BEGIN_BLOCK, template: "{#l0#0#r0}", inDocumentation: false},
        {name: "\\", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\#0", inDocumentation: false},
        {name: "{", opType: helpers.SYM_BEGIN_BLOCK, template: "{", inDocumentation: false},
        {name: "}", opType: helpers.SYM_END_BLOCK, template: "}", inDocumentation: false},
        {name: "(", opType: helpers.SYM_BEGIN_BLOCK, template: "\\left({", inDocumentation: false},
        {name: ")", opType: helpers.SYM_END_BLOCK, template: "}\\right)", inDocumentation: false},
        {name: "[", opType: helpers.SYM_BEGIN_BLOCK, template: "\\left[{", inDocumentation: false},
        {name: "]", opType: helpers.SYM_END_BLOCK, template: "}\\right]", inDocumentation: false},
        {name: ",", opType: helpers.SYM_SEPARATOR, template: "", inDocumentation: false},
        {name: "=", opType: helpers.SYM_INFIX_OPERATOR, priority: 0, template: "{#l0#0#r0}={#l1#1#r1}"},
        {name: "+-", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\pm{#0}"},
        {name: "+", opType: helpers.SYM_INFIX_OPERATOR, priority: 1, template: "{#l0#0#r0}+{#l1#1#r1}"},
        {name: "-", opType: helpers.SYM_INFIX_OPERATOR, priority: 2, template: "{#l0#0#r0}-{#l1#1#r1}"},
        {name: "*", opType: helpers.SYM_INFIX_OPERATOR, priority: 3, template: "{#l0#0#r0}{#l1#1#r1}"},
        {name: "\u00D7", opType: helpers.SYM_INFIX_OPERATOR, priority: 4, template: "{#l0#0#r0}\\times{#l1#1#r1}"},
        {name: "/", opType: helpers.SYM_INFIX_OPERATOR, priority: 5, template: "{#l0#0#r0}\\over{#l1#1#r1}"},
        {name: "mod", opType: helpers.SYM_INFIX_OPERATOR, priority: 5, template: "{#l0#0#r0}\\bmod{#l1#1#r1}"},
        {name: "^", opType: helpers.SYM_INFIX_OPERATOR, priority: 6, template: "{#l0#0#r0}^{#l1#1#r1}"},
        {name: "**", opType: helpers.SYM_INFIX_OPERATOR, priority: 7, template: "{#l0#0#r0}^{#l1#1#r1}"},
        {name: "!", opType: helpers.SYM_POSTFIX_OPERATOR, template: "{#l0#0#r0}!"},
        {name: "_", opType: helpers.SYM_INFIX_OPERATOR, priority: 8, template: "{#l0#0#r0}_{#l1#1#r1}"},
        {name: "sqrt", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\sqrt{#l0#0#r0}"},
        {name: "log", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\log{#l0#0#r0}"},
        {name: "ln", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\ln{#l0#0#r0}"},
        {name: "sin", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\sin{#l0#0#r0}"},
        {name: "sinh", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\sinh{#l0#0#r0}"},
        {name: "cos", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\cos{#l0#0#r0}"},
        {name: "cosh", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\cosh{#l0#0#r0}"},
        {name: "pow", opType: helpers.SYM_PREFIX_OPERATOR, template: "{#l0#0#r0}^{#l1#1#r1}"},
        {name: "int", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\int_{#1}^{#2}{#l0#0#r0}"},
        {name: "equiv", opType: helpers.SYM_PREFIX_OPERATOR, template: "{#0}\\overset{#2}={#1}"},
        {name: "sum", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\sum_{#1}^{#2}{#l0#0#r2}"},
        {name: "prod", opType: helpers.SYM_PREFIX_OPERATOR, template: "\\prod_{#1}^{#2}{#l0#0#r2}"},
        {name: "cases2", opType: helpers.SYM_PREFIX_OPERATOR, template: "{#0}=\\left\\{\\begin{array}{1}{#1}\\\\{#2}\\end{array}\\right."},
        {name: "overbrace", opType: helpers.SYM_INFIX_OPERATOR, priority: 9, template: "\\overbrace{#0}^{#1}"},
        {name: "underbrace", opType: helpers.SYM_INFIX_OPERATOR, priority: 10, template: "\\underbrace{#0}_{#1}"}
    ],

    initialize: function () {
        "use strict";
        this.uiHandler = new UIHandler("idInput", "output1", "output2", helpers.STORAGE_KEY_EXPRESSIONS, helpers.STORAGE_KEY_EXPRESSION, this.keyboardLayout, this.templateDescriptions);
        this.uiHandler.initialize();
    },

    printBegin: function () {
        "use strict";
        this.uiHandler.printBegin();
    },

    printEnd: function () {
        "use strict";
        this.uiHandler.printEnd();
    }
};
