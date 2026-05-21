---
name: image-generate
description: Generate images and sketches from text descriptions using image_generate. Use for any illustration, sketch, or visual creation request.
---

# Image generate

## Default

`image_generate`: model `openai/stable-diffusion`, size `512x512`, count `1`.
Use `creative.defaultImageStyle` from profile if style not specified.

## Workflow

1. Extract: subject, style (default: `creative.defaultImageStyle` from profile), mood, any required text.
2. Build prompt: lead with medium matching the style (e.g. "Digital painting of…", "Photorealistic photo of…"), one main subject, no watermarks/extra limbs.
3. Call `image_generate`. Note all returned file paths.
4. Return: paths + one-line caption. On failure: report the error and stop.

## Prompt tips

- Lead with the medium: "Digital painting of…" / "Photorealistic photo of…" / "Pencil sketch of…"
- Simple background unless specified
- For sketch style: mention line art, light shading, off-white paper

## Rules

- Return absolute file paths so Zuzu can attach to Discord
- Do not use exec/browser to find stock images when task says **create**
