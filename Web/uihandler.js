/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global alert, event, MathJax, accessor, touchScroll, helpers, Scanner, Parser, Compiler, TextInput*/

var TIMEOUT_CONVERT = 500;
var TIMEOUT_HANDLE_INPUT = 200;
var TIMEOUT_REFRESH_OUTPUT = 100;

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
    this.TEMPLATE_EXPRESSION_HEADER_ROW = "<tr><td id='idLeft' class='tdHeader' colspan='2'><img src='arrow_left_30.png'/></td><td id='idMiddle' class='tdHeader' colspan='6'><\/td><td id='idPrint' class='tdHeader' colspan='2'><img src='printer_30.png'/><\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_INPUT_ROW = "<tr><td id='idInput' class='tdInput' colspan='10'><\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_OUTPUT_ROW = "<tr><td class='tdOutput' colspan='10'><div id='idOutputContainer' class='divContainer'><div id='output1' class='divOutput'><\/div><div id='output2' class='divOutput'><\/div><\/div><\/td><\/tr>";
    this.TEMPLATE_EXPRESSION_KEYBOARD_ROW = "<tr>[KEYS]<\/tr>";
    this.TEMPLATE_EXPRESSION_KEYBOARD_KEY = "<td class='tdKeyboardKey'>[TEXT]<\/td>";
    this.TEMPLATE_EXPRESSION_KEYBOARD_KEY_LAST = "<td class='tdKeyboardKeyLast'>[TEXT]<\/td>";
    this.TEMPLATE_PRINT_OUTPUT = "<html><header><script type='text/javascript' charset='utf-8' src='http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script></header><body>[EXPRESSION]</body></html>";
    
    this.originalInnerHTML = "";

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
     * This value is "true", if the user has requested to go to the expression-page, otherwise "false".
     * @type {boolean}
     */
    this.isGotoExpressionPageRequested = false;
    /**
     * This value is "true", if the user has requested to go back to the page with the list of expressions, otherwise "false".
     * @type {boolean}
     */
    this.isGotoExpressionsPageRequested = false;
    /**
     *     This value is "true", if a key is currently pressed, otherwise "false".
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

    this.convert = function () {
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
        }
    };

    this.createExpressionsTable = function (expressions) {
        var rows, i, currentSplitExpression, currentEntryExpression, currentEntryTitle, currentEntryRow;
        rows = "";
        document.getElementById("expressionsContent").innerHTML = this.TEMPLATE_EXPRESSIONS_TABLE.replace("[ROWS]", rows);
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
        document.getElementById("expressionsContent").innerHTML = this.TEMPLATE_EXPRESSIONS_TABLE.replace("[ROWS]", rows);
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
        document.getElementById("expressionContent").innerHTML = this.TEMPLATE_EXPRESSION_TABLE.replace("[ROWS]", rows);
        document.getElementById("idLeft").onclick = helpers.closure(this, this.goToExpressionsPage, null);
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
    
    this.printEnd = function() {
        document.getElementById("divRight").style.visibility = "visible";
        document.getElementById("divLeft").style.visibility = "hidden";
        document.getElementById("divPrint").style.visibility = "hidden";
        this.convert();
    }

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

    this.goToExpressionPage = function (element) {
        var currentEntryExpression, currentEntryTitle;
        this.entryElementCurrent = element.parentNode.getElementsByClassName("tdEntry")[0];
        currentEntryExpression = helpers.getField(this.entryElementCurrent, "entryExpression", "");
        currentEntryTitle = helpers.getField(this.entryElementCurrent, "entryTitle", "");
        this.textInputExpression.setText(currentEntryExpression);
        this.textInputTitle.setText(currentEntryTitle);
        this.isGotoExpressionPageRequested = true;
        this.convert();
    };

    this.goToExpressionsPage = function () {
        this.isGotoExpressionsPageRequested = true;
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
        this.createExpressionsTable(this.expressionsLoad());
        this.createExpressionTable();
        document.getElementById(this.idInput).textContent = helpers.getPersistentValue(this.storageKeyExpression);
        this.convert();
    };

    this.printStart = function () {
        document.getElementById("divRight").style.visibility = "hidden";
        document.getElementById("divLeft").style.visibility = "hidden";
        document.getElementById("divPrint").style.visibility = "visible";
        
        window.location = "call://print";
    };
    
    /**
     * Prints the current output.
     */
    this.printOutput = function () {
        var input, compiler, output;

        input = this.textInputExpression.getText();
        compiler = new Compiler();
        output = (input === "") ? "" : compiler.convert(input, this.templateDescriptions);
        document.getElementById("divPrint").innerHTML = "$$" + output + "$$";
        
        MathJax.Hub.Queue(["Typeset", MathJax.Hub], document.getElementById("divPrint"));
        MathJax.Hub.Queue(helpers.closure(this, this.printStart, null));
        /*
         if (helpers.isAndroidAccessorOk()) {
         //noinspection JSUnresolvedFunction
         accessor.printHTML(this.TEMPLATE_PRINT_OUTPUT.replace("[EXPRESSION]", document.getElementById(this.idOutput1).innerHTML));
         } else {
         window.print();
         }
         */
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
            document.getElementById("divRight").style.visibility = "visible";
            document.getElementById("divLeft").style.visibility = "hidden";
            foregroundElement.style.visibility = "hidden";
            backgroundElement.style.visibility = "visible";
            this.textInputTitle.deactivate();
            this.textInputExpression.activate();
        } else if (this.isGotoExpressionsPageRequested) {
            foregroundElement.style.visibility = "hidden";
            backgroundElement.style.visibility = "hidden";
            document.getElementById("divLeft").style.visibility = "visible";
            document.getElementById("divRight").style.visibility = "hidden";
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