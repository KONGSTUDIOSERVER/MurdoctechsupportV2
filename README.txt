Murdoc Tech Support V2 — GitHub Pages

The original games and settings from the existing GitHub repository are
preserved exactly in arcade.html. index.html adds an accessible AI chat panel.

GitHub Pages serves static files. Chat stays disabled until a secure external
backend is connected. No Gemini key or other secret is included in this folder.

To connect a backend later, set the murdoc-ai-endpoint meta tag in index.html
to its HTTPS chat endpoint. It must accept POST JSON {messages:[{role,text}]}
and return JSON {reply:"..."}, and allow the website's origin using CORS.
Keep your Gemini key on that backend. Never put it in this repository.

The existing GitHub Pages main-branch publishing settings are reused.
Local previews need an HTTP server for the arcade's service worker.
