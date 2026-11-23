"use strict";

// ========================================
// ELEMENTOS
// ========================================

const $ = id => document.getElementById(id);

const loginForm = $("loginForm");
const mensagem = $("mensagem");
const telaLogin = $("telaLogin");
const dashboard = $("dashboard");
const btnTema = $("btnTema");
const btnSair = $("btnSair");

const conteudoDashboard = $("conteudoDashboard");
const conteudoModulo = $("conteudoModulo");
const telaEquipamentos = $("telaEquipamentos");
const telaColaboradores = $("telaColaboradores");
const telaEmprestimos = $("telaEmprestimos");
const telaHistorico = $("telaHistorico");
const tituloPagina = $("tituloPagina");
const nomeModulo = $("nomeModulo");

const painelFormulario = $("painelFormulario");
const formEquipamento = $("formEquipamento");
const corpoTabela = $("corpoTabelaEquipamentos");
const mensagemEquipamentos = $("mensagemEquipamentos");
const listaVazia = $("listaVazia");
const buscaEquipamento = $("buscaEquipamento");
const filtroDisponibilidade = $("filtroDisponibilidade");
const btnSalvarEquipamento = $("btnSalvarEquipamento");

const painelFormularioColaborador =
    $("painelFormularioColaborador");
const formColaborador = $("formColaborador");
const corpoTabelaColaboradores =
    $("corpoTabelaColaboradores");
const mensagemColaboradores = $("mensagemColaboradores");
const listaColaboradoresVazia =
    $("listaColaboradoresVazia");
const buscaColaborador = $("buscaColaborador");
const btnSalvarColaborador = $("btnSalvarColaborador");

const painelHistoricoColaborador =
    $("painelHistoricoColaborador");
const nomeHistoricoColaborador =
    $("nomeHistoricoColaborador");
const corpoHistoricoColaborador =
    $("corpoHistoricoColaborador");
const mensagemHistoricoColaborador =
    $("mensagemHistoricoColaborador");
const historicoColaboradorVazio =
    $("historicoColaboradorVazio");

const painelFormularioEmprestimo =
    $("painelFormularioEmprestimo");
const formEmprestimo = $("formEmprestimo");
const corpoTabelaEmprestimos =
    $("corpoTabelaEmprestimos");
const mensagemEmprestimos = $("mensagemEmprestimos");
const listaEmprestimosVazia =
    $("listaEmprestimosVazia");
const buscaEmprestimo = $("buscaEmprestimo");
const filtroEmprestimos = $("filtroEmprestimos");
const btnSalvarEmprestimo = $("btnSalvarEmprestimo");

// HISTÓRICO GERAL
const corpoTabelaHistorico = $("corpoTabelaHistorico");
const mensagemHistorico = $("mensagemHistorico");
const listaHistoricoVazia = $("listaHistoricoVazia");
const buscaHistorico = $("buscaHistorico");
const filtroHistorico = $("filtroHistorico");
const quantidadeHistorico = $("quantidadeHistorico");

let equipamentosCarregados = [];
let equipamentoEmEdicao = null;
let colaboradoresCarregados = [];
let emprestimosCarregados = [];
let historicoCarregado = [];

// ========================================
// FUNÇÕES COMPARTILHADAS
// ========================================

function mostrarMensagem(elemento, texto, erro = false) {
    elemento.textContent = texto;
    elemento.style.color = erro ? "#dc2626" : "#009f91";
}

function extrairLista(dados) {
    if (Array.isArray(dados)) return dados;

    if (dados && Array.isArray(dados.content)) {
        return dados.content;
    }

    throw new Error("Formato de resposta inválido.");
}

function formatarData(data) {
    if (!data) return "-";

    const texto = String(data);

    if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
        const [ano, mes, dia] =
            texto.substring(0, 10).split("-");

        return `${dia}/${mes}/${ano}`;
    }

    return texto;
}

function dataHojeISO() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function estaAtrasado(emprestimo) {
    if (emprestimo.dataDevolucao) return false;
    if (emprestimo.atrasado === true) return true;

    const prazo = emprestimo.dataPrevistaDevolucao;

    return Boolean(
        prazo &&
        String(prazo).substring(0, 10) < dataHojeISO()
    );
}

function situacaoEmprestimo(emprestimo) {
    if (emprestimo.dataDevolucao) return "Devolvido";
    if (estaAtrasado(emprestimo)) return "Atrasado";
    return "Em andamento";
}

function criarStatusEmprestimo(emprestimo) {
    const status = document.createElement("span");
    const situacao = situacaoEmprestimo(emprestimo);

    status.className = situacao === "Devolvido"
        ? "status status-disponivel"
        : "status status-emprestado";

    status.textContent = situacao;
    return status;
}

function criarCelula(valor) {
    const celula = document.createElement("td");
    celula.textContent = valor ?? "-";
    return celula;
}

function criarBotao(texto, acao, classe = "btn-tabela") {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = classe;
    botao.textContent = texto;
    botao.addEventListener("click", acao);
    return botao;
}

// ========================================
// RELACIONAMENTOS DOS EMPRÉSTIMOS
// ========================================

function obterIdEquipamento(emprestimo) {
    return emprestimo.equipamento?.id
        ?? emprestimo.equipamentoId
        ?? null;
}

function obterIdColaborador(emprestimo) {
    return emprestimo.colaborador?.id
        ?? emprestimo.colaboradorId
        ?? null;
}

function nomeEquipamento(id) {
    if (id == null) return "Equipamento não identificado";

    const item = equipamentosCarregados.find(
        e => String(e.id) === String(id)
    );

    return item
        ? `${item.nome} (${item.patrimonio})`
        : `Equipamento #${id}`;
}

function nomeColaborador(id) {
    if (id == null) return "Colaborador não identificado";

    const item = colaboradoresCarregados.find(
        c => String(c.id) === String(id)
    );

    return item ? item.nome : `Colaborador #${id}`;
}

function nomeEquipamentoEmprestimo(emprestimo) {
    const equipamento = emprestimo.equipamento;

    if (equipamento?.nome) {
        const patrimonio = equipamento.patrimonio
            ? ` (${equipamento.patrimonio})`
            : "";

        return equipamento.nome + patrimonio;
    }

    return nomeEquipamento(obterIdEquipamento(emprestimo));
}

function nomeColaboradorEmprestimo(emprestimo) {
    if (emprestimo.colaborador?.nome) {
        return emprestimo.colaborador.nome;
    }

    return nomeColaborador(obterIdColaborador(emprestimo));
}

// ========================================
// REQUISIÇÕES
// ========================================

async function requisicaoAPI(caminho, opcoes = {}) {
    const token = sessionStorage.getItem("token");

    if (!token) {
        throw new Error("Faça login novamente.");
    }

    const headers = {
        ...opcoes.headers,
        Authorization: "Bearer " + token
    };

    if (opcoes.body) {
        headers["Content-Type"] = "application/json";
    }

    let resposta;

    try {
        resposta = await fetch(caminho, {
            ...opcoes,
            headers
        });
    } catch (erro) {
        throw new Error(
            "Não foi possível conectar ao servidor."
        );
    }

    if (!resposta.ok) {
        let detalhe = "";

        try {
            const texto = await resposta.text();

            if (texto) {
                try {
                    const dados = JSON.parse(texto);

                    detalhe = typeof dados === "string"
                        ? dados
                        : dados.mensagem ||
                        dados.message ||
                        dados.detail ||
                        dados.error ||
                        "";

                } catch (erro) {
                    detalhe = texto;
                }
            }
        } catch (erro) {
            // Resposta sem corpo.
        }

        if (resposta.status === 401) {
            throw new Error(
                "Sessão expirada ou inválida. Faça login novamente."
            );
        }

        if (resposta.status === 403) {
            throw new Error(
                "Seu usuário não tem permissão para esta ação."
            );
        }

        throw new Error(
            detalhe || `Erro na operação: ${resposta.status}`
        );
    }

    if (resposta.status === 204) return null;

    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
}

// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const usuario = $("usuario").value;
    const senha = $("senha").value;

    mensagem.textContent = "Entrando...";
    mensagem.style.color = "#64748b";

    try {
        const resposta = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, senha })
        });

        if (!resposta.ok) {
            mensagem.textContent = "Usuário ou senha inválidos.";
            mensagem.style.color = "#dc2626";
            return;
        }

        const dados = await resposta.json();

        if (!dados.token) {
            mensagem.textContent = "Token não recebido.";
            mensagem.style.color = "#dc2626";
            return;
        }

        sessionStorage.setItem("token", dados.token);
        abrirDashboard();

    } catch (erro) {
        mensagem.textContent = "Erro ao conectar ao servidor.";
        mensagem.style.color = "#dc2626";
        console.error(erro);
    }
});

function abrirDashboard() {
    telaLogin.hidden = true;
    dashboard.hidden = false;
    document.body.classList.add("painel-aberto");
    abrirModulo("Dashboard");
}

// EXIBIR LOGIN SEMPRE AO INICIAR
sessionStorage.removeItem("token");
telaLogin.hidden = false;
dashboard.hidden = true;
document.body.classList.remove("painel-aberto");

// ========================================
// TEMA
// ========================================

btnTema.addEventListener("click", () => {
    dashboard.classList.toggle("tema-escuro");

    const escuro = dashboard.classList.contains("tema-escuro");

    btnTema.textContent = escuro
        ? "☀ Tema claro"
        : "☾ Tema escuro";

    localStorage.setItem(
        "temaElasTech",
        escuro ? "escuro" : "claro"
    );
});

if (localStorage.getItem("temaElasTech") === "escuro") {
    dashboard.classList.add("tema-escuro");
    btnTema.textContent = "☀ Tema claro";
}

// ========================================
// NAVEGAÇÃO
// ========================================

document.querySelectorAll("[data-modulo]").forEach(botao => {
    botao.addEventListener("click", () => {
        const modulo = botao.dataset.modulo;

        abrirModulo(modulo);

        if (botao.dataset.abrirFormulario === "equipamento") {
            mostrarFormulario();
        }

        if (botao.dataset.abrirFormulario === "emprestimo") {
            mostrarFormularioEmprestimo();
        }
    });
});

function abrirModulo(modulo) {
    document.querySelectorAll(".menu-item").forEach(botao => {
        botao.classList.toggle(
            "ativo",
            botao.dataset.modulo === modulo
        );
    });

    conteudoDashboard.hidden = true;
    conteudoModulo.hidden = true;
    telaEquipamentos.hidden = true;
    telaColaboradores.hidden = true;
    telaEmprestimos.hidden = true;
    telaHistorico.hidden = true;

    if (modulo === "Dashboard") {
        tituloPagina.textContent = "Painel de Controle";
        conteudoDashboard.hidden = false;
        carregarIndicadores();
        return;
    }

    tituloPagina.textContent = modulo;

    if (modulo === "Equipamentos") {
        telaEquipamentos.hidden = false;
        carregarEquipamentos();
        return;
    }

    if (modulo === "Colaboradores") {
        telaColaboradores.hidden = false;
        carregarColaboradores();
        return;
    }

    if (modulo === "Empréstimos") {
        telaEmprestimos.hidden = false;
        carregarEmprestimos();
        return;
    }

    if (modulo === "Histórico") {
        tituloPagina.textContent = "Histórico";
        telaHistorico.hidden = false;
        carregarHistoricoGeral();
        return;
    }

    nomeModulo.textContent = modulo;
    conteudoModulo.hidden = false;
}

$("btnVoltar").addEventListener("click", () => {
    abrirModulo("Dashboard");
});

// ========================================
// LOGOUT
// ========================================

btnSair.addEventListener("click", () => {
    sessionStorage.removeItem("token");

    dashboard.hidden = true;
    telaLogin.hidden = false;
    document.body.classList.remove("painel-aberto");

    loginForm.reset();
    mensagem.textContent = "";

    equipamentosCarregados = [];
    colaboradoresCarregados = [];
    emprestimosCarregados = [];
    historicoCarregado = [];

    fecharFormulario();
    fecharFormularioColaborador();
    fecharHistoricoColaborador();
    fecharFormularioEmprestimo();
});

// ========================================
// EQUIPAMENTOS
// ========================================

async function carregarEquipamentos() {
    mostrarMensagem(
        mensagemEquipamentos,
        "Carregando equipamentos..."
    );

    try {
        const dados = await requisicaoAPI("/equipamentos");
        equipamentosCarregados = extrairLista(dados);

        renderizarEquipamentos();
        mostrarMensagem(mensagemEquipamentos, "");

    } catch (erro) {
        equipamentosCarregados = [];
        renderizarEquipamentos();

        mostrarMensagem(
            mensagemEquipamentos,
            erro.message,
            true
        );
        console.error(erro);
    }
}

function renderizarEquipamentos() {
    const busca = buscaEquipamento.value.trim().toLowerCase();
    const filtro = filtroDisponibilidade.value;

    const filtrados = equipamentosCarregados.filter(e => {
        const nome = String(e.nome || "").toLowerCase();
        const patrimonio = String(e.patrimonio || "").toLowerCase();

        const correspondeBusca =
            nome.includes(busca) || patrimonio.includes(busca);

        const disponivel = e.disponivel === true;

        let correspondeStatus = true;

        if (filtro === "disponivel") {
            correspondeStatus = disponivel;
        }

        if (filtro === "emprestado") {
            correspondeStatus = !disponivel;
        }

        return correspondeBusca && correspondeStatus;
    });

    corpoTabela.replaceChildren();
    listaVazia.hidden = filtrados.length > 0;

    filtrados.forEach(e => {
        const linha = document.createElement("tr");

        const status = document.createElement("span");
        status.className = e.disponivel
            ? "status status-disponivel"
            : "status status-emprestado";

        status.textContent = e.disponivel
            ? "Disponível"
            : "Emprestado";

        const situacao = document.createElement("td");
        situacao.appendChild(status);

        const acoes = document.createElement("td");
        const grupo = document.createElement("div");
        grupo.className = "acoes-tabela";

        grupo.append(
            criarBotao("Editar", () => editarEquipamento(e.id)),
            criarBotao(
                "Excluir",
                () => excluirEquipamento(e.id),
                "btn-tabela btn-excluir"
            )
        );

        acoes.appendChild(grupo);

        linha.append(
            criarCelula(e.patrimonio),
            criarCelula(e.nome),
            criarCelula(e.tipo),
            situacao,
            acoes
        );

        corpoTabela.appendChild(linha);
    });
}

buscaEquipamento.addEventListener(
    "input",
    renderizarEquipamentos
);

filtroDisponibilidade.addEventListener(
    "change",
    renderizarEquipamentos
);

function mostrarFormulario() {
    equipamentoEmEdicao = null;
    formEquipamento.reset();

    $("equipPatrimonio").disabled = false;
    $("tituloFormulario").textContent = "Cadastrar equipamento";
    btnSalvarEquipamento.textContent = "Salvar equipamento";

    painelFormulario.hidden = false;
    painelFormulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function fecharFormulario() {
    painelFormulario.hidden = true;
    formEquipamento.reset();
    equipamentoEmEdicao = null;
}

$("btnNovoEquipamento").addEventListener(
    "click",
    mostrarFormulario
);

$("btnCancelarEquipamento").addEventListener(
    "click",
    fecharFormulario
);

$("btnAtualizarEquipamentos").addEventListener(
    "click",
    carregarEquipamentos
);

function editarEquipamento(id) {
    const e = equipamentosCarregados.find(
        item => String(item.id) === String(id)
    );

    if (!e) {
        mostrarMensagem(
            mensagemEquipamentos,
            "Equipamento não encontrado.",
            true
        );
        return;
    }

    equipamentoEmEdicao = e.id;

    $("equipPatrimonio").value = e.patrimonio || "";
    $("equipNome").value = e.nome || "";
    $("equipTipo").value = e.tipo || "";

    $("equipPatrimonio").disabled = true;
    $("tituloFormulario").textContent = "Editar equipamento";
    btnSalvarEquipamento.textContent = "Salvar alterações";

    painelFormulario.hidden = false;
    painelFormulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

formEquipamento.addEventListener("submit", async event => {
    event.preventDefault();

    const patrimonio = $("equipPatrimonio").value.trim();
    const nome = $("equipNome").value.trim();
    const tipo = $("equipTipo").value;

    if (!patrimonio || !nome || !tipo) {
        mostrarMensagem(
            mensagemEquipamentos,
            "Preencha todos os campos.",
            true
        );
        return;
    }

    const editando = equipamentoEmEdicao !== null;

    const caminho = editando
        ? `/equipamentos/${equipamentoEmEdicao}`
        : "/equipamentos";

    btnSalvarEquipamento.disabled = true;

    try {
        await requisicaoAPI(caminho, {
            method: editando ? "PUT" : "POST",
            body: JSON.stringify({ patrimonio, nome, tipo })
        });

        fecharFormulario();
        await carregarEquipamentos();
        await carregarIndicadores();

        mostrarMensagem(
            mensagemEquipamentos,
            editando
                ? "Equipamento atualizado com sucesso!"
                : "Equipamento cadastrado com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            mensagemEquipamentos,
            erro.message,
            true
        );
        console.error(erro);

    } finally {
        btnSalvarEquipamento.disabled = false;
    }
});

async function excluirEquipamento(id) {
    const e = equipamentosCarregados.find(
        item => String(item.id) === String(id)
    );

    if (!e) return;

    if (!confirm(`Deseja realmente excluir ${e.nome}?`)) {
        return;
    }

    try {
        await requisicaoAPI(`/equipamentos/${id}`, {
            method: "DELETE"
        });

        await carregarEquipamentos();
        await carregarIndicadores();

        mostrarMensagem(
            mensagemEquipamentos,
            "Equipamento excluído com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            mensagemEquipamentos,
            erro.message,
            true
        );
        console.error(erro);
    }
}

// ========================================
// COLABORADORES
// ========================================

async function carregarColaboradores() {
    mostrarMensagem(
        mensagemColaboradores,
        "Carregando colaboradores..."
    );

    try {
        const dados = await requisicaoAPI("/colaboradores");
        colaboradoresCarregados = extrairLista(dados);

        renderizarColaboradores();
        mostrarMensagem(mensagemColaboradores, "");

    } catch (erro) {
        colaboradoresCarregados = [];
        renderizarColaboradores();

        mostrarMensagem(
            mensagemColaboradores,
            erro.message,
            true
        );
        console.error(erro);
    }
}

function renderizarColaboradores() {
    const busca = buscaColaborador.value.trim().toLowerCase();

    const filtrados = colaboradoresCarregados.filter(c => {
        return (
            String(c.nome || "").toLowerCase().includes(busca) ||
            String(c.email || "").toLowerCase().includes(busca) ||
            String(c.cargo || "").toLowerCase().includes(busca)
        );
    });

    corpoTabelaColaboradores.replaceChildren();
    listaColaboradoresVazia.hidden = filtrados.length > 0;

    filtrados.forEach(c => {
        const linha = document.createElement("tr");
        const acoes = document.createElement("td");

        acoes.appendChild(
            criarBotao(
                "Ver histórico",
                () => carregarHistoricoColaborador(c)
            )
        );

        linha.append(
            criarCelula(c.id),
            criarCelula(c.nome),
            criarCelula(c.email),
            criarCelula(c.cargo || "-"),
            acoes
        );

        corpoTabelaColaboradores.appendChild(linha);
    });
}

buscaColaborador.addEventListener(
    "input",
    renderizarColaboradores
);

function mostrarFormularioColaborador() {
    formColaborador.reset();
    painelFormularioColaborador.hidden = false;

    painelFormularioColaborador.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function fecharFormularioColaborador() {
    painelFormularioColaborador.hidden = true;
    formColaborador.reset();
}

$("btnNovoColaborador").addEventListener(
    "click",
    mostrarFormularioColaborador
);

$("btnCancelarColaborador").addEventListener(
    "click",
    fecharFormularioColaborador
);

$("btnAtualizarColaboradores").addEventListener(
    "click",
    carregarColaboradores
);

formColaborador.addEventListener("submit", async event => {
    event.preventDefault();

    const nome = $("colabNome").value.trim();
    const email = $("colabEmail").value.trim();
    const cargo = $("colabCargo").value.trim();

    if (!nome || !email) {
        mostrarMensagem(
            mensagemColaboradores,
            "Preencha o nome e o e-mail.",
            true
        );
        return;
    }

    btnSalvarColaborador.disabled = true;

    try {
        await requisicaoAPI("/colaboradores", {
            method: "POST",
            body: JSON.stringify({ nome, email, cargo })
        });

        fecharFormularioColaborador();
        await carregarColaboradores();

        mostrarMensagem(
            mensagemColaboradores,
            "Colaborador cadastrado com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            mensagemColaboradores,
            erro.message,
            true
        );
        console.error(erro);

    } finally {
        btnSalvarColaborador.disabled = false;
    }
});

// ========================================
// HISTÓRICO INDIVIDUAL
// ========================================

function fecharHistoricoColaborador() {
    painelHistoricoColaborador.hidden = true;
    corpoHistoricoColaborador.replaceChildren();
    nomeHistoricoColaborador.textContent = "";
    mensagemHistoricoColaborador.textContent = "";
}

$("btnFecharHistorico").addEventListener(
    "click",
    fecharHistoricoColaborador
);

async function carregarHistoricoColaborador(colaborador) {
    painelHistoricoColaborador.hidden = false;
    nomeHistoricoColaborador.textContent = colaborador.nome;
    corpoHistoricoColaborador.replaceChildren();
    historicoColaboradorVazio.hidden = true;

    mostrarMensagem(
        mensagemHistoricoColaborador,
        "Carregando histórico..."
    );

    try {
        const dados = await requisicaoAPI(
            `/colaboradores/${colaborador.id}/emprestimos`
        );

        const emprestimos = extrairLista(dados);
        historicoColaboradorVazio.hidden =
            emprestimos.length > 0;

        emprestimos.forEach(e => {
            const linha = document.createElement("tr");
            const situacao = document.createElement("td");
            situacao.appendChild(criarStatusEmprestimo(e));

            linha.append(
                criarCelula(e.id),
                criarCelula(nomeEquipamentoEmprestimo(e)),
                criarCelula(formatarData(e.dataEmprestimo)),
                criarCelula(formatarData(e.dataPrevistaDevolucao)),
                criarCelula(formatarData(e.dataDevolucao)),
                situacao
            );

            corpoHistoricoColaborador.appendChild(linha);
        });

        mostrarMensagem(mensagemHistoricoColaborador, "");

    } catch (erro) {
        corpoHistoricoColaborador.replaceChildren();

        mostrarMensagem(
            mensagemHistoricoColaborador,
            erro.message,
            true
        );
        console.error(erro);
    }

    painelHistoricoColaborador.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ========================================
// EMPRÉSTIMOS
// ========================================

async function carregarEmprestimos() {
    mostrarMensagem(
        mensagemEmprestimos,
        "Carregando empréstimos..."
    );

    try {
        const [
            dadosEmprestimos,
            dadosEquipamentos,
            dadosColaboradores
        ] = await Promise.all([
            requisicaoAPI("/emprestimos"),
            requisicaoAPI("/equipamentos"),
            requisicaoAPI("/colaboradores")
        ]);

        emprestimosCarregados = extrairLista(dadosEmprestimos);
        equipamentosCarregados = extrairLista(dadosEquipamentos);
        colaboradoresCarregados = extrairLista(dadosColaboradores);

        renderizarEmprestimos();
        mostrarMensagem(mensagemEmprestimos, "");

    } catch (erro) {
        emprestimosCarregados = [];
        renderizarEmprestimos();

        mostrarMensagem(
            mensagemEmprestimos,
            erro.message,
            true
        );
        console.error(erro);
    }
}

function renderizarEmprestimos() {
    const busca = buscaEmprestimo.value.trim().toLowerCase();
    const filtro = filtroEmprestimos.value;

    const filtrados = emprestimosCarregados.filter(e => {
        const situacao = situacaoEmprestimo(e);

        const correspondeFiltro =
            filtro === "todos" ||
            (filtro === "ativos" && !e.dataDevolucao) ||
            (filtro === "atrasados" && situacao === "Atrasado") ||
            (filtro === "devolvidos" && situacao === "Devolvido");

        const correspondeBusca =
            nomeEquipamentoEmprestimo(e)
                .toLowerCase().includes(busca) ||
            nomeColaboradorEmprestimo(e)
                .toLowerCase().includes(busca) ||
            String(e.id).includes(busca);

        return correspondeFiltro && correspondeBusca;
    });

    corpoTabelaEmprestimos.replaceChildren();
    listaEmprestimosVazia.hidden = filtrados.length > 0;

    filtrados.forEach(e => {
        const linha = document.createElement("tr");

        const situacao = document.createElement("td");
        situacao.appendChild(criarStatusEmprestimo(e));

        const acoes = document.createElement("td");

        if (!e.dataDevolucao) {
            acoes.appendChild(
                criarBotao(
                    "Devolver",
                    () => devolverEmprestimo(e.id)
                )
            );
        } else {
            acoes.textContent = "Concluído";
        }

        linha.append(
            criarCelula(e.id),
            criarCelula(nomeEquipamentoEmprestimo(e)),
            criarCelula(nomeColaboradorEmprestimo(e)),
            criarCelula(formatarData(e.dataEmprestimo)),
            criarCelula(formatarData(e.dataPrevistaDevolucao)),
            criarCelula(formatarData(e.dataDevolucao)),
            situacao,
            acoes
        );

        corpoTabelaEmprestimos.appendChild(linha);
    });
}

buscaEmprestimo.addEventListener(
    "input",
    renderizarEmprestimos
);

filtroEmprestimos.addEventListener(
    "change",
    renderizarEmprestimos
);

// ========================================
// FORMULÁRIO DE EMPRÉSTIMO
// ========================================

async function mostrarFormularioEmprestimo() {
    formEmprestimo.reset();
    painelFormularioEmprestimo.hidden = false;

    const selectEquipamento = $("emprestimoEquipamento");
    const selectColaborador = $("emprestimoColaborador");

    selectEquipamento.replaceChildren(
        new Option("Carregando equipamentos...", "")
    );

    selectColaborador.replaceChildren(
        new Option("Carregando colaboradores...", "")
    );

    selectEquipamento.disabled = true;
    selectColaborador.disabled = true;
    btnSalvarEmprestimo.disabled = true;

    painelFormularioEmprestimo.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const [dadosEquipamentos, dadosColaboradores] =
            await Promise.all([
                requisicaoAPI("/equipamentos"),
                requisicaoAPI("/colaboradores")
            ]);

        equipamentosCarregados = extrairLista(dadosEquipamentos);
        colaboradoresCarregados = extrairLista(dadosColaboradores);

        const disponiveis = equipamentosCarregados.filter(
            e => e.disponivel === true
        );

        selectEquipamento.replaceChildren(
            new Option("Selecione um equipamento", "")
        );

        disponiveis.forEach(e => {
            selectEquipamento.add(
                new Option(
                    `${e.nome} - ${e.patrimonio}`,
                    String(e.id)
                )
            );
        });

        selectColaborador.replaceChildren(
            new Option("Selecione um colaborador", "")
        );

        colaboradoresCarregados.forEach(c => {
            selectColaborador.add(
                new Option(c.nome, String(c.id))
            );
        });

        selectEquipamento.disabled = false;
        selectColaborador.disabled = false;
        btnSalvarEmprestimo.disabled = false;

        if (disponiveis.length === 0) {
            mostrarMensagem(
                mensagemEmprestimos,
                "Não existem equipamentos disponíveis.",
                true
            );
            btnSalvarEmprestimo.disabled = true;

        } else if (colaboradoresCarregados.length === 0) {
            mostrarMensagem(
                mensagemEmprestimos,
                "Cadastre um colaborador antes de emprestar.",
                true
            );
            btnSalvarEmprestimo.disabled = true;

        } else {
            mostrarMensagem(mensagemEmprestimos, "");
        }

    } catch (erro) {
        selectEquipamento.replaceChildren(
            new Option("Não foi possível carregar", "")
        );

        selectColaborador.replaceChildren(
            new Option("Não foi possível carregar", "")
        );

        mostrarMensagem(
            mensagemEmprestimos,
            erro.message,
            true
        );
        console.error(erro);
    }
}

function fecharFormularioEmprestimo() {
    painelFormularioEmprestimo.hidden = true;
    formEmprestimo.reset();
}

$("btnNovoEmprestimo").addEventListener(
    "click",
    mostrarFormularioEmprestimo
);

$("btnCancelarEmprestimo").addEventListener(
    "click",
    fecharFormularioEmprestimo
);

$("btnAtualizarEmprestimos").addEventListener(
    "click",
    carregarEmprestimos
);

// ========================================
// REGISTRAR EMPRÉSTIMO
// ========================================

formEmprestimo.addEventListener("submit", async event => {
    event.preventDefault();

    const equipamentoId = $("emprestimoEquipamento").value;
    const colaboradorId = $("emprestimoColaborador").value;

    if (!equipamentoId || !colaboradorId) {
        mostrarMensagem(
            mensagemEmprestimos,
            "Selecione o equipamento e o colaborador.",
            true
        );
        return;
    }

    btnSalvarEmprestimo.disabled = true;

    try {
        const caminho =
            "/emprestimos?equipamentoId=" +
            encodeURIComponent(equipamentoId) +
            "&colaboradorId=" +
            encodeURIComponent(colaboradorId);

        await requisicaoAPI(caminho, {
            method: "POST"
        });

        fecharFormularioEmprestimo();
        await carregarEmprestimos();
        await carregarIndicadores();

        mostrarMensagem(
            mensagemEmprestimos,
            "Empréstimo registrado com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            mensagemEmprestimos,
            erro.message,
            true
        );
        console.error(erro);

    } finally {
        btnSalvarEmprestimo.disabled = false;
    }
});

// ========================================
// DEVOLUÇÃO
// ========================================

async function devolverEmprestimo(id) {
    const emprestimo = emprestimosCarregados.find(
        e => String(e.id) === String(id)
    );

    if (!emprestimo || emprestimo.dataDevolucao) return;

    const equipamento = nomeEquipamentoEmprestimo(emprestimo);

    if (!confirm(`Confirmar a devolução de ${equipamento}?`)) {
        return;
    }

    try {
        await requisicaoAPI(
            `/emprestimos/${id}/devolucao`,
            { method: "PUT" }
        );

        await carregarEmprestimos();
        await carregarIndicadores();

        mostrarMensagem(
            mensagemEmprestimos,
            "Devolução registrada com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            mensagemEmprestimos,
            erro.message,
            true
        );
        console.error(erro);
    }
}

// ========================================
// HISTÓRICO GERAL - NOVO
// ========================================

async function carregarHistoricoGeral() {
    mostrarMensagem(
        mensagemHistorico,
        "Carregando histórico..."
    );

    quantidadeHistorico.textContent = "";
    corpoTabelaHistorico.replaceChildren();
    listaHistoricoVazia.hidden = true;

    try {
        const [
            dadosEmprestimos,
            dadosEquipamentos,
            dadosColaboradores
        ] = await Promise.all([
            requisicaoAPI("/emprestimos"),
            requisicaoAPI("/equipamentos"),
            requisicaoAPI("/colaboradores")
        ]);

        historicoCarregado = extrairLista(dadosEmprestimos);
        equipamentosCarregados = extrairLista(dadosEquipamentos);
        colaboradoresCarregados = extrairLista(dadosColaboradores);

        // Mais recentes primeiro.
        historicoCarregado.sort((a, b) => {
            const dataA = String(a.dataEmprestimo || "");
            const dataB = String(b.dataEmprestimo || "");

            const comparacao = dataB.localeCompare(dataA);

            if (comparacao !== 0) {
                return comparacao;
            }

            return Number(b.id || 0) - Number(a.id || 0);
        });

        renderizarHistoricoGeral();
        mostrarMensagem(mensagemHistorico, "");

    } catch (erro) {
        historicoCarregado = [];
        quantidadeHistorico.textContent = "";

        mostrarMensagem(
            mensagemHistorico,
            erro.message,
            true
        );

        console.error(erro);
    }
}

function renderizarHistoricoGeral() {
    const busca = buscaHistorico.value.trim().toLowerCase();
    const filtro = filtroHistorico.value;

    const filtrados = historicoCarregado.filter(e => {
        const situacao = situacaoEmprestimo(e);

        let correspondeFiltro = true;

        if (filtro === "ativos") {
            correspondeFiltro = !e.dataDevolucao;
        }

        if (filtro === "atrasados") {
            correspondeFiltro = situacao === "Atrasado";
        }

        if (filtro === "devolvidos") {
            correspondeFiltro = situacao === "Devolvido";
        }

        const correspondeBusca =
            nomeEquipamentoEmprestimo(e)
                .toLowerCase().includes(busca) ||
            nomeColaboradorEmprestimo(e)
                .toLowerCase().includes(busca) ||
            String(e.id).includes(busca);

        return correspondeFiltro && correspondeBusca;
    });

    corpoTabelaHistorico.replaceChildren();
    listaHistoricoVazia.hidden = filtrados.length > 0;

    quantidadeHistorico.textContent =
        `${filtrados.length} registro(s) encontrado(s)`;

    filtrados.forEach(e => {
        const linha = document.createElement("tr");

        const situacao = document.createElement("td");
        situacao.appendChild(criarStatusEmprestimo(e));

        linha.append(
            criarCelula(e.id),
            criarCelula(nomeEquipamentoEmprestimo(e)),
            criarCelula(nomeColaboradorEmprestimo(e)),
            criarCelula(formatarData(e.dataEmprestimo)),
            criarCelula(formatarData(e.dataPrevistaDevolucao)),
            criarCelula(formatarData(e.dataDevolucao)),
            situacao
        );

        corpoTabelaHistorico.appendChild(linha);
    });
}

buscaHistorico.addEventListener(
    "input",
    renderizarHistoricoGeral
);

filtroHistorico.addEventListener(
    "change",
    renderizarHistoricoGeral
);

$("btnAtualizarHistorico").addEventListener(
    "click",
    carregarHistoricoGeral
);

// ========================================
// INDICADORES DO DASHBOARD
// ========================================

async function carregarIndicadores() {
    if (!sessionStorage.getItem("token")) return;

    try {
        const [dadosEquipamentos, dadosAtrasados] =
            await Promise.all([
                requisicaoAPI("/equipamentos"),
                requisicaoAPI("/emprestimos?atrasados=true")
            ]);

        const equipamentos = extrairLista(dadosEquipamentos);
        const atrasados = extrairLista(dadosAtrasados);

        const total =
            typeof dadosEquipamentos?.totalElements === "number"
                ? dadosEquipamentos.totalElements
                : equipamentos.length;

        $("totalEquipamentos").textContent = total;

        if (
            Array.isArray(dadosEquipamentos) ||
            total === equipamentos.length
        ) {
            $("totalDisponiveis").textContent =
                equipamentos.filter(
                    e => e.disponivel === true
                ).length;

            $("totalEmprestados").textContent =
                equipamentos.filter(
                    e => e.disponivel === false
                ).length;
        } else {
            $("totalDisponiveis").textContent = "--";
            $("totalEmprestados").textContent = "--";
        }

        $("totalAtrasados").textContent =
            typeof dadosAtrasados?.totalElements === "number"
                ? dadosAtrasados.totalElements
                : atrasados.length;

    } catch (erro) {
        console.error(
            "Erro ao carregar indicadores:",
            erro
        );
    }
}