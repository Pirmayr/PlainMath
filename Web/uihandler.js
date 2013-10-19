/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global alert, event, MathJax, accessor, touchScroll, helpers, Scanner, Parser, Compiler, TextInput*/

var TIMEOUT_CONVERT = 500;
var TIMEOUT_HANDLE_INPUT = 200;
var TIMEOUT_REFRESH_OUTPUT = 125;
var MAX_PARAMETERS = 100;

function UIHandler(idInput, idOutput1, idOutput2, storageKeyExpressions, storageKeyExpression, keyboardLayout, templateDescriptions) {
    "use strict";
    this.idInput = idInput;
    this.idOutput1 = idOutput1;
    this.idOutput2 = idOutput2;
    this.storageKeyExpressions = storageKeyExpressions;
    this.storageKeyExpression = storageKeyExpression;
    this.keyboardLayout = keyboardLayout;
    this.templateDescriptions = templateDescriptions;

    this.TEMPLATE_EXPRESSIONS_TABLE = "<table class='tbExpressions'><colgroup span='10'></colgroup>[ROWS]<\/table>";
    this.TEMPLATE_EXPRESSIONS_ENTRY_ROW = "<tr><td class='tdEntry' colspan='7' data-entryExpression='[EXPRESSION]' data-entryTitle='[TITLE]'>[ENTRY]<\/td><td class='tdAdd' colspan='1'>+<\/td><td class='tdDelete' colspan='1'>-<\/td><td class='tdEdit' colspan='1'>&#x270e;<\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_TABLE = "<table class='tbExpression'><colgroup span='10'></colgroup>[ROWS]<\/table>";
    this.TEMPLATE_EXPRESSION_HEADER_ROW = "<tr><td id='idLeft' class='tdHeader' colspan='2'><img src='arrow_left_30.png'/></td><td id='idMiddle' class='tdHeader' colspan='4'><\/td><td id='idPrint' class='tdHeader' colspan='2'><img src='printer_30.png'/><\/td><td id='idHelp' class='tdHeader' colspan='2'><img src='help_30.png'/><\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_INPUT_ROW = "<tr><td id='idInput' class='tdInput' colspan='10'><\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_OUTPUT_ROW = "<tr><td class='tdOutput' colspan='10'><div id='idOutputContainer' class='divContainer'><div id='output1' class='divOutput'><\/div><div id='output2' class='divOutput'><\/div><\/div><\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_KEYBOARD_ROW = "<tr>[KEYS]<\/tr>";
    this.TEMPLATE_EXPRESSION_KEYBOARD_KEY = "<td class='tdKeyboardKey'>[TEXT]<\/td>";
    this.TEMPLATE_EXPRESSION_KEYBOARD_KEY_LAST = "<td class='tdKeyboardKeyLast'>[TEXT]<\/td>";
    this.TEMPLATE_HELP_TABLE = "<table class='tbHelp'><colgroup span='10'></colgroup>[ROWS]<\/table>";
    this.TEMPLATE_HELP_ENTRY_ROW = "<tr><td class='tdHelpExample' colspan='5'>[HELP_EXAMPLE]<\/td><td class='tdHelpOutput' colspan='5'>[HELP_OUTPUT]<\/td><\/tr>";
    this.TEMPLATE_PRINT_OUTPUT = "<html><header><script type='text/javascript' charset='utf-8' src='http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script></header><body>[EXPRESSION]</body></html>";
    this.savedOriginalElement = null;

    /**
     * The current entry-element in the list of expressions.
     * @type {null}
     */
    this.entryElementCurrent = null;
    /**
     * This value is "true", if the device has touch-support, otherwise "false".
     * @type {boolean}
     */
    this.hasTouchSupport = document.documentElement.hasOwnProperty("ontouchstart");
    /**
     * This value is "true", if the user has requested to go to the expressions-page, otherwise "false".
     * @type {boolean}
     */
    this.isGotoExpressionsPageRequested = false;
    /**
     * This value is "true", if the user has requested to go to the expression-page, otherwise "false".
     * @type {boolean}
     */
    this.isGotoExpressionPageRequested = false;
    /**
     * This value is "true", if the user has requested to go to the help-page, otherwise "false".
     * @type {boolean}
     */
    this.isGotoHelpPageRequested = false;
    /**
     * This value is "true", if a key is currently pressed, otherwise "false".
     */
    this.isKeyPressed = false;
    /**
     * The text-input object, where the current input goes to.
     * @type {null}
     */
    this.textInputCurrent = null;
    /**
     * The text-input object for the expression.
     * @type {null}
     */
    this.textInputExpression = null;
    /**
     * The text-input object for the title.
     * @type {null}
     */
    this.textInputTitle = null;
    /**
     * Holds the id of the timer for converting the input to the output. If the value is 0, no such timer is active.
     * @type {null}
     */
    this.timerConvert = null;
    /**
     * Holds the id of the timer for refreshing the output. If the value is 0, no such timer is active.
     * @type {null}
     */
    this.timerRefreshOutput = null;

    this.convert = function (forceRefresh) {
        var input, compiler, output, outputElement1, outputElement2, backgroundElement;
        this.timerConvert = null;
        input = this.textInputExpression.getText();
        this.expressionsSave();
        helpers.setPersistentValue(this.storageKeyExpression, input);
        compiler = new Compiler();
        output = (input === "") ? "" : compiler.convert(input, this.templateDescriptions);
        if (output !== null) {
            outputElement1 = document.getElementById(this.idOutput1);
            outputElement2 = document.getElementById(this.idOutput2);
            backgroundElement = (outputElement1.style.visibility === "hidden") ? outputElement1 : outputElement2;
            backgroundElement.textContent = "$$" + output + "$$";
            MathJax.Hub.Queue(["Typeset", MathJax.Hub], backgroundElement);
            MathJax.Hub.Queue(helpers.closure(this, this.startRefreshOutput, null));
        } else if (helpers.hasContent(forceRefresh) && (typeof forceRefresh === "boolean") && forceRefresh) {
            this.startRefreshOutput();
            alert(forceRefresh);
        }
    };

    this.createExpressionsTable = function (expressions) {
        var rows, i, currentSplitExpression, currentEntryExpression, currentEntryTitle, currentEntryRow;
        rows = "";
        for (i = 0; i < expressions.length; i += 1) {
            currentSplitExpression = expressions[i].split("\t");
            currentEntryExpression = "";
            currentEntryTitle = "";
            switch (currentSplitExpression.length) {
            case 1:
                currentEntryExpression = currentSplitExpression[0];
                currentEntryTitle = currentSplitExpression[0];
                break;
            case 2:
                currentEntryExpression = currentSplitExpression[0];
                currentEntryTitle = currentSplitExpression[1];
                break;
            }
            currentEntryRow = this.TEMPLATE_EXPRESSIONS_ENTRY_ROW;
            currentEntryRow = currentEntryRow.replace("[ENTRY]", currentEntryTitle);
            currentEntryRow = currentEntryRow.replace("[EXPRESSION]", currentEntryExpression);
            currentEntryRow = currentEntryRow.replace("[TITLE]", currentEntryTitle);
            rows += currentEntryRow;
        }
        document.getElementById("idDivExpressionsContent").innerHTML = this.TEMPLATE_EXPRESSIONS_TABLE.replace("[ROWS]", rows);
        this.setExpressionsHandlers();
    };

    this.createExpressionTable = function () {
        var rows, i, currentRow, currentCharacters, j, currentCharacter, headerElement, inputElement;
        rows = "";
        rows += this.TEMPLATE_EXPRESSION_HEADER_ROW;
        rows += this.TEMPLATE_EXPRESSION_OUTPUT_ROW;
        rows += this.TEMPLATE_EXPRESSION_INPUT_ROW;
        for (i = 0; i < this.keyboardLayout.length; i += 1) {
            currentRow = this.keyboardLayout[i];
            currentCharacters = "";
            for (j = 0; j < currentRow.length; j += 1) {
                currentCharacter = currentRow[j].replace("<", "&lt").replace(">", "&gt");
                if (i < (this.keyboardLayout.length - 1)) {
                    currentCharacters += this.TEMPLATE_EXPRESSION_KEYBOARD_KEY.replace("[TEXT]", currentCharacter);
                } else {
                    currentCharacters += this.TEMPLATE_EXPRESSION_KEYBOARD_KEY_LAST.replace("[TEXT]", currentCharacter);
                }
            }
            rows += this.TEMPLATE_EXPRESSION_KEYBOARD_ROW.replace("[KEYS]", currentCharacters);
        }
        document.getElementById("idDivExpressionContent").innerHTML = this.TEMPLATE_EXPRESSION_TABLE.replace("[ROWS]", rows);
        document.getElementById("idLeft").onclick = helpers.closure(this, this.goToExpressionsPage, null);
        document.getElementById("idHelp").onclick = helpers.closure(this, this.goToHelpPage, null);
        document.getElementById("idPrint").onclick = helpers.closure(this, this.printOutput, null);
        this.setKeyHandlers(document.getElementsByClassName("tdKeyboardKey"));
        this.setKeyHandlers(document.getElementsByClassName("tdKeyboardKeyLast"));
        inputElement = document.getElementById("idInput");
        headerElement = document.getElementById("idMiddle");
        this.textInputExpression = new TextInput(inputElement);
        this.textInputTitle = new TextInput(headerElement);
        inputElement.onclick = helpers.closure(this, this.setTextInput, this.textInputExpression);
        headerElement.onclick = helpers.closure(this, this.setTextInput, this.textInputTitle);
        this.textInputCurrent = this.textInputExpression;
        touchScroll("idInput");
        touchScroll("idOutputContainer");
    };

    this.createHelpTable = function () {
        var rows, i, currentDescription, currentInDocumentation, currentOutput, currentHelpEntryRow;
        rows = "";
        for (i = 0; i < this.templateDescriptions.length; i += 1) {
            currentDescription = this.templateDescriptions[i];
            currentInDocumentation = currentDescription.inDocumentation;
            if (!helpers.isDefined(currentInDocumentation) || currentInDocumentation) {
                currentHelpEntryRow = this.TEMPLATE_HELP_ENTRY_ROW;
                currentHelpEntryRow = currentHelpEntryRow.replace("[HELP_EXAMPLE]", this.getExample(currentDescription));
                currentOutput = this.expandTemplate(currentDescription.template);
                currentHelpEntryRow = currentHelpEntryRow.replace("[HELP_OUTPUT]", "\\(" + currentOutput + "\\)");
                rows += currentHelpEntryRow;
            }
        }
        document.getElementById("idDivHelpContent").innerHTML = this.TEMPLATE_HELP_TABLE.replace("[ROWS]", rows);
        this.setHelpHandlers();
    };

    this.expandTemplate = function (template) {
        var result, curCharCode, i, curChar;
        result = template;
        curCharCode = "a".charCodeAt(0);
        for (i = 0; i < 10; i += 1) {
            curChar = String.fromCharCode(curCharCode);
            result = result.replace("\\\\" + i, "\\");
            result = result.replace("#l" + i, "");
            result = result.replace("#r" + i, "");
            result = result.replace("#" + i, curChar);
            curCharCode += 1;
        }
        return result;
    };

    this.expressionAdd = function (currentEntryElement) {
        currentEntryElement.parentNode.outerHTML += currentEntryElement.parentNode.outerHTML;
        this.setExpressionsHandlers();
        this.expressionsSave();
    };

    this.expressionDelete = function (currentEntryElement) {
        var rowElement = currentEntryElement.parentNode;
        rowElement.parentNode.removeChild(rowElement);
        this.expressionsSave();
    };

    /**
     * Gets array of expressions from the persistent storage.
     * @returns {*} Array of expressions.
     */
    this.expressionsLoad = function () {
        var expressions = helpers.getPersistentValue(this.storageKeyExpressions);
        return expressions.split("\n");
    };

    /**
     * Saves the expressions currently in the expressions-list to the persistent storage.
     */
    this.expressionsSave = function () {
        var expressions, entryElements, currentEntryElement, i, currentEntryExpression, currentEntryTitle;
        expressions = "";
        entryElements = document.getElementsByClassName("tdEntry");
        for (i = 0; i < entryElements.length; i += 1) {
            if (0 < i) {
                expressions += "\n";
            }
            currentEntryElement = entryElements[i];
            currentEntryExpression = helpers.getField(currentEntryElement, "entryExpression", "");
            currentEntryTitle = helpers.getField(currentEntryElement, "entryTitle", "");
            expressions += currentEntryExpression + "\t" + currentEntryTitle;
        }
        helpers.setPersistentValue(this.storageKeyExpressions, expressions);
    };

    this.getExample = function (templateDescription) {
        var parameterCount, parameterList, i;
        switch (templateDescription.opType) {
        case helpers.SYM_PREFIX_OPERATOR:
            parameterCount = this.parameterCount(templateDescription.template);
            if (parameterCount < 0) {
                return "";
            }
            if (parameterCount === 1) {
                return templateDescription.name + " a";
            }
            parameterList = "";
            for (i = 0; i < parameterCount; i += 1) {
                if (parameterList !== "") {
                    parameterList += ",";
                }
                parameterList += String.fromCharCode("a".charCodeAt(0) + i);
            }
            return templateDescription.name + "(" + parameterList + ")";
        case helpers.SYM_POSTFIX_OPERATOR:
            return "a" + templateDescription.name;
        case helpers.SYM_INFIX_OPERATOR:
            if (helpers.isAlpha(templateDescription.name)) {
                return "a " + templateDescription.name + " b";
            }
            return "a" + templateDescription.name + "b";
        }
        return "";
    };

    this.goToExpressionPage = function (element) {
        var currentEntryExpression, currentEntryTitle;
        this.entryElementCurrent = element.parentNode.getElementsByClassName("tdEntry")[0];
        currentEntryExpression = helpers.getField(this.entryElementCurrent, "entryExpression", "");
        currentEntryTitle = helpers.getField(this.entryElementCurrent, "entryTitle", "");
        this.textInputExpression.setText(currentEntryExpression);
        this.textInputTitle.setText(currentEntryTitle);
        this.isGotoExpressionPageRequested = true;
        document.getElementById("divRight").style.display = "block";
        this.convert(true);
    };

    //noinspection JSUnusedLocalSymbols
    this.goToExpressionPageFromHelp = function (element) {
        this.isGotoExpressionPageRequested = true;
        document.getElementById("divRight").style.display = "block";
        this.convert();
    };

    this.goToExpressionsPage = function () {
        this.isGotoExpressionsPageRequested = true;
        this.startRefreshOutput();
    };

    this.goToHelpPage = function () {
        this.isGotoHelpPageRequested = true;
        this.startRefreshOutput();
    };

    /**
     * Handles input coming from a click-event.
     * @param element HTML-element associated with the input.
     * @param text Input-text.
     */
    this.handleClickInput = function (element, text) {
        this.handleInput(element, text, true);
    };

    this.handleEndInput = function () {
        this.isKeyPressed = false;
    };

    this.handleInput = function (element, text, forceInput) {
        var currentExpression, currentTitle;
        if (forceInput || this.isKeyPressed) {
            switch (text) {
            case helpers.CHR_DELETE:
                this.textInputCurrent.deleteCharacter();
                break;
            case helpers.CHR_SPACE:
                this.textInputCurrent.insertCharacter(" ");
                break;
            case helpers.CHR_ARROW_LEFT:
                this.textInputCurrent.goLeft();
                break;
            case helpers.CHR_ARROW_RIGHT:
                this.textInputCurrent.goRight();
                break;
            default:
                this.textInputCurrent.insertCharacter(text);
            }
            if (helpers.hasContent(this.entryElementCurrent)) {
                currentExpression = this.textInputExpression.getText();
                currentTitle = this.textInputTitle.getText();
                this.entryElementCurrent.setAttribute("data-entryExpression", currentExpression);
                this.entryElementCurrent.setAttribute("data-entryTitle", currentTitle);
                this.entryElementCurrent.textContent = currentTitle;
            }
            if (this.textInputCurrent.element.id === "idInput") {
                if (this.timerConvert !== null) {
                    clearTimeout(this.timerConvert);
                    this.timerConvert = null;
                }
                this.timerConvert = setTimeout(helpers.closure(this, this.convert, null), TIMEOUT_CONVERT);
            } else {
                this.expressionsSave();
            }
            setTimeout(helpers.closure(this, this.handleInput, text), TIMEOUT_HANDLE_INPUT);
        }
    };

    /**
     * Handles input coming from a touch-event.
     * @param element HTML-element associated with the input.
     * @param text Input-text.
     */
    this.handleTouchInput = function (element, text) {
        if (!this.isKeyPressed) {
            this.isKeyPressed = true;
            this.handleInput(element, text, false);
        }
    };

    this.initialize = function () {
        var helpElement;
        this.createHelpTable();
        helpElement = document.getElementById("divHelp");
        MathJax.Hub.Queue(["Typeset", MathJax.Hub], helpElement);
        MathJax.Hub.Queue(helpers.closure(this, this.initializeFinal, null));
    };

    this.initializeFinal = function () {
        this.createExpressionTable();
        this.createExpressionsTable(this.expressionsLoad());
        document.getElementById(this.idInput).textContent = helpers.getPersistentValue(this.storageKeyExpression);
        this.goToExpressionsPage();
    };

    this.parameterCount = function (template) {
        var result;
        for (result = 0; result < MAX_PARAMETERS; result += 1) {
            if (template.indexOf("#" + result) === (-1)) {
                return result;
            }
        }
        return (-1);
    };

    this.printBegin = function () {
        var input, compiler, output, contentElement;
        input = this.textInputExpression.getText();
        compiler = new Compiler();
        output = (input === "") ? "" : compiler.convert(input, this.templateDescriptions);
        contentElement = document.getElementById("divContent");
        this.savedOriginalElement = document.getElementById("divPage");
        contentElement.removeChild(this.savedOriginalElement);
        contentElement.innerHTML = "$$" + output + "$$";
        MathJax.Hub.Typeset();
    };

    this.printEnd = function () {
        var contentElement;
        contentElement = document.getElementById("divContent");
        contentElement.innerHTML = "";
        contentElement.appendChild(this.savedOriginalElement);
    };

    /**
     * Prints the current output.
     */
    this.printOutput = function () {
        if (helpers.isAndroidAccessorOk()) { // Perform Android-style printing ...
            this.textInputTitle.setText("hi2");
            //noinspection JSUnresolvedFunction
            accessor.printHTML(this.TEMPLATE_PRINT_OUTPUT.replace("[EXPRESSION]", document.getElementById(this.idOutput1).innerHTML));
        } else { // Perform IOS-style printing ...
            window.location = "call://print";
        }
    };

    /**
     * Refreshes the output with the result of the most recent compilation of the input.
     */
    this.refreshOutput = function () {
        var containerElement, outputElement1, outputElement2, foregroundElement, backgroundElement, newLeftValue, newTopValue, newTopValueString;
        this.timerRefreshOutput = null;
        containerElement = document.getElementById("idOutputContainer");
        outputElement1 = document.getElementById(this.idOutput1);
        outputElement2 = document.getElementById(this.idOutput2);
        foregroundElement = (outputElement1.style.visibility === "hidden") ? outputElement2 : outputElement1;
        backgroundElement = (outputElement1.style.visibility === "hidden") ? outputElement1 : outputElement2;
        newLeftValue = (containerElement.offsetWidth - backgroundElement.offsetWidth) / 2;
        newTopValue = (containerElement.offsetHeight - backgroundElement.offsetHeight) / 2;
        newTopValueString = "top: [VALUE]px".replace("[VALUE]", newTopValue.toString());
        backgroundElement.setAttribute("style", newTopValueString);
        if (this.isGotoExpressionPageRequested) {
            helpers.elementShow(document.getElementById("divRight"));
            helpers.elementHide(document.getElementById("divLeft"));
            helpers.elementHide(document.getElementById("divHelp"));
            foregroundElement.style.visibility = "hidden";
            backgroundElement.style.visibility = "visible";
            this.textInputTitle.deactivate();
            this.textInputExpression.activate();
        } else if (this.isGotoExpressionsPageRequested) {
            foregroundElement.style.visibility = "hidden";
            backgroundElement.style.visibility = "hidden";
            helpers.elementHide(document.getElementById("divRight"));
            helpers.elementShow(document.getElementById("divLeft"));
            helpers.elementHide(document.getElementById("divHelp"));
        } else if (this.isGotoHelpPageRequested) {
            foregroundElement.style.visibility = "hidden";
            backgroundElement.style.visibility = "hidden";
            helpers.elementHide(document.getElementById("divRight"));
            helpers.elementHide(document.getElementById("divLeft"));
            helpers.elementShow(document.getElementById("divHelp"));
        } else {
            if (document.getElementById("divRight").style.visibility === "visible") {
                foregroundElement.style.visibility = "hidden";
                backgroundElement.style.visibility = "visible";
            } else {
                foregroundElement.style.visibility = "hidden";
                backgroundElement.style.visibility = "hidden";
            }
        }
        this.isGotoExpressionPageRequested = false;
        this.isGotoExpressionsPageRequested = false;
        this.isGotoHelpPageRequested = false;
        foregroundElement.innerHTML = backgroundElement.innerHTML;
        if (0 <= newLeftValue) {
            containerElement.setAttribute("style", "overflow-x: hidden");
        } else {
            containerElement.setAttribute("style", "overflow-x: scroll");
        }
        if (0 <= newTopValue) {
            containerElement.setAttribute("style", "overflow-y: hidden");
        } else {
            containerElement.setAttribute("style", "overflow-y: scroll");
        }
    };

    /**
     * Sets the handlers for adding, deleting, and editing expressions.
     */
    this.setExpressionsHandlers = function () {
        helpers.setHandlerByClassName("tdAdd", "onclick", helpers.closure(this, this.expressionAdd, null));
        helpers.setHandlerByClassName("tdDelete", "onclick", helpers.closure(this, this.expressionDelete, null));
        helpers.setHandlerByClassName("tdEdit", "onclick", helpers.closure(this, this.goToExpressionPage, null));
    };

    /**
     * Sets the handlers for adding, deleting, and editing expressions.
     */
    this.setHelpHandlers = function () {
        var leaveHelpElement;
        leaveHelpElement = document.getElementById("idLeaveHelp");
        leaveHelpElement.onclick = helpers.closure(this, this.goToExpressionPageFromHelp, null);
    };

    this.setKeyHandlers = function (keyElements) {
        var limit, k, currentKeyElement;
        limit = keyElements.length;
        for (k = 0; k < limit; k += 1) {
            currentKeyElement = keyElements[k];
            if (this.hasTouchSupport) {
                currentKeyElement.ontouchstart = helpers.closure(this, this.handleTouchInput, currentKeyElement.textContent);
                currentKeyElement.ontouchend = helpers.closure(this, this.handleEndInput);
            } else {
                currentKeyElement.onclick = helpers.closure(this, this.handleClickInput, currentKeyElement.textContent);
            }
        }
    };

    /**
     * Sets the current textInput-object.
     * @param element HTML-element associated with the action (ignored).
     * @param textInput The textInput-objekt to be set.
     */
    this.setTextInput = function (element, textInput) {
        if (this.textInputCurrent !== null) {
            this.textInputCurrent.deactivate();
        }
        this.textInputCurrent = textInput;
        this.textInputCurrent.activate();
    };

    this.startRefreshOutput = function () {
        if (this.timerRefreshOutput !== null) {
            clearTimeout(this.timerRefreshOutput);
        }
        this.timerRefreshOutput = setTimeout(helpers.closure(this, this.refreshOutput, null), TIMEOUT_REFRESH_OUTPUT);
    };
}