# AZ2NEXTHOOPS — Scouting Site

A public, **read-only** scouting website with a **password-protected editor** so only
you can add or change reports. Built as a fast, no-coding-needed static site.

- **Reports** organized by **level** (NBA, College, G-League, International) and **position**.
- Each report is a clean **white document** (Google-Doc style) with an **Objective Statement**
  and a fact-backed **Analysis**, plus **Projected Role**, **Strengths**, and **Questions**.
- **Ranked Boards** that are **level-sealed** and **position-sealed** — leagues and positions
  are never mixed (Overall, Shooters, Defenders, Guards, Wings, Bigs, 2-Way).
- Scout **context** (age, role, competition level, physical growth, mental adaptability,
  reference points) is captured to sharpen your evaluation but is **never shown** on the
  public report. No "Philosophy" header appears anywhere on the page.

---

## 1. Viewing (everyone)

Open `index.html` in a browser (or your hosted URL). Visitors can browse Reports and
Boards, open any report, and print/save a report as PDF. They **cannot** edit anything.

---

## 2. Editing (you only)

### Step A — Unlock the editor
Click the **Editor** (lock) button in the header and enter your password. The password is
checked on the server. Set the `ADMIN_PASSWORD` environment variable in Netlify to change it.
The editor stays unlocked until you lock it or close the browser tab.

When unlocked, an **Editor** bar appears and you'll see **+ Add Report**, **Edit**, and
board-management controls. No one else sees these.

### Step B — Add / edit a report (no coding)
1. Click **+ Add Report** (or **Edit** on an existing card/report).
2. Fill the form:
   - **Identity:** name, level, position, team.
   - **Vitals:** height, weight, age, class/year, handedness.
   - **Objective Statement** (required): your one-paragraph lens.
   - **Projected Role.**
   - **Strengths** and **Questions** (add as many lines as you want).
   - **Analysis:** open any of the 8 pillars and fill the sub-fields. **Leave blank what you
     don't use.** Empty sections don't appear on the report.
   - **Scout context** (internal). **These never appear on the public report.**
3. Click **Save report.** It saves straight to the live database.

### Step C — Build ranked boards
Go to **Boards**, pick a **Level** and a **Board**, then use the **Manage this board** panel to
add players and reorder them with the **▲ ▼** buttons. Every change saves right away.
- Boards only let you choose players from that level.
- Guards/Wings/Bigs boards are restricted to matching positions. If you change a player's
  level or position, they're taken off boards they no longer fit.

### Live sync across devices
All reports and boards are stored in one shared database, so phone (Safari), desktop
(Chrome, Firefox, Edge) and every visitor see the same data. There's nothing to publish or
upload. Open pages refresh when you switch back to the tab and every 30 seconds while
visible. Use **Refresh** in the Editor bar to pull the latest right away.

If a browser still has edits saved from the old "save to this browser" version, you're
offered a one-time **Import** after unlocking the editor. Only copies newer than the
database version are uploaded, and the old browser copy is then cleared.

---

## 3. Putting the site online (free options)
Upload the whole `az2nexthoops/` folder to any static host:

- **GitHub Pages** — push the folder to a repo, enable Pages.
- **Netlify** — drag the folder into Netlify Drop, or connect the repo.
- **Cloudflare Pages / Vercel** — connect a repo and deploy as-is.

Edits go live as soon as you save. No re-upload needed.

---

## 4. A note on the password
The editor password is checked on the server, and every save is checked again on the server,
so it isn't visible in the page source. Set a strong `ADMIN_PASSWORD` environment variable in
Netlify. Until you do, the original password is still used.

---

## 5. Files
```
az2nexthoops/
├─ index.html              page shell + header/nav
├─ css/style.css           all styling (white "doc" report look)
├─ js/
│  ├─ data.js              levels/positions/board list + offline fallback copy
│  └─ app.js               rendering, live sync + password-protected editor
├─ netlify/functions/api.mts   live data API (/api/*)
├─ db/                    database schema
├─ assets/
│  └─ az2nexthoops-logo.jpg  your logo (unchanged)
└─ README.md               this file
```

## 6. How a public report is structured
Objective Statement → Analysis (only the pillars you filled) → Projected Role → Strengths →
Questions → footer with report date. Clean, role-first, and built for clarity and projection
over volume.
