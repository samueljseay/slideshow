# Google Photos Slideshow

## Why

I originally thought I could run the Google photos slideshow from a browser on
my wall mounted screen, but alas it crashes after a few minutes in Chrome or Firefox. It also
has no option to change transition speed or transition effect. This rectifies those issues
for me.

Authentication is done client side via the Google authentication mechanism. You'll need a
Google Photos client ID to set this up for yourself.

## Setup

You'll need a google API client ID to use with Google Photos. Create `js/config/config.json` with contents:

```
{
  "googlePhotosClientID": "<Your Client ID>"
}
```

then:

`npm i && npm start`

You'll need to login to your google account, then the album choice UI is very basic, choose an album and it will load the photos into
a slide show.

## TODO

1. Load images in a queue with fetch, only loading the first (n) images. When image n-1 is displayed, load the next (n) (or something like this)
2. Cache images as base64 in localstorage with their IDs
