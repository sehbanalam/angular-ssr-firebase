# Deploying Angular 19 SSR with Firebase Hosting and Firebase Functions

In this blog post, we will walk through the steps to set up and deploy an Angular 19 Server-Side Rendering (SSR) application using Firebase Hosting and Firebase Functions. This guide is perfect for those who want to learn and demonstrate the capabilities of Angular SSR with Firebase.

## Prerequisites

Before we begin, make sure you have the following installed:

- Node.js (>= 14)
- Angular CLI
- Firebase CLI

## Step 1: Create a New Angular Project

First, create a new Angular project using the Angular CLI:

```sh
ng new angular-ssr-firebase
cd angular-ssr-firebase
```

## Step 2: Add Angular Universal

Add Angular Universal to your project to enable server-side rendering:

```sh
ng add @nguniversal/express-engine
```

This command will configure your Angular project for SSR and create the necessary files.

## Step 3: Install Firebase CLI

If you haven't already, install the Firebase CLI globally:

```sh
npm install -g firebase-tools
```

## Step 4: Initialize Firebase in Your Project

Login to your Firebase account and initialize Firebase in your project:

```sh
firebase login
firebase init
```

Select `Hosting` and `Functions` when prompted. Choose an existing Firebase project or create a new one. Set the public directory to `browser` and configure it as a single-page app.

## Step 5: Update Firebase Configuration

Modify the `firebase.json` file to include the necessary configurations for hosting and functions:

```json
{
  "hosting": {
    "public": "dist/angular-ssr-firebase/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "ssr"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs22"
  }
}
```

## Step 6: Update Functions Package

Update the `package.json` file to include the necessary scripts and dependencies:

```json
{
  "name": "functions",
  "scripts": {
    "build": "ng build && ng run angular-ssr-firebase:server",
    "serve": "npm run build && firebase emulators:start --only functions,hosting",
    "deploy": "firebase deploy --only functions,hosting"
  },
  "dependencies": {
    "@nguniversal/common": "^16.2.0",
    "@nguniversal/express-engine": "^16.2.0",
    "express": "^4.18.2",
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0"
  },
  "engines": {
    "node": ">=22"
  }
}
```

## Step 7: Create Firebase Function

Create a file `index.js` to handle SSR:

```javascript
const functions = require('firebase-functions');
const express = require('express');
const { join } = require('path');
const { existsSync } = require('fs');

const app = express();

const distFolder = join(process.cwd(), 'dist/angular-ssr-firebase/browser');
const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

async function bootstrap() {
  const { ngExpressEngine } = await import('@nguniversal/express-engine');
  const { AppServerModule } = await import('./dist/angular-ssr-firebase/server/main');
  const { APP_BASE_HREF } = await import('@angular/common');

  app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  app.set('view engine', 'html');
  app.set('views', distFolder);

  app.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  app.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  exports.ssr = functions.https.onRequest(app);
}

bootstrap();
```

## Step 8: Add Open Graph Meta Tags

Add Open Graph meta tags to your `index.html` file to test SSR:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AngularSsrFirebase</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <!-- Open Graph meta tags -->
  <meta property="og:title" content="Angular SSR Firebase">
  <meta property="og:description" content="A sample project to demonstrate Angular SSR with Firebase.">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com">
  <meta property="og:type" content="website">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

## Step 9: Build and Deploy

Finally, build and deploy your project to Firebase:

```sh
npm run build
npm run deploy
```

## Conclusion

Congratulations! You have successfully deployed an Angular 19 SSR application using Firebase Hosting and Firebase Functions. You can now share your project and demonstrate the capabilities of Angular SSR with Firebase.
