# NutriPath AI (Fuel the Future Hackathon Website)

A multi-page, mobile-first web app prototype for malnutrition screening and intervention workflows.

## Pages

- `index.html` - product homepage and role-based entry
- `assessment.html` - AI risk intake form
- `results.html` - risk score, deficiencies, meal plan, and referral actions
- `map.html` - resource locator map with filters (Leaflet + OpenStreetMap)
- `dashboard.html` - NGO analytics dashboard with charts
- `learn.html` - micro-learning and voice assist cards

## Run locally

```bash
cd "/Users/abhinavgarg/Documents/New project/fuel-the-future-web"
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/index.html`.

## Notes

- Data is stored in browser `localStorage`.
- Works as a lightweight PWA with offline cache via `sw.js`.
- Uses only free/open tools and public map tiles.
