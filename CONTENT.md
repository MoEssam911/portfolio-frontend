# Content follow-ups

JSON under `app/assets/data/` is filled so the UI is not empty. Treat it as **draft** until you review it file by file.

## Likely real (confirm)

- [ ] `settings.json` — name, bio, links, email, availability
- [ ] `resume.json` — Bevatel / Dafa / AI Tech / ITI roles and education
- [ ] `projects.json` — three professional projects (copy, dates, featured flags)
- [ ] `services.json` — service offerings

## Treat as placeholder

- [ ] `testimonials.json` — quotes look invented; replace with real ones or hide the section
- [ ] Project thumbnails — currently `null`; add files under `public/images/projects/` then set URLs
- [ ] Project galleries — currently empty `images: []`
- [ ] About page values copy (e.g. “Precision over polish”) — brand voice check

## Suggested order later

1. Settings  
2. Resume  
3. Services  
4. Testimonials (real or remove)  
5. Projects + screenshots into `public/images/projects/`
