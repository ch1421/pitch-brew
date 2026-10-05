PITCH&BREW — DATE / BOOKING ISOLATION FIX

Important fixes:
- Each calendar date reads ONLY rows for that exact YYYY-MM-DD date.
- Admin Week Start is used exactly as entered; it is never shifted automatically.
- Old database rows are cleared before a new weekly schedule is imported.
- Browser/API cache is bypassed when changing dates.
- A returned schedule is rejected if its date does not exactly match the selected date.
- AM/PM suffix parsing remains consistent: a suffix at the end of a range applies to both endpoints.

Run:
py -m pip install -r requirements.txt
py app.py
Admin: http://127.0.0.1:5000/
App: http://127.0.0.1:5000/app
