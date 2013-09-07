/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global MathJax, alert, event, accessor, helpers, Scanner*/

var MAX_PRIORITY = 20;

function Parser(input, templateDescriptions) {
    "use strict";
    this.scanner = new Scanner(input, templateDescriptions);

    this.isResultValid = function (result) {
        if (result === null) {
            return false;
        }
        if (result === undefined) {
            return false;
        }
        if (!(result instanceof Array)) {
            return false;
        }
        return result.length !== 0;
    };

    this.parseInnerPart = function () {
        var result, currentResult;
        result = [];
        switch (this.scanner.currentSymbol) {
        case helpers.SYM_LITERAL:
            result.push(this.scanner.currentSymbolString);
            this.scanner.readNextSymbol();
            break;
        case helpers.SYM_BEGIN_BLOCK:
            result.push(this.scanner.currentSymbolString);
            this.scanner.readNextSymbol();
            currentResult = this.parseExpression(0);
            if (!this.isResultValid(currentResult)) {
                return null;
            }
            result = result.concat(currentResult);
            while (this.scanner.currentSymbol === helpers.SYM_SEPARATOR) {
                this.scanner.readNextSymbol();
                currentResult = this.parseExpression(0);
                if (!this.isResultValid(currentResult)) {
                    return null;
                }
                result = result.concat(currentResult);
            }
            if (this.scanner.currentSymbol === helpers.SYM_END_BLOCK) {
                result.push(this.scanner.currentSymbolString);
                this.scanner.readNextSymbol();
            } else {
                helpers.log("Expected '}'.");
                return null;
            }
            break;
        default:
            helpers.log("Expected literal or '{'.");
            return null;
        }

        return result;
    };


    this.parseOuterPart = function () {
        var result, isFirstOuterPart, currentResult, currentName;
        result = [];
        isFirstOuterPart = true;
        currentName = "";
        while ((this.scanner.currentSymbol === helpers.SYM_PREFIX_OPERATOR) || (this.scanner.currentSymbol === helpers.SYM_LITERAL) || (this.scanner.currentSymbol === helpers.SYM_BEGIN_BLOCK)) {
            if (this.scanner.currentSymbol === helpers.SYM_PREFIX_OPERATOR) {
                currentName = this.scanner.currentSymbolString;
                this.scanner.readNextSymbol();
            }
            currentResult = this.parseInnerPart();
            if (!this.isResultValid(currentResult)) {
                return null;
            }
            if (helpers.hasContent(currentName)) {
                currentResult = this.scanner.expand(currentName, currentResult);
            }
            if (this.scanner.currentSymbol === helpers.SYM_POSTFIX_OPERATOR) {
                currentResult = this.scanner.expand(this.scanner.currentSymbolString, currentResult);
                this.scanner.readNextSymbol();
            }
            result = result.concat(currentResult);
            if (!isFirstOuterPart) {
                result = this.scanner.expand("*", result);
            }
            isFirstOuterPart = false;
            currentName = "";
        }
        return result;
    };

    this.parseExpression = function (currentPriority) {
        var result, currentResult, currentName;
        if (currentPriority < MAX_PRIORITY) {
            currentResult = this.parseExpression(currentPriority + 1);
        } else {
            currentResult = this.parseOuterPart();
        }
        if (!this.isResultValid(currentResult)) {
            return null;
        }
        result = currentResult;
        while ((this.scanner.currentSymbol === helpers.SYM_INFIX_OPERATOR) && (this.scanner.currentPriority === currentPriority)) {
            currentName = this.scanner.currentSymbolString;
            this.scanner.readNextSymbol();
            if (currentPriority < MAX_PRIORITY) {
                currentResult = this.parseExpression(currentPriority + 1);
            } else {
                currentResult = this.parseOuterPart();
            }
            if (!this.isResultValid(currentResult)) {
                return null;
            }
            result = result.concat(currentResult);
            result = this.scanner.expand(currentName, result);
        }
        return result;
    };

    this.parseInput = function () {
        this.scanner.tokenize();
        this.scanner.readNextSymbol();
        var result = this.parseExpression(0);
        if (!this.isResultValid(result)) {
            return null;
        }
        result = this.scanner.expand(helpers.NAME_BRACKETED_EXPRESSION, result);
        if (!this.isResultValid(result)) {
            return null;
        }
        return result[0];
    };
}

