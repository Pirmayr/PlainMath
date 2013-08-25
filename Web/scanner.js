/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global MathJax, alert, event, accessor, helpers*/

/**
 * Constructor of the class "Scanner".
 * @param input The text to be scanned.
 * @param templateDescriptions Array of template-descriptions used to expand expression-parts.
 * @constructor
 */
function Scanner(input, templateDescriptions) {
    "use strict";
    this.input = input;
    this.templateDescriptions = templateDescriptions;
    this.currentSymbol = helpers.SYM_NONE;
    this.currentPriority = 0;
    this.currentSymbolString = "";
    this.tokens = [];
    this.currentTokensIndex = 0;

    this.expand = function (name, parts) {
        var templateDescription, expansion, currentPlaceholderIndex, i, currentVariable, currentPart, currentDescription, j;
        templateDescription = this.getTemplateDescription(name);
        if (templateDescription === null) {
            return null;
        }
        expansion = templateDescription.template;
        currentPlaceholderIndex = 0;
        for (i = 0; i < parts.length; i += 1) {
            currentPart = parts[i];
            currentDescription = this.getTemplateDescription(currentPart);
            if ((currentDescription !== null) && ((currentDescription.opType === helpers.SYM_BEGIN_BLOCK) || (currentDescription.opType === helpers.SYM_END_BLOCK))) {
                if (currentDescription.opType === helpers.SYM_BEGIN_BLOCK) {
                    currentVariable = new RegExp("#l[INDEX]".replace("[INDEX]", currentPlaceholderIndex.toString()), "g");
                } else {
                    currentVariable = new RegExp("#r[INDEX]".replace("[INDEX]", (currentPlaceholderIndex - 1).toString()), "g");
                }
                expansion = expansion.replace(currentVariable, currentDescription.template);
            } else {
                currentVariable = "#" + currentPlaceholderIndex;
                currentPlaceholderIndex += 1;
                expansion = expansion.replace(currentVariable, currentPart);
            }

        }
        for (j = 0; j < parts.length; j += 1) {
            expansion = expansion.replace(new RegExp("#l[INDEX]".replace("[INDEX]", j.toString()), "g"), "");
            expansion = expansion.replace(new RegExp("#r[INDEX]".replace("[INDEX]", j.toString()), "g"), "");
        }
        return [ expansion ];
    };

    this.getLongestPredefinedSymbolAt = function (index) {
        var result, bestLength, i, currentDescription, currentName, currentLength, currentSubstring;
        result = null;
        bestLength = 0;
        for (i = 0; i < this.templateDescriptions.length; i += 1) {
            currentDescription = this.templateDescriptions[i];
            currentName = currentDescription.name;
            currentLength = currentName.length;
            currentSubstring = input.substr(index, currentLength);
            if ((currentSubstring === currentName) && ((result === null) || (bestLength < currentLength))) {
                result = currentDescription;
                bestLength = currentLength;
            }
        }
        return result;
    };

    this.getNextPredefinedSymbolFrom = function (index) {
        var limit, currentIndex, currentSymbol;
        limit = input.length;
        for (currentIndex = index; currentIndex < limit; currentIndex += 1) {
            currentSymbol = this.getLongestPredefinedSymbolAt(currentIndex);
            if (currentSymbol !== null) {
                return { symbol: currentSymbol, index: currentIndex };
            }
        }
        return null;
    };

    this.readNextSymbol = function () {
        var currentSymbol = this.tokens[this.currentTokensIndex].symbol;
        if (this.currentTokensIndex < (this.tokens.length - 1)) {
            this.currentTokensIndex += 1;
        }
        this.currentPriority = 0;
        switch (currentSymbol.opType) {
        case helpers.SYM_EOF:
            this.currentSymbol = helpers.SYM_EOF;
            break;
        case helpers.SYM_PREFIX_OPERATOR:
            this.currentSymbol = helpers.SYM_PREFIX_OPERATOR;
            this.currentSymbolString = currentSymbol.name;
            break;
        case helpers.SYM_POSTFIX_OPERATOR:
            this.currentSymbol = helpers.SYM_POSTFIX_OPERATOR;
            this.currentSymbolString = currentSymbol.name;
            break;
        case helpers.SYM_INFIX_OPERATOR:
            this.currentSymbol = helpers.SYM_INFIX_OPERATOR;
            this.currentSymbolString = currentSymbol.name;
            this.currentPriority = currentSymbol.priority;
            break;
        case helpers.SYM_LITERAL:
            this.currentSymbol = helpers.SYM_LITERAL;
            this.currentSymbolString = currentSymbol.name;
            break;
        case helpers.SYM_BEGIN_BLOCK:
            this.currentSymbol = helpers.SYM_BEGIN_BLOCK;
            this.currentSymbolString = currentSymbol.name;
            break;
        case helpers.SYM_END_BLOCK:
            this.currentSymbol = helpers.SYM_END_BLOCK;
            this.currentSymbolString = currentSymbol.name;
            break;
        case helpers.SYM_SEPARATOR:
            this.currentSymbol = helpers.SYM_SEPARATOR;
            this.currentSymbolString = currentSymbol.name;
            break;
        }
    };

    this.getTemplateDescription = function (name) {
        var i, currentDescription;
        for (i = 0; i < this.templateDescriptions.length; i += 1) {
            currentDescription = this.templateDescriptions[i];
            if (currentDescription.name === name) {
                return currentDescription;
            }
        }
        return null;
    };

    this.tokenize = function () {
        var currentLiteralName, currentIndex, currentSymbol;
        currentIndex = 0;
        currentSymbol = this.getNextPredefinedSymbolFrom(currentIndex);
        while (currentSymbol !== null) {
            if (currentIndex !== currentSymbol.index) {
                currentLiteralName = this.input.substring(currentIndex, currentSymbol.index);
                this.tokens.push({symbol: {name: currentLiteralName, opType: helpers.SYM_LITERAL, template: ""}, index: currentIndex});
            }
            this.tokens.push(currentSymbol);
            currentIndex = currentSymbol.index + currentSymbol.symbol.name.length;
            currentSymbol = this.getNextPredefinedSymbolFrom(currentIndex);
        }
        if (currentIndex < this.input.length) {
            currentLiteralName = this.input.substring(currentIndex);
            this.tokens.push({symbol: {name: currentLiteralName, opType: helpers.SYM_LITERAL, template: ""}, index: currentIndex});
        }
        this.tokens.push({symbol: {name: "", opType: helpers.SYM_EOF, template: ""}, index: this.input.length});
    };
}
