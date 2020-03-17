import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parseFromTimeZone, formatToTimeZone } from "date-fns-timezone";
import { Form, Input } from "unform";
import Select from "react-select";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import { IoIosTrash, IoMdCreate } from "react-icons/io";

import Sidebar from "../../components/Sidebar";

import "bootstrap/dist/css/bootstrap.min.css";

import api from "../../services/api";
import "./styles.css";

export default function Oferta({ ...props }) {
  const { history, match } = props;
  const [ofertas, setOfertas] = useState([]);
  const [fieis, setFieis] = useState([]);
  const [fieuId, setFieuId] = useState();

  const [ofertasInfo, setOfertasInfo] = useState({});
  const [pagina, setPagina] = useState(1);

  const [data, setData] = useState({}); //update
  const [error, setError] = useState(""); //update

  const [dataMin, setDataMin] = useState("");
  const [dataMax, setDataMax] = useState("");
  const [total, setTotal] = useState(false);

  async function handleSubmit(data) {
    if (!match.params.id) {
      if (!data.data || !data.valor || !fieuId) {
        toastr.error(`Preencha todos os campos obrigatórios (*)!
        `);
      } else {
        try {
          data.fieu = fieuId;
          await api.postOrPut("/ofertas", match.params.id, data);

          history.push("/oferta"); // redireciona o user
          history.go(0);
        } catch (error) {
          setError(error.response.data.error);
        }
      }
    } else {
      try {
        if (fieuId) {
          data.fieu = fieuId;
        }
        await api.postOrPut("/ofertas", match.params.id, data);

        history.push("/oferta"); // redireciona o user
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
      const response = await api.get(`/ofertas/${id}`);

      setData(response.data);
    }

    if (match.params.id) {
      loadData();
    }
  }, [match.params, match.params.id]);

  useEffect(() => {
    async function loadFieis() {
      const response = await api.get("/fieis");

      setFieis(response.data.docs);
    }

    loadFieis();
  }, [match.params, match.params.id]);

  useEffect(
    () => {
      if (match.params.id) {
        const dataFor = parseFromTimeZone(data.data, {
          timeZone: "America/Sao_Paulo"
        });

        const dataForamatada = formatToTimeZone(dataFor, "YYYY-MM-DD", {
          timeZone: "Europe/Berlin"
        });

        setData({
          ...data,
          data: dataForamatada
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.data, match.params.id]
  );

  useEffect(() => {
    async function loadofertas(page = pagina) {
      const response = await api.get(`/ofertas?page=${page}`);
      const { docs, ...ofertasResto } = response.data;
      setOfertas(docs);
      setOfertasInfo(ofertasResto);
    }

    loadofertas();
  }, [pagina]);

  function removeOferta(id) {
    api.delete(`/ofertas/${id}`);
    setTimeout(() => {
      history.go(0); // atualiza a página
    }, 1000);
  }

  async function filterNome(e) {
    if (e.target.value !== "") {
      const response = await api.get(`/ofertas?nome=${e.target.value}`);
      setOfertas(response.data.docs);
    } else {
      const response = await api.get("/ofertas");
      setOfertas(response.data.docs);
    }
  }

  function anteriorPagina() {
    if (pagina === 1) return; // if for a ultima página

    const numeroDePaginas = pagina - 1;

    setPagina(numeroDePaginas);
  }

  function proximaPagina() {
    if (pagina === ofertasInfo.pages) return; // if for a ultima página

    const numeroDePaginas = pagina + 1;

    setPagina(numeroDePaginas);
  }

  function handleSelectFiue(id) {
    setFieuId(id);
  }

  const optionsExistentsFieu = data.fieu != null && {
    id: data.fieu._id,
    nome: data.fieu.nome
  };

  async function filterData() {
    if (dataMin !== "" || dataMax !== "") {
      const response = await api.get(
        `/ofertas?data_min=${dataMin}&data_max=${dataMax}&limit_page=${ofertasInfo.total}`
      );
      const { docs, ...ofertasResto } = response.data;
      setOfertas(docs);
      setOfertasInfo(ofertasResto);
      setTotal(true);
    } else {
      const response = await api.get("/ofertas");
      const { docs, ...ofertasResto } = response.data;
      setOfertas(docs);
      setOfertasInfo(ofertasResto);
    }
  }
  function filterDataMin(e) {
    if (e.target.value !== "") {
      setDataMin(e.target.value);
    } else {
      setDataMin("");
    }
  }

  function filterDataMax(e) {
    if (e.target.value !== "") {
      setDataMax(e.target.value);
    } else {
      setDataMax("");
    }
  }

  const valorTotal = ofertas.reduce(
    (valorTotal, valor) => valorTotal + valor.valor,
    0
  );

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <Sidebar {...props} />
        </div>
      </div>

      <br />
      <h2>Cadastro de Ofertas</h2>
      <div>
        <Form className="form-group" initialData={data} onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <div className="col-md-12">
              <span>Categoria*</span>
              <Select
                className="form-group"
                options={fieis}
                placeholder={optionsExistentsFieu.nome}
                getOptionLabel={fieu => fieu.nome}
                getOptionValue={fiue => fiue._id}
                onChange={value => handleSelectFiue(value._id)}
              />
              <Input
                className="form-control"
                type="date"
                name="data"
                label="Data*"
              />
              <Input className="form-control" name="valor" label="Valor*" />
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
                history.push("/oferta");
                history.go(0);
              }}
            >
              Cancelar
            </button>
          )}
        </Form>
      </div>

      <br></br>
      <h2>Listagem de Ofertas</h2>

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

          <div className="col-md-3">
            <br />
            <input
              className="form-control"
              type="date"
              name="filtro"
              id="filtro-input"
              placeholder="Data minina"
              onChange={filterDataMin}
            />
          </div>

          <div className="col-md-3">
            <br />
            <input
              className="form-control"
              type="date"
              name="filtro"
              id="filtro-input"
              placeholder="Data maxima"
              onChange={filterDataMax}
            />
          </div>
          <div className="col-md-3">
            <br />
            <button className="btn btn-primary" onClick={filterData}>
              Pesquisar
            </button>
          </div>
          {total && (
            <div className="col-md-5">
              <br />
              <div className="total">
                <strong>
                  Quantidade: <small className="total">{ofertas.length}</small>
                </strong>
                <strong className="total">
                  Valor total: <small className="total">{valorTotal} R$</small>
                </strong>
                <button className="btn btn-light" onClick={() => history.go(0)}>
                  Atualizar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="row col-md-12">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map(dizimo => {
                const dataFor = parseFromTimeZone(dizimo.data, {
                  timeZone: "America/Sao_Paulo"
                });

                const dataForamatada = formatToTimeZone(dataFor, "DD/MM/YYYY", {
                  timeZone: "Europe/Berlin"
                });

                return (
                  <tr key={dizimo._id}>
                    <td>{dizimo.fieu.nome}</td>

                    <td>{dataForamatada}</td>
                    <td>{dizimo.valor} R$</td>
                    <td>
                      <Link className="linkTable" to={`/oferta/${dizimo._id}`}>
                        <IoMdCreate />
                      </Link>

                      <Link
                        style={{ marginTop: 10 }}
                        className="linkTable"
                        to="#"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja excluir oferta do(a) irmão(ã) ${dizimo.fieu.nome}`
                            )
                          )
                            removeOferta(dizimo._id);
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
              Ofertas: <strong>{ofertasInfo.total}</strong>
            </p>
            <p className="footerPage">
              Número de páginas: <strong>{ofertasInfo.pages}</strong>
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
