(function() {
    'use strict';

    const dom = {
        Body: function () {
            this.element = document.querySelector('body');
        }
    };
    dom.Body.prototype.checkboxes = function () {
        const queries = [
            '[data-automation-id=fieldSetContent]',
            '[data-automation-id=checkboxPanel]'
        ], query = queries.join(' ');
        return this.element.querySelectorAll(query);
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

    const ui = {
    	setUpFillButton: function (body, callback) {
            const button = this.create();
            this.insert(body, button);
            this.listen(button, callback);
	    }
    };
    ui.setUpFillButton.create = function () {
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
        return _domManipulations.createElement('button', properties, style);
    };
    ui.setUpFillButton.insert = function (body, button) {
        body.element.appendChild(button);
    };
    ui.setUpFillButton.listen = function (button, callback) {
        button.addEventListener('click', callback);
    };
    ui.setUpFillButton = ui.setUpFillButton.bind(ui.setUpFillButton);

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

        const body = new dom.Body();
	    ui.setUpFillButton(body, fill);
    }

    main();
})();
