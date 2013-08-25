/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global alert, event, MathJax, accessor, touchScroll, helpers, Scanner, Parser, Compiler*/

function TextInput(element) {
    "use strict";
    this.element = element;
    this.CHR_INPUT_POSITION = "|";

    this.postprocessText = function () {
        element.innerHTML = this.element.textContent.replace(this.CHR_INPUT_POSITION, "<span style='color:lightgray'>" + this.CHR_INPUT_POSITION + "<\/span>");
    };

    this.getText = function () {
        return this.element.textContent.replace(this.CHR_INPUT_POSITION, "");
    };

    this.setText = function (text) {
        this.element.textContent = text + this.CHR_INPUT_POSITION;
        this.postprocessText();
    };

    this.activate = function () {
        this.setText(this.getText());
    };

    this.deactivate = function () {
        this.element.textContent = this.getText();
    };

    this.goLeft = function () {
        this.setTextPosition(Math.max(0, this.getTextPosition() - 1));
    };

    this.goRight = function () {
        this.setTextPosition(Math.min(this.element.textContent.length - 1, this.getTextPosition() + 1));
    };

    this.getTextPosition = function () {
        return this.element.textContent.indexOf(this.CHR_INPUT_POSITION);
    };

    this.setTextPosition = function (index) {
        var oldText, leftText, rightText;
        oldText = this.getText();
        leftText = oldText.substr(0, index);
        rightText = oldText.substr(index);
        this.element.textContent = leftText + this.CHR_INPUT_POSITION + rightText;
        this.postprocessText();
    };

    this.insertCharacter = function (character) {
        this.element.textContent = this.element.textContent.replace(this.CHR_INPUT_POSITION, character + this.CHR_INPUT_POSITION);
        this.postprocessText();
    };

    this.deleteCharacter = function () {
        var oldText, index, leftText, rightText;
        oldText = this.getText();
        index = this.getTextPosition();
        leftText = oldText.substr(0, index);
        rightText = oldText.substr(index);
        if (0 < leftText.length) {
            leftText = leftText.substr(0, leftText.length - 1);
            this.element.textContent = leftText + this.CHR_INPUT_POSITION + rightText;
            this.postprocessText();
        }
    };

    this.setText("");
}