# How to run Zimazao on your own computer

No coding needed. You do this setup **once**; after that, starting the app is
one command.

## One-time setup (about 10 minutes)

1. **Install Node.js** — go to <https://nodejs.org>, download the **LTS**
   version, and install it (keep clicking Next).
2. **Install VS Code** — go to <https://code.visualstudio.com> and install it.
3. **Get the code onto your computer** — open VS Code, press
   `Ctrl+Shift+P`, type **"Git: Clone"**, press Enter, and paste:

   ```
   https://github.com/chisambanyirenda-create/Zimazao
   ```

   Choose a folder (e.g. Documents) and click **Open** when it finishes.
4. *(Optional but recommended)* Install the **Claude Code** extension from the
   Extensions panel in VS Code and sign in — then Claude works on the files
   right on your computer while you watch.

## Starting the app (every time)

1. In VS Code, open the menu **Terminal → New Terminal**.
2. Type this and press Enter:

   ```
   node start.mjs
   ```

3. Wait for the message `Zimazao is running` — your browser opens the app
   automatically at <http://localhost:5173>.
4. To stop it, click in the terminal and press `Ctrl+C`.

## Connecting your real data (optional)

The first start creates a file called `.env`. To see your real farmers,
listings and orders, open `.env` and paste your Supabase connection string
after `DATABASE_URL=`, then restart the app. Without it, the app still runs
but the screens are empty.

**Never share the `.env` file with anyone — it contains your passwords.**
It is already set up so it can never be uploaded to GitHub by accident.
