# Dynamic NFC Card

A prototype exploring a simple idea:

**What if one physical NFC card could serve multiple purposes without needing to be rewritten?**

The NFC card contains one permanent URL. Through a web dashboard, the owner can save different destinations and choose which one is currently active.

The same physical card can therefore switch between LinkedIn, GitHub, a resume, portfolio, Letterboxd, Goodreads, Spotify, or any custom URL.

## How It Works

NFC Card  
↓  
Permanent URL  
↓  
Next.js  
↓  
Supabase  
↓  
Active Destination  
↓  
LinkedIn / GitHub / Resume / etc.

Changing the active destination in the dashboard changes what the NFC card opens without modifying the NFC tag itself.

## Features

- User authentication
- Personal dashboard
- Save multiple destinations
- Switch active destination
- Add custom URLs
- Dynamic NFC redirects
- Supabase Row Level Security
- Public NFC access without requiring the recipient to install an app

## Tech Stack

- **Next.js**
- **TypeScript**
- **Supabase**
- **Vercel**
- **NFC / NDEF**

## Live Prototype

https://just-tap-five.vercel.app

## Example

The NFC tag stores:

`https://just-tap-five.vercel.app/t/abc123`

If LinkedIn is active:

NFC → `/t/abc123` → LinkedIn

Change the active destination to GitHub:

NFC → `/t/abc123` → GitHub

The NFC tag itself is never rewritten.

## Status

Early prototype / proof of concept.

The project was built to explore dynamic NFC routing and how a single physical NFC card could adapt to different use cases.