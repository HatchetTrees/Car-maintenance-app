# AutoGuide v3 — Car Maintenance Hub

A clean, searchable car maintenance reference app built with vanilla HTML, CSS, and JavaScript. No frameworks or build tools required.

## Features

- **Search** any problem by keyword (e.g. "oil", "flat tire", "dead battery")
- **Sidebar navigation** with 7 maintenance categories
- **Step-by-step detail panels** for each topic
- **YouTube tutorial links** on every topic's detail panel
- **My Vehicle profile** — save year, make, model, VIN, engine, color, mileage, and full physical dimensions (length, width, height, curb weight)
- **Records & Bills** — log insurance bills, service records, specs, and any other notes with dates and amounts
- **Session persistence** — vehicle profile and records survive page refresh (sessionStorage)
- **Priority badges** (Urgent / High / Medium / Low)
- **Responsive** — works on mobile and desktop

## Project Structure

```
autoguide/
├── index.html          # App shell & sidebar HTML
├── css/
│   └── styles.css      # All styles (light mode + responsive)
├── js/
│   ├── icons.js        # SVG icon strings
│   └── app.js          # All logic: routing, vehicle profile, records, search
└── data/
    └── topics.js       # 12 maintenance topics with steps, tips & tutorial links
```

## Getting Started

No build step needed. Open `index.html` in any browser, or serve with a static file server:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

## Pushing to GitHub

```bash
cd autoguide
git init
git add .
git commit -m "Initial commit — AutoGuide v3"
git remote add origin https://github.com/your-username/autoguide.git
git push -u origin main
```

## Adding a Maintenance Topic

Open `data/topics.js` and add to the `topics` array:

```js
{
  id: 13,
  cat: 'fluids',           // fluids | tires | electrical | engine | lights | safety | filters
  title: 'Check brake fluid',
  desc: 'Short description shown on the card.',
  severity: 'med',         // low | med | high
  severity_label: 'Medium',
  icon: 'coolant',         // key from js/icons.js
  iconStyle: 'icon-blue',  // icon-blue | icon-amber | icon-red | icon-green | icon-teal
  steps: [
    'Step one...',
    'Step two...',
  ],
  tip: 'Pro tip shown at the bottom of the detail panel.',
  tutorial: {
    label: 'How to check brake fluid',
    url: 'https://www.youtube.com/results?search_query=how+to+check+brake+fluid',
  },
},
```

## Adding a New Icon

Open `js/icons.js` and add an SVG string:

```js
myicon: `<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
  <!-- your path here -->
</svg>`,
```

Then reference it with `icon: 'myicon'` in your topic.

## Content Source

Maintenance steps and tips are based on the *Teen Driver Car Maintenance and Repair Guide* by AutoMD.

## License

MIT
