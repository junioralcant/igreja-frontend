import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import api from "../../services/api";
import { login } from "../../services/auth";
import "./styles.css";

class SignIn extends Component {
  state = {
    email: "",
    password: "",
    error: ""
  };

  handleSignIn = async e => {
    e.preventDefault();
    const { email, password } = this.state;
    if (!email || !password) {
      this.setState({ error: "Preencha e-mail e senha para continuar!" });
    } else {
      try {
        const response = await api.post("/sessions", { email, password });
        login(response.data.token);
        this.props.history.push("/home");
      } catch (err) {
        this.setState({
          error:
            "Houve um problema com o login, verifique suas credenciais. T.T"
        });
      }
    }
  };

  render() {
    return (
      <div className="container">
        <div className="col-md-12">
          <div className="login">
            <form onSubmit={this.handleSignIn}>
              <h2 style={{ textAlign: "center" }}>AD Piqui</h2>
              {this.state.error && <p>{this.state.error}</p>}
              <input
                type="email"
                placeholder="Endereço de e-mail"
                onChange={e => this.setState({ email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Senha"
                onChange={e => this.setState({ password: e.target.value })}
              />
              <button type="submit">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(SignIn);
