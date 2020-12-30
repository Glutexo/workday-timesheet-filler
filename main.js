// ==UserScript==
// @name         Workday Timesheet Filler
// @namespace    http://github.com/Glutexo/
// @version      0.1
// @description  Fills in timesheets in the Workday app.
// @author       Glutexo
// @match        https://wd5.myworkday.com/*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    const _domQueries = {
        body: function () {
            return document.querySelector('body');
        },
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
        timeInputs: function (row) {
            return row.querySelectorAll('[data-automation-id=standaloneTimeWidget] input');
        },
        menuItems: function (popup) {
            return popup.querySelectorAll('[data-automation-id=menuItem]');
        },
        checkboxes: function () {
            var queries = [
                '[data-automation-id=fieldSetContent]',
                '[data-automation-id=checkboxPanel]'
            ], query = queries.join(' ');
            return document.querySelectorAll(query);
        }
    },
    _domManipulations = {
        createElement: function (tagName, properties, style) {
            const _element = document.createElement(tagName);
            for (const [key, value] of Object.entries(properties)) {
                _element[key] = value;
            }
            for (const [key, value] of Object.entries(style)) {
                _element.style[key] = value;
            }
            return _element;
        }
    }, _Checkboxes = function () {
        var checkboxes = _domQueries.checkboxes();
        this.fill = function () {
            var i = 0;
            while (i < 5) {
                checkboxes[i].click();
                i++;
            }
        }
    }, _TimeInputs = function (row) {
        var timeInputs = _domQueries.timeInputs(row);
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
    ui.FillButton = function (callback) {
        const style = {
            color: '#fff',
            backgroundColor: '#000',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1000,
        }, properties = {
            innerText: 'Fill'
        };
        this._button = _domManipulations.createElement('button', properties, style);
        this._callback = callback;
    }
    ui.FillButton.prototype._insert = function () {
        const body = _domQueries.body();
        body.appendChild(this._button);
    }
    ui.FillButton.prototype._listen = function () {
        this._button.addEventListener('click', this._callback);
    }
    ui.FillButton.prototype.setUp = function () {
        this._insert();
        this._listen();
    }

    function main() {
        function fillEntryList() {
            function domGetForm() {
                return document.querySelector('[data-automation-id=panelSet]');
            }

            function domGetEntryRows() {
                return form.querySelectorAll('[data-automation-id=panelSetRow]');
            }

            function domGetRemoveButton(row) {
                return row.querySelector('[data-automation-id=panelSetRowDeleteButton]');
            }

            function domGetAddButton() {
                return form.querySelector('[data-automation-id=panelSetAddButton]')
            }

            function removeRow(row) {
                var button = domGetRemoveButton(row);
                button.click();
            }

            function removeLastRow(rows) {
                var row = rows[rows.length - 1];
                removeRow(row);
            }

            function addRow() {
                if (!addButton) {
                    addButton = domGetAddButton(form);
                }
                addButton.click();
            }

            function fillRowData(rows) {
                function fillInFirst(row) {
                    var timeInputs = new _TimeInputs(row),
                        select = _domQueries.select(row),
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

                fillInFirst(rows[0]);
                fillInSecond(rows[1]);
            }

            function fillEntryRows() {
                var rows = domGetEntryRows();

                if (rows.length > 2) {
                    removeLastRow(rows);
                    return false;
                } else if(rows.length < 2) {
                    addRow();
                    return false;
                } else {
                    fillRowData(rows);
                    return true;
                }
            }

            function observeEntryList() {
                function domGetEntryList() {
                    return form.querySelector('ul');
                }

                function handleMutation(mutation, index, allMutations) {
                    if (mutation.type == "childList" && mutation.target == entryList) {
                        var done = fillEntryRows();
                        if (done) {
                            mutationObserver.disconnect();
                        }
                    }
                }

                function callback(mutations, observer) {
                    mutations.forEach(handleMutation);
                }

                var entryList = domGetEntryList(),
                    mutationObserver = new MutationObserver(callback);
                mutationObserver.observe(entryList, {childList: true});
            }

            var form = domGetForm(),
                addButton;

            observeEntryList();
            fillEntryRows();
        }

        function fillCheckboxes() {
            var checkboxes = new _Checkboxes();
            checkboxes.fill();
        }

        function run() {
            fillEntryList();
            fillCheckboxes();
        }

        new ui.FillButton(run).setUp();
    }

    main();
})();
