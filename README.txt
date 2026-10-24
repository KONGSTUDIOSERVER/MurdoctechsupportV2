Murdoc Tech Support V2

Website: https://kongstudioserver.github.io/MurdoctechsupportV2/
AI backend: https://murdoc-ai.omarroblox21.workers.dev/api/chat

The original arcade is preserved in arcade.html. The homepage adds an AI
chat panel connected to a Cloudflare Worker. Gemini's key is a private
Cloudflare secret named GEMINI_API_KEY. It is never sent to the browser.

The backend accepts browser requests from https://kongstudioserver.github.io.
It validates message history, caps input size and output, handles API errors,
and uses Cloudflare's rate-limiting binding for 12 requests per minute per IP
per Cloudflare location. Shared networks share this limit. These limits are
not a billing cap or authentication; origin checks restrict browsers, and
non-browser clients can forge Origin. Google Gemini quotas still apply.

Chat history lives only in the current tab and clears on reload. The last
eight exchanges are sent to Gemini along with the next question.

Backend source is maintained separately and is not published with this website.
Keep .env, .dev.vars, and deployment credentials out of this repository.

The site continues to use the existing main-branch GitHub Pages deployment.
