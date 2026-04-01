Place sample video files here.

Current assets:
- `19700121_1909_692d9c274f3081919559b2e0a3495b2f.mp4`
  Original source clip kept for reference.
  Approx. `1024x1792`, `15.1s`, `15 MB`.
- `demo-portrait-360.mp4`
  Recommended manual QA sample.
  Approx. `360x630`, `16.7s`, `601 KB`.
- `demo-portrait-360.webm`
  Alternate lightweight sample for compatibility checks.
  Approx. `360x630`, `505 KB`.

Files under `public/` are served by Vite as-is:
- `public/samples/demo-portrait-360.mp4` -> `/samples/demo-portrait-360.mp4`
- `public/samples/demo-portrait-360.webm` -> `/samples/demo-portrait-360.webm`

Recommended manual verification flow:
1. Start the app with `npm run dev`.
2. Load `demo-portrait-360.mp4` from the file input.
3. Confirm `mono` renders and playback starts.
4. Switch to `typographic` and confirm rendering continues.
5. Change `cols` and confirm the output canvas height rebuilds.
