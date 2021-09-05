import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
// @ts-ignore
import routes from 'virtual:generated-pages';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback="loading...">{renderRoutes(routes)}</Suspense>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
