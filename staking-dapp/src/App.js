import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import github from './assets/images/github.png';

import PublicRoute from 'routes/PublicRoute';

import Header from 'components/Header';

import Home from 'containers/Home';
import NotFound from 'containers/NotFound';

const App = (props) => (
  <SnackbarProvider maxSnack={3}>
    <div className="page">
      <Header />

      <div className="app-container">
        <Switch>
          <PublicRoute
            exact
            path="/"
            component={Home}
            props={props}
          />

          <Route component={NotFound} />
        </Switch>
      </div>

      <div className="fixed-menu">
        <a target="_blank" href="https://t.me/docToken">
          <img src="./images/telegram.png" alt="Telegram" />
        </a>
        <a target="_blank" href="https://www.twitter.com/DocLifechain">
          <img src="./images/twitter.png" alt="Twitter" />
        </a>
        <a target="_blank" href="https://www.github.com/doc-com/lifechain-defi">
          <img src={github} alt="github" />
        </a>
      </div>
    </div>
  </SnackbarProvider>
);

export default withRouter(App);
