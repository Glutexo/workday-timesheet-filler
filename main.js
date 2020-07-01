// ==UserScript==
// @name         Workday Timesheet Filler
// @namespace    http://github.com/Glutexo/
// @version      0.1
// @description  Fills in timesheets in the Workday app.
// @author       Glutexog
// @match        https://wd5.myworkday.com/*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    
    var _domQueries = {
	checkboxes: function () {
            var queries = [
		'[data-automation-id=fieldSetContent]',
		'[data-automation-id=checkboxPanel]'
            ], query = queries.join(' ');
            return document.querySelectorAll(query);
	}
    },
	Checkboxes = function () {
	    this.checkboxes = _domQueries.checkboxes();
	    this.fill = function () {
		var i = 0;
		while (i < 5) {
		    this.checkboxes[i].click();
		    i++;
		}
	    }
	};

    function _domGetForm() {
        return document.querySelector('[data-automation-id=panelSet]');
    }

    function _domGetAddButton(form) {
        return form.querySelector('[data-automation-id=panelSetAddButton]')
    }

    function _domGetEntryRows(form) {
        return form.querySelectorAll('[data-automation-id=panelSetRow]');
    }

    function _domGetSelect(row) {
        return row.querySelector('[data-automation-id=selectWidget]');
    }

    function _domGetSelectPopup(select) {
        var queries = [
            '[data-automation-id=selectWidget-SuggestionPopup]',
            '[data-associated-widget=\'' + select.id + '\']'
        ];
        var query = queries.join(',');
        return document.querySelector(query);
    }

    function _domGetMenuItems(popup) {
        return popup.querySelectorAll('[data-automation-id=menuItem]');
    }

    function _domGetTimeInputs(row) {
        return row.querySelectorAll('[data-automation-id=standaloneTimeWidget] input');
    }

    function _domCreateButton(caption) {
        var button = document.createElement('button');
        button.style['color'] = '#fff';
        button.style['background-color'] = '#000';
        button.style['position'] = 'absolute';
        button.style['top'] = 0;
        button.style['left'] = 0;
        button.style['z-index'] = 1000;
        button.innerText = caption;
        document.querySelector('body').appendChild(button);
        return button;
    }

    function _fillInFirstRow(row) {
        var timeInputs = _domGetTimeInputs(row),
            select = _domGetSelect(row),
            popup, menuItems;

        timeInputs[0].value = '08:00';
        timeInputs[1].value = '12:00';


        select.click();
        popup = _domGetSelectPopup(select);
        menuItems = _domGetMenuItems(popup);
        setTimeout(function() { menuItems[1].click(); }, 1000);
    }

    function _fillInSecondRow(row) {
        var timeInputs = _domGetTimeInputs(row)
        timeInputs[0].value = '12:30';
        timeInputs[1].value = '16:30';
    }


    function _fillEverything() {
        var form = _domGetForm(),
            addButton = _domGetAddButton(form),
            rows, checkboxes, i = 0;

        addButton.click();
        setTimeout(function() {
            rows = _domGetEntryRows(form);
            _fillInFirstRow(rows[0]);
            _fillInSecondRow(rows[1]);
        }, 1000);

        checkboxes = new Checkboxes();
        checkboxes.fill();
    }

    function main() {
        var button = _domCreateButton('Fill');
        button.addEventListener('click', _fillEverything);
    }

    main();
})();
