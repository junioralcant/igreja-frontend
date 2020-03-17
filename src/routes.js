import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { isAuthenticated } from "./services/auth";

import SignIn from "./pages/SingIn";
import Home from "./pages/Home";
import Oferta from "./pages/Oferta";
import Congregado from "./pages/Congregado";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: `/`, state: { from: props.location } }} />
      )
    }
  />
);

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={SignIn} />
      <PrivateRoute exact path="/home" component={Home} />
      <PrivateRoute path="/home/:id" component={Home} />
      <PrivateRoute exact path="/oferta" component={Oferta} />
      <PrivateRoute path="/oferta/:id" component={Oferta} />
      <PrivateRoute exact path="/congregado" component={Congregado} />
      <PrivateRoute path="/congregado/:id" component={Congregado} />
    </Switch>
  </BrowserRouter>
);

export default Routes;
