# RAILNOVA — Frontend First Project Pack

This folder contains a complete first-stage frontend prototype and the planning material for the next phases.

## What is included

- `frontend/` — working responsive website prototype (HTML, CSS and JavaScript)
- `frontend/assets/` — six generated railway images and the RailNova mark
- `prompts/MASTER_WEBSITE_GENERATION_PROMPT.md` — full website generation prompt
- `prompts/FRONTEND_ONLY_BUILD_PROMPT.md` — focused frontend-only prompt
- `docs/IRCTC_WORKFLOW_RESEARCH.md` — official workflow and feature research references
- `docs/FRONTEND_SCOPE_AND_ACCEPTANCE.md` — scope and manual test checklist
- `docs/DATABASE_BACKEND_PHASE_2.md` — database/backend connection plan for later approval
- `design/design-tokens.json` — visual design tokens

## Run on Windows

1. Extract the ZIP file.
2. Open the `frontend` folder.
3. Double-click `start-windows.bat` (Python 3 must be installed), or open PowerShell in this folder and run:

```powershell
python -m http.server 8000
```

4. Open `http://localhost:8000` in Chrome or Edge.

## Run on macOS / Linux

Open Terminal in the `frontend` folder and run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Demo workflow

1. Search a sample route.
2. Choose a train and class.
3. Add one or more passenger records.
4. Review the journey and fare estimate.
5. Select UPI, card, net banking or wallet as the displayed payment method.
6. Click the demo payment action to generate a simulated ticket.
7. Open My Trips to view the sample booking.

## Important limitations

This is a frontend-only demonstration. It does not connect to IRCTC, Indian Railways, any train inventory provider, payment gateway or authentication system. Train IDs, schedules, fares, availability, PNR values and payment outcomes are illustrative only. No actual ticket is issued and no money is collected. Do not enter real payment credentials or sensitive identity data.

## Next development stage

Review the frontend and acceptance checklist first. Only after explicit approval should the project move to the database/backend plan in `docs/DATABASE_BACKEND_PHASE_2.md`.

## Updated frontend scope

The UI now includes a gateway selector for Razorpay and TSTPay (frontend selection only), UPI/card/net-banking/wallet method states, payment summary, simulated payment outcome, ticket confirmation, browser Print / Save as PDF action, and an Admin control-centre preview. No gateway credentials, live API calls, payment collection, railway booking or real authentication are implemented in this frontend phase.
