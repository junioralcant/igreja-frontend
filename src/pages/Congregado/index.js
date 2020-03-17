import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parseFromTimeZone, formatToTimeZone } from "date-fns-timezone";
import { Form, Input, Select } from "unform";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import { IoIosTrash, IoMdCreate } from "react-icons/io";

import Sidebar from "../../components/Sidebar";

import "bootstrap/dist/css/bootstrap.min.css";

import api from "../../services/api";
import estados from "../../services/estados";

import "./styles.css";

export default function Dizimo({ ...props }) {
  const { history, match } = props;
  const [fieis, setFieis] = useState([]);

  const [fieisInfo, setFieisInfo] = useState({});
  const [pagina, setPagina] = useState(1);

  const [data, setData] = useState({}); //update
  const [error, setError] = useState(""); //update

  async function handleSubmit(data) {
    if (!match.params.id) {
      if (!data.congregacao || !data.nome) {
        toastr.error(`Preencha todos os campos obrigatórios (*)!
        `);
      } else {
        try {
          await api.postOrPut("/fieis", match.params.id, data);

          history.push("/congregado"); // redireciona o user
          history.go(0);
        } catch (error) {
          setError(error.response.data.error);
        }
      }
    } else {
      try {
        await api.postOrPut("/fieis", match.params.id, data);

        history.push("/congregado"); // redireciona o user
        history.go(0);
      } catch (error) {
        setError(error.response.data.error);
      }
    }
  }

  useEffect(() => {
    // update
    async function loadData() {
      const { id } = match.params;
      const response = await api.get(`/fieis/${id}`);

      setData(response.data);
    }

    if (match.params.id) {
      loadData();
    }
  }, [match.params, match.params.id]);

  useEffect(
    () => {
      if (match.params.id) {
        const dataFor = parseFromTimeZone(data.dataNascimento, {
          timeZone: "America/Sao_Paulo"
        });

        const dataForamatada = formatToTimeZone(dataFor, "YYYY-MM-DD", {
          timeZone: "Europe/Berlin"
        });

        setData({
          ...data,
          dataNascimento: dataForamatada
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.data, match.params.id]
  );

  useEffect(() => {
    async function loadFieis(page = pagina) {
      const response = await api.get(`/fieis?page=${page}`);
      const { docs, ...fieisResto } = response.data;
      setFieis(docs);
      setFieisInfo(fieisResto);
    }

    loadFieis();
  }, [pagina]);

  function removeFieu(id) {
    api.delete(`/fieis/${id}`);
    setTimeout(() => {
      history.go(0); // atualiza a página
    }, 1000);
  }

  async function filterNome(e) {
    if (e.target.value !== "") {
      const response = await api.get(`/fieis?nome=${e.target.value}`);
      setFieis(response.data.docs);
    } else {
      const response = await api.get("/fieis");
      setFieis(response.data.docs);
    }
  }

  function anteriorPagina() {
    if (pagina === 1) return; // if for a ultima página

    const numeroDePaginas = pagina - 1;

    setPagina(numeroDePaginas);
  }

  function proximaPagina() {
    if (pagina === fieisInfo.pages) return; // if for a ultima página

    const numeroDePaginas = pagina + 1;

    setPagina(numeroDePaginas);
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <Sidebar {...props} />
        </div>
      </div>

      <br />
      <h2>Cadastro de Congregados</h2>
      <div>
        <Form className="form-group" initialData={data} onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-4">
                  <Input className="form-control" name="nome" label="Nome *" />

                  <Input
                    className="form-control"
                    name="congregacao"
                    label="Congregação"
                  />

                  <Input
                    className="form-control"
                    type="date"
                    name="dataNascimento"
                    label="Data Nascimento"
                  />
                </div>

                <div className="col-md-4">
                  <Input className="form-control" name="endereco" label="Rua" />
                  <Input
                    className="form-control"
                    name="cidade"
                    label="Cidade"
                  />
                  <Input
                    className="form-control"
                    name="numeroResidencia"
                    label="Número da casa"
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    className="form-control"
                    name="bairro"
                    label="Bairro"
                  />
                  <Select
                    className="form-control"
                    name="estado"
                    options={estados}
                    value={data.estado}
                    label="Estado *"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button
            style={{ marginTop: 13, marginLeft: 5 }}
            type="submit"
            className="btn btn-primary"
          >
            Enviar
          </button>

          {match.params.id && (
            <button
              style={{ marginTop: 13, marginLeft: 15 }}
              className="btn btn-danger"
              onClick={() => {
                history.push("/congregado");
                history.go(0);
              }}
            >
              Cancelar
            </button>
          )}
        </Form>
      </div>

      <br></br>
      <h2>Listagem de Congregados</h2>

      <div className="col-md-12">
        <div className="row">
          <div className="col-md-3">
            <br />
            <input
              className="form-control"
              type="text"
              name="filtro"
              id="filtro-input"
              placeholder="Pesquisar por Nome"
              onChange={filterNome}
            />
          </div>
        </div>

        <div className="row col-md-12">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Congregação</th>
                <th>Data de nascimento</th>
                <th>Rua</th>
                <th>Cidade</th>
                <th>Bairro</th>
                <th>N da casa</th>
                <th>Estado</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {fieis.map(congregado => {
                const dataFor = parseFromTimeZone(congregado.dataNascimento, {
                  timeZone: "America/Sao_Paulo"
                });

                const dataForamatada = formatToTimeZone(dataFor, "DD/MM/YYYY", {
                  timeZone: "Europe/Berlin"
                });

                return (
                  <tr key={congregado._id}>
                    <td>{congregado.nome}</td>
                    <td>{congregado.congregacao}</td>
                    <td>{dataForamatada}</td>
                    <td>{congregado.endereco} R$</td>
                    <td>{congregado.cidade}</td>
                    <td>{congregado.bairro}</td>
                    <td>{congregado.numeroResidencia}</td>
                    <td>{congregado.estado}</td>
                    <td>
                      <Link
                        className="linkTable"
                        to={`/congregado/${congregado._id}`}
                      >
                        <IoMdCreate />
                      </Link>

                      <Link
                        style={{ marginTop: 10 }}
                        className="linkTable"
                        to="#"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja excluir congregado(a) ${congregado.nome}`
                            )
                          )
                            removeFieu(congregado._id);
                        }}
                      >
                        <IoIosTrash />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="col-md-12">
          <div className="btnProAnt">
            <button onClick={anteriorPagina} className="btn btn-success">
              Anterior
            </button>
            <p className="footerPage">
              fieis: <strong>{fieisInfo.total}</strong>
            </p>
            <p className="footerPage">
              Número de páginas: <strong>{fieisInfo.pages}</strong>
            </p>
            <p className="footerPage">
              Página: <strong>{pagina}</strong>
            </p>
            <button onClick={proximaPagina} className="btn btn-success">
              Próximo
            </button>
          </div>
        </div>
      </div>
      <br />
    </div>
  );
}
