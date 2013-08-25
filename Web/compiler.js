/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global alert, event, MathJax, accessor, touchScroll, helpers, Scanner, Parser*/

/**
 * Encapsulates the compiler functionality.
 * @constructor
 */
function Compiler() {
    "use strict";
    /**
     * Converts the input into the output (e.g. an expression in ASCII into an expression in LaTeX/MathJax), and returns the output.
     * @param input The input to be converted.
     * @param templateDescriptions The templates to be used for conversion.
     * @returns {*} The output. If the input could not converted, then "null" is returned.
     */
    this.convert = function (input, templateDescriptions) {
        var parser = new Parser(input, templateDescriptions);
        return parser.parseInput();
    };
}
