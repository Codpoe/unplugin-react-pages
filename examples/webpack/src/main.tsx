import * as React from 'react';
import { Suspense } from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
// @ts-ignore
import routes from 'generated-pages';
import './index.css';

render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback="loading...">{renderRoutes(routes)}</Suspense>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
