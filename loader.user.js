// ==UserScript==
// @name         Workday Timesheet Filler
// @namespace    http://github.com/Glutexo/
// @version      0.1
// @description  Fills in timesheets in the Workday app.
// @author       Glutexo
// @match        https://wd5.myworkday.com/*
// @grant        GM.xmlHttpRequest
// @require      http://localhost:8000/main.user.js
// ==/UserScript==

(function() {
   "use strict";

    function onload(response) {
        var element = document.createElement("script");
        element.innerText = response.responseText;
        document.body.appendChild(element);
    }

    var timestamp = Date.now(),
        queryParam = encodeURIComponent(timestamp),
        url = `http://localhost:8000/main.user.js?${queryParam}`;
    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: onload,
    });
})();
