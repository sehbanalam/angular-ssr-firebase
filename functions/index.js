// Import necessary modules
const functions = require('firebase-functions');
const express = require('express');
const { join } = require('path');
const { existsSync } = require('fs');

// Create an Express application
const app = express();

// Define the folder where the Angular browser build output is located
const distFolder = join(process.cwd(), 'dist/angular-ssr-firebase/browser');
// Determine the index HTML file to use
const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

// Asynchronous function to bootstrap the server
async function bootstrap() {
  // Dynamically import the necessary modules for Angular Universal
  const { ngExpressEngine } = await import('@nguniversal/express-engine');
  const { AppServerModule } = await import('./dist/angular-ssr-firebase/server/main');
  const { APP_BASE_HREF } = await import('@angular/common');

  // Set up the Express engine to use Angular Universal
  app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  // Set the view engine and views directory for the Express app
  app.set('view engine', 'html');
  app.set('views', distFolder);

  // Serve static files from the browser build output directory
  app.get('*.*', express.static(distFolder, {
    maxAge: '1y' // Cache static files for 1 year
  }));

  // Handle all other routes with server-side rendering
  app.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  // Export the Express app as a Firebase Cloud Function
  exports.ssr = functions.https.onRequest(app);
}

// Bootstrap the server
bootstrap();