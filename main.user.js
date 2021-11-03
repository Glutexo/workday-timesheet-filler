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
    dom.Row.prototype.timeInputs = function () {
        return row.querySelectorAll(
            '[data-automation-id=standaloneTimeWidget] input'
        );
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

    dom.Button = function (element) {
        this.element = element;
    };
    dom.Button.prototype.click = function () {
        this.element.click();
    };

    const _domQueries = {
        select: function (row) {
            return row.querySelector('[data-automation-id=selectWidget]');
        },
        selectPopup: function (select) {
            var queries = [
                '[data-automation-id=selectWidget-SuggestionPopup]',
                '[data-associated-widget=\'' + select.id + '\']'
            ];
            var query = queries.join(',');
            return document.querySelector(query);
        },
        menuItems: function (popup) {
            return popup.querySelectorAll('[data-automation-id=menuItem]');
        },
    };

    const domManipulations = {};

    domManipulations.createElement = function (tagName, properties, style) {
        const _element = document.createElement(tagName);
        for (const [key, value] of Object.entries(properties)) {
            _element[key] = value;
        }
        for (const [key, value] of Object.entries(style)) {
            _element.style[key] = value;
        }
        return _element;
    };
    domManipulations.addElement = function (parent, child) {
        parent.appendChild(child);
    };
    domManipulations.addOnClick = function (element, callback) {
        element.addEventListener('click', callback);
    };

    const _TimeInputs = function (row) {
        const timeInputs = row.timeInputs();
        this.fill = function (in_value, out_value) {
            var values = [in_value, out_value], i = 0;
            while (i < 2) {
                timeInputs[i].value = values[i];
                timeInputs[i].focus();
                timeInputs[i].blur();
                i++;
            }
        };
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
                function fillInFirst(row) {
                    var timeInputs = new _TimeInputs(row),
                        select = _domQueries.select(row.elements),
                        popup, menuItems;

                    timeInputs.fill('08:00', '12:00');

                    select.click();
                    popup = _domQueries.selectPopup(select);
                    menuItems = _domQueries.menuItems(popup);
                    setTimeout(function() { menuItems[1].click(); }, 1000);
                }

                function fillInSecond(row) {
                    var timeInputs = new _TimeInputs(row);
                    timeInputs.fill('12:30', '16:30');
                }

                fillInFirst(rows.items[0]);
                fillInSecond(rows.items[1]);
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
