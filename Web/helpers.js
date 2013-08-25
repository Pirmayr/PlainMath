/*jshint globalstrict: true*/
/*jslint browser: true*/
/*global MathJax, alert, event, accessor*/

var helpers = {
    CHR_SPACE: "\u2423",
    CHR_DELETE: "\u232B",
    CHR_ARROW_LEFT: "\u25C1",
    CHR_ARROW_RIGHT: "\u25B7",
    CHR_EDIT: "\u270E",
    CHR_MULTIPLICATION: "\u00D7",
    NAME_BRACKETED_EXPRESSION: "_bracketedExpression",
    STORAGE_KEY_EXPRESSIONS: "_easyMathExpressions",
    STORAGE_KEY_EXPRESSION: "_easyMathExpression",
    SYM_EOF: 1,
    SYM_PREFIX_OPERATOR: 2,
    SYM_POSTFIX_OPERATOR: 3,
    SYM_INFIX_OPERATOR: 4,
    SYM_LITERAL: 5,
    SYM_BEGIN_BLOCK: 6,
    SYM_END_BLOCK: 7,
    SYM_SEPARATOR: 8,
    SYM_NONE: 0,

    closure: function (object, callback, param) {
        "use strict";
        return function () {
            callback.call(object, this, param);
        };
    },

    getField: function (object, fieldName, defaultValue) {
        "use strict";
        var result = object.getAttribute("data-" + fieldName);
        return this.isDefined(result) ? result : defaultValue;
    },

    getPersistentValue: function (name) {
        "use strict";
        try {
            var result = window.localStorage[name];
            if (result === undefined) {
                result = "";
            }
            return result;
        } catch (e) {
            alert(e.message);
        }
        return "";
    },

    hasContent: function (value) {
        "use strict";
        if (!this.isDefined(value)) {
            return false;
        }
        return value !== "";
    },

    /**
     * Includes given javascript-file.
     * @param filename Name of the javascript-file to be included.
     */
    include: function (filename) {
        "use strict";
        var head, script;
        head = document.getElementsByTagName('head')[0];
        script = document.createElement('script');
        script.src = filename;
        script.type = 'text/javascript';
        head.appendChild(script);
    },

    /**
     * Determines, if the accessor-function for Android can be used.
     * @returns {*} If the accessor-function for Android can be used, the return-value is "true", otherwise the return-value is "false".
     */
    isAndroidAccessorOk: function () {
        "use strict";
        try {
            return helpers.isDefined(accessor);
        } catch (e) {
            return false;
        }
    },

    isDefined: function (value) {
        "use strict";
        if (value === null) {
            return false;
        }
        return value !== undefined;
    },

    log: function (msg) {
        "use strict";
        window.setTimeout(function () {
            throw new Error(msg);
        }, 0);
    },

    setHandlerByClassName: function (className, eventName, handler) {
        "use strict";
        var elements, limit, i, currentElement;
        elements = document.getElementsByClassName(className);
        limit = elements.length;
        for (i = 0; i < limit; i += 1) {
            currentElement = elements[i];
            currentElement[eventName] = handler;
        }
    },

    setPersistentValue: function (name, value) {
        "use strict";
        try {
            window.localStorage[name] = value;
        } catch (e) {
            alert(e.message);
        }
    }
};
