// ==UserScript==
// @name         Workday Timesheet Filler
// @namespace    http://github.com/Glutexo/
// @version      0.1
// @description  Fills in timesheets in the Workday app.
// @author       Glutexo
// @match        https://wd5.myworkday.com/*
// ==/UserScript==

(function() {
    'use strict';

    const dom = {};

    dom.body = function () {
        const element = document.querySelector('body');
        return new dom.Body(element);
    }

    dom.Body = function (element) {
        this.element = element;
    };
    dom.Body.prototype.checkboxes = function () {
        const queryParts = [
            '[data-automation-id=fieldSetContent]',
            '[data-automation-id=checkboxPanel]'
        ], query = queryParts.join(' '),
        elements = this.element.querySelectorAll(query);
        return new dom.Checkboxes(elements);
    };
    dom.Body.prototype.form = function () {
        const element = this.element.querySelector(
            '[data-automation-id=panelSet]'
        );
        return new dom.Form(element);
    };

    dom.Checkboxes = function (elements) {
        this.elements = elements;
    };

    dom.Form = function (element) {
        this.element = element;
        this._addButton = this.addButton();
    };
    dom.Form.prototype.entryList = function () {
        const element = this.element.querySelector('ul');
        return new dom.EntryList(element);
    };
    dom.Form.prototype.rows = function () {
        const elements = this.element.querySelectorAll(
            '[data-automation-id=panelSetRow]'
        );
        return new dom.Rows(elements);
    };
    dom.Form.prototype.addButton = function () {
        const element = this.element.querySelector(
            '[data-automation-id=panelSetAddButton]'
        );
        return new dom.Button(element);
    };
    dom.Form.prototype.addRow = function () {
        this._addButton.click();
    }

    dom.EntryList = function (element) {
        this.element = element;
    };

    dom.Rows = function (elements) {
        this.items = [];
        for (const element of elements) {
            const row = new dom.Row(element);
            this.items.push(row);
        }
    };
    dom.Rows.prototype.last = function () {
        const index = this.items.length - 1;
        return this.items[index];
    };

    dom.Row = function (element) {
        this.element = element;
    };
    dom.Row.IN = 0;
    dom.Row.OUT = 1;
    dom.Row.prototype.input = function (index) {
        const element = this.element.querySelectorAll(
            '[data-automation-id=standaloneTimeWidget] input'
        )[index];
        return new dom.Input(element);
    };
    dom.Row.prototype.select = function () {
        const element = this.element.querySelector('[data-automation-id=selectWidget]');
        return new dom.Select(element);
    };
    dom.Row.prototype.removeButton = function () {
        const element = this.element.querySelector(
            '[data-automation-id=panelSetRowDeleteButton]'
        );
        return new dom.Button(element);
    };
    dom.Row.prototype.remove = function () {
        const button = this.removeButton();
        button.click();
    };
    dom.Row.prototype.fill = function (timeIn, timeOut, reason) {
        const inputIn = this.input(this.constructor.IN),
            inputOut = this.input(this.constructor.OUT),
            select = this.select();
        inputIn.fill(timeIn);
        inputOut.fill(timeOut);
        console.log(reason);
        if (reason !== undefined) {
            // Can’t operate more selects at the same time.
            select.select(reason);
        }
    }

    dom.Select = function (element) {
        this.element = element;
    };
    dom.Select.MEAL = 1;
    dom.Select.OUT = 2;
    dom.Select.prototype.open = function () {
        this.element.click();
    };
    dom.Select.prototype.select = function (index) {
        const body = document.querySelector('body'),
            callback = this._popupCallback(index),
            observer = new MutationObserver(callback);
        observer.observe(body, {childList: true});
        this.open();
    };
    dom.Select.prototype._popupCallback = function (index) {
        return (mutations, popupObserver) => {
            const popupElement = mutations[0].addedNodes[0],
                clickCallback = this._clickCallback(index),
                clickObserver = new MutationObserver(clickCallback);
            popupObserver.disconnect();
            clickObserver.observe(popupElement, {attributes: true});
        };
    };
    dom.Select.prototype._clickCallback = function (index) {
        return (mutations, clickObserver) => {
            const popupElement = mutations[0].target;
            if (popupElement.style.transform) {
                return; // Opening animation still running.
            }
            const popup = new dom.Popup(popupElement),
                menuItem = popup.menuItems()[index];
            clickObserver.disconnect();
            menuItem.click();
        };
    };

    dom.Popup = function (element) {
        this.element = element;
    };
    dom.Popup.prototype.menuItems = function () {
        return this.element.querySelectorAll('[data-automation-id=menuItem]');
    };

    dom.Input = function (element) {
        this.element = element;
    };
    dom.Input.prototype.fill = function (value) {
        this.element.focus();
        this.element.value = value;
        this.element.blur();
    };

    dom.Button = function (element) {
        this.element = element;
    };
    dom.Button.prototype.click = function () {
        this.element.click();
    };

    const domManipulations = {};

    domManipulations.createElement = function (tagName, properties, style) {
        const element = document.createElement(tagName);
        for (const [key, value] of Object.entries(properties)) {
            element[key] = value;
        }
        for (const [key, value] of Object.entries(style)) {
            element.style[key] = value;
        }
        return element;
    };
    domManipulations.addElement = function (parent, child) {
        parent.appendChild(child);
    };
    domManipulations.addOnClick = function (element, callback) {
        element.addEventListener('click', callback);
    };

    const ui = {};

    ui.FillButton = function () {
        this.button = this._create();
    };
    ui.FillButton.prototype.setUp = function (body, callback) {
        this._insert(body, this.button);
        this._listen(this.button, callback);
    };
    ui.FillButton.prototype._create = function () {
        const properties = {
            innerText: 'Fill'
        }, style = {
            color: '#fff',
            backgroundColor: '#000',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1000,
        };
        return domManipulations.createElement('button', properties, style);
    };
    ui.FillButton.prototype._insert = function (body, button) {
        domManipulations.addElement(body, button)
    };
    ui.FillButton.prototype._listen = function (button, callback) {
        domManipulations.addOnClick(button, callback)
    };

    function main() {
        function fillEntryList() {
            function fillRowData(rows) {
                const firstRow = rows.items[0], secondRow = rows.items[1];
                firstRow.fill('08:00', '12:00', dom.Select.MEAL)
                secondRow.fill('12:30', '16:30', undefined)
            }

            function fillEntryRows() {
                const rows = form.rows(),
                    targetLength = 2;

                if (rows.items.length > targetLength) {
                    rows.last().remove();
                    return false;
                } else if(rows.items.length < targetLength) {
                    form.addRow();
                    return false;
                } else {
                    fillRowData(rows);
                    return true;
                }
            }

            function observeEntryList() {
                function handleMutation(mutation, index, allMutations) {
                    if (
                        mutation.type === 'childList' &&
                        mutation.target === entryList.element
                    ) {
                        const done = fillEntryRows();
                        if (done) {
                            mutationObserver.disconnect();
                        }
                    }
                }

                function callback(mutations, observer) {
                    mutations.forEach(handleMutation);
                }

                const entryList = form.entryList(),
                    mutationObserver = new MutationObserver(callback);
                mutationObserver.observe(
                    entryList.element,
                    {childList: true}
                );
            }

            const form = body.form();

            observeEntryList();
            fillEntryRows();
        }

        function fillCheckboxes() {
            const checkboxes = body.checkboxes();
            let i = 0;
            while (i < 5) {
                checkboxes.elements[i].click();
                i++;
            }
        }

        function fill() {
            fillEntryList();
            fillCheckboxes();
        }

        const body = new dom.body(), fillButton = new ui.FillButton();
	    fillButton.setUp(body.element, fill);
    }

    main();
})();
