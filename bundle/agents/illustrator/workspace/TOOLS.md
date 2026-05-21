# TOOLS.md — Illustrator

## Image backend

- **Model ref:** `openai/stable-diffusion`
- **Proxy:** LiteLLM (`agents.defaults.imageGenerationModel` in `openclaw.json`)
- **Default size:** `512x512`

## Output

Generated files are written by OpenClaw media handling; always return the paths from `image_generate` in your final reply.
