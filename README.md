# QuizForge

A simple client-side multiple-choice quiz builder.

## Run
Open `index.html` in a browser.

Questions are stored in the browser's localStorage, so they remain after refreshing the page on the same browser.

## OpenAI integration
The current version is intentionally client-side and does not expose an OpenAI API key.
To add AI question generation, use a small backend/serverless function that calls the OpenAI API and keeps the API key server-side.
