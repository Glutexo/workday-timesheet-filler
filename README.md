# Workday Timesheet Filler #

This script fills timesheets in Workday. It is very crude and still requires
non-trivial amount of manual work. Use at your own risk.

Tested only on Safari. 

## How to use ##

Install [_main.user.js_](main.user.js) into Tampermonkey. Then, a black “Fill”
button appears in the top-left corner of the Workday app.

From the Homepage:

1. Press “Time”.
2. Press “This Week”
3. Open “Enter Time”
4. Select “Quick Add”
5. Press “Next”
6. Press “Fill”

Wait a bit for the automation to take place. Then, press “OK”.

## Development ##

[_loader.user.js_](loader.user.js) can be used instead to dynamically load the
userscript. It is grabbed from _http://localhost:8000/main.user.js_. You can
use Python’s built-in SimpleHTTPServer to quickly serve the file from the
repository.

```shell
workday-timesheet-filler $ python -m SimpleHTTPServer
```

## License ##

[MIT](https://choosealicense.com/licenses/mit/)
