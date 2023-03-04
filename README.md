# svelte-static-spa
A template repository for building a single page web app (SPA) with Svelte.

## Installation

Clone or fork this repo and run `npm i`.

## Development

Run `npm run dev` to start the development server. Edit the svelte and typescript files in the `src` folder to make changes to your app. Change the `docs/index.html` file directly to make changes to your app's metadata and to add additional stylesheets or resource links.

## Build

When your app is production ready, run the following command to output the static site bundle to the `docs/build` directory:

### Linux

`npm run build`

### Windows

`npm run build-win`

## Publish

After building your bundle, publish the static files in the `docs` directory on the platform of your choice, or host them directly on github pages by enabling github pages to serve directly from the `docs` folder from your repository.