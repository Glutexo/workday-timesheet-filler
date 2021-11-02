(function() {
    'use strict';

    const dom = {};

    dom.Body = function () {
        this.element = document.querySelector('body');
    };
    dom.Body.prototype.checkboxes = function () {
        const queryParts = [
            '[data-automation-id=fieldSetContent]',
            '[data-automation-id=checkboxPanel]'
        ], query = queryParts.join(' ');
        return this.element.querySelectorAll(query);
    };

    dom.Form = function (body) {
        this.element = body.querySelector('[data-automation-id=panelSet]');
    };
    dom.Form.prototype.entryList = function () {
        return this.element.querySelector('ul');
    };
    dom.Form.prototype.rows = function () {
        return this.element.querySelectorAll(
            '[data-automation-id=panelSetRow]'
        );
    };
    dom.Form.prototype.addButton = function () {
        return this.element.querySelector(
            '[data-automation-id=panelSetAddButton]'
        );
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
        timeInputs: function (row) {
            return row.querySelectorAll('[data-automation-id=standaloneTimeWidget] input');
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
            function domGetRemoveButton(row) {
                return row.querySelector('[data-automation-id=panelSetRowDeleteButton]');
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
                    addButton = form.addButton();
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
                const rows = form.rows();

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

                var entryList = form.entryList(),
                    mutationObserver = new MutationObserver(callback);
                mutationObserver.observe(entryList, {childList: true});
            }

            var form = new dom.Form(body.element),
                addButton;

            observeEntryList();
            fillEntryRows();
        }

        function fillCheckboxes() {
            const checkboxes = body.checkboxes();
            let i = 0;
            while (i < 5) {
                checkboxes[i].click();
                i++;
            }
        }

        function fill() {
            fillEntryList();
            fillCheckboxes();
        }

        const body = new dom.Body(), fillButton = new ui.FillButton();
	    fillButton.setUp(body.element, fill);
    }

    main();
})();
