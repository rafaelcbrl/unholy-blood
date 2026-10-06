/* ============================================================
   UNHOLY BLOOD
   PAINEL ADMINISTRATIVO
   JAVASCRIPT PRINCIPAL
   ============================================================ */


/* ============================================================
   1. CONFIGURAÇÕES DA API
   ============================================================ */


/*
 * Todas as informações do painel administrativo agora passam
 * pelo Back-End.
 *
 * Não utilizamos mais localStorage para categorias ou itens.
 *
 * O fluxo passa a ser:
 *
 * ADMIN
 *   ↓
 * API
 *   ↓
 * SERVER.JS
 *   ↓
 * DATABASE.JSON
 */


const API_CATEGORIAS =
    "/api/categorias";


const API_ITENS =
    "/api/itens";


const API_JOGADORES =
    "/api/jogadores";


/* ============================================================
   2. ELEMENTOS PRINCIPAIS
   ============================================================ */


const botaoCriarCategoria =
    document.getElementById(
        "botao-criar-categoria"
    );


const botaoCadastrarItem =
    document.getElementById(
        "botao-cadastrar-item"
    );


const mensagemAdmin =
    document.getElementById(
        "mensagem-admin"
    );


const areaCadastro =
    document.getElementById(
        "area-cadastro-admin"
    );


const listaCategorias =
    document.getElementById(
        "lista-categorias-admin"
    );


const listaItens =
    document.getElementById(
        "lista-itens-admin"
    );


const contadorCategorias =
    document.getElementById(
        "contador-categorias-admin"
    );


const contadorItens =
    document.getElementById(
        "contador-itens-admin"
    );


const estadoVazioCategorias =
    document.getElementById(
        "estado-vazio-categorias"
    );


const estadoVazioItens =
    document.getElementById(
        "estado-vazio-itens"
    );


/* ============================================================
   3. ESTADO
   ============================================================ */


let modoFormulario =
    null;


let idEdicao =
    null;


/*
 * Os dados abaixo são apenas dados em memória.
 *
 * Eles NÃO são o banco.
 *
 * Servem para que a interface consiga trabalhar com os dados
 * recebidos da API enquanto a página está aberta.
 */


let categorias =
    [];


let itens =
    [];


let jogadores =
    [];


/* ============================================================
   4. INICIALIZAÇÃO
   ============================================================ */


document.addEventListener(
    "DOMContentLoaded",
    iniciarAdmin
);


async function iniciarAdmin() {

    configurarEventos();

    await carregarDados();

}


/* ============================================================
   5. CARREGAR DADOS DA API
   ============================================================ */


/*
 * Carrega todas as informações necessárias para o painel.
 *
 * Categorias:
 *     GET /api/categorias
 *
 * Itens:
 *     GET /api/itens
 *
 * Jogadores:
 *     GET /api/jogadores
 */


async function carregarDados() {

    try {

        mostrarMensagem(
            "Carregando dados do arquivo...",
            "info"
        );


        await Promise.all(
            [
                carregarCategorias(),
                carregarItens(),
                carregarJogadores()
            ]
        );


        renderizarTudo();

        esconderMensagem();

    }

    catch (erro) {

        console.error(
            "Erro ao carregar dados do painel:",
            erro
        );


        renderizarTudo();


        mostrarMensagem(
            erro.message ||
            "Não foi possível carregar os dados do arquivo.",
            "erro"
        );

    }

}


/* ============================================================
   6. REQUISIÇÃO GENÉRICA
   ============================================================ */


/*
 * Centralizamos o tratamento das respostas da API.
 *
 * Isso evita repetir a mesma lógica em todos os lugares.
 */


async function requisicaoAPI(
    url,
    opcoes = {}
) {

    let resposta;


    try {

        resposta =
            await fetch(
                url,
                {
                    ...opcoes,

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(opcoes.headers || {})
                    }
                }
            );

    }

    catch (erro) {

        console.error(
            "Erro de conexão com a API:",
            erro
        );


        throw new Error(
            "Não foi possível conectar ao servidor."
        );

    }


    let dados =
        null;


    try {

        dados =
            await resposta.json();

    }

    catch (erro) {

        dados =
            null;

    }


    if (!resposta.ok) {

        const mensagem =
            dados?.mensagem ||
            dados?.erro ||
            `O servidor retornou o erro ${resposta.status}.`;


        throw new Error(
            mensagem
        );

    }


    return dados;

}


/* ============================================================
   7. CATEGORIAS — GET
   ============================================================ */


async function carregarCategorias() {

    const resposta =
        await requisicaoAPI(
            API_CATEGORIAS
        );


    if (
        Array.isArray(
            resposta
        )
    ) {

        categorias =
            resposta;

        return;

    }


    if (
        Array.isArray(
            resposta?.categorias
        )
    ) {

        categorias =
            resposta.categorias;

        return;

    }


    if (
        Array.isArray(
            resposta?.dados
        )
    ) {

        categorias =
            resposta.dados;

        return;

    }


    categorias =
        [];

}


/* ============================================================
   8. ITENS — GET
   ============================================================ */


async function carregarItens() {

    const resposta =
        await requisicaoAPI(
            API_ITENS
        );


    if (
        Array.isArray(
            resposta
        )
    ) {

        itens =
            resposta;

        return;

    }


    if (
        Array.isArray(
            resposta?.itens
        )
    ) {

        itens =
            resposta.itens;

        return;

    }


    if (
        Array.isArray(
            resposta?.dados
        )
    ) {

        itens =
            resposta.dados;

        return;

    }


    itens =
        [];

}


/* ============================================================
   9. JOGADORES — GET
   ============================================================ */


async function carregarJogadores() {

    try {

        const resposta =
            await requisicaoAPI(
                API_JOGADORES
            );


        if (
            Array.isArray(
                resposta
            )
        ) {

            jogadores =
                resposta;

            return;

        }


        if (
            Array.isArray(
                resposta?.jogadores
            )
        ) {

            jogadores =
                resposta.jogadores;

            return;

        }


        if (
            Array.isArray(
                resposta?.dados
            )
        ) {

            jogadores =
                resposta.dados;

            return;

        }


        jogadores =
            [];

    }

    catch (erro) {

        /*
         * O painel consegue funcionar mesmo se ainda não
         * houver jogadores cadastrados.
         */

        console.warn(
            "Não foi possível carregar jogadores:",
            erro
        );


        jogadores =
            [];

    }

}


/* ============================================================
   10. EVENTOS
   ============================================================ */


function configurarEventos() {

    if (
        botaoCriarCategoria
    ) {

        botaoCriarCategoria.addEventListener(
            "click",
            function () {

                abrirFormularioCategoria();

            }
        );

    }


    if (
        botaoCadastrarItem
    ) {

        botaoCadastrarItem.addEventListener(
            "click",
            function () {

                abrirFormularioItem();

            }
        );

    }

}


/* ============================================================
   11. DATA / HORA
   ============================================================ */


function obterDataAtual() {

    return new Date().toISOString();

}


function formatarData(
    data
) {

    if (!data) {

        return "Data desconhecida";

    }


    const objetoData =
        new Date(
            data
        );


    if (
        Number.isNaN(
            objetoData.getTime()
        )
    ) {

        return "Data desconhecida";

    }


    return objetoData.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ============================================================
   12. ESCAPE HTML
   ============================================================ */


function escaparHTML(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   13. NORMALIZAÇÃO DE TEXTO
   ============================================================ */


function normalizarTexto(
    valor
) {

    return String(
        valor || ""
    )
        .trim()
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* ============================================================
   14. MENSAGENS
   ============================================================ */


let temporizadorMensagem =
    null;


function mostrarMensagem(
    texto,
    tipo = "sucesso"
) {

    if (
        !mensagemAdmin
    ) {

        return;

    }


    clearTimeout(
        temporizadorMensagem
    );


    mensagemAdmin.textContent =
        texto;


    mensagemAdmin.className =
        "mensagem-admin " +
        tipo +
        " visivel";


    temporizadorMensagem =
        setTimeout(
            function () {

                esconderMensagem();

            },
            4500
        );

}


function esconderMensagem() {

    if (
        !mensagemAdmin
    ) {

        return;

    }


    mensagemAdmin.classList.remove(
        "visivel"
    );

}


/* ============================================================
   15. ABRIR FORMULÁRIO DE CATEGORIA
   ============================================================ */


function abrirFormularioCategoria(
    categoria = null
) {

    modoFormulario =
        categoria
            ? "editar-categoria"
            : "categoria";


    idEdicao =
        categoria
            ? categoria.id
            : null;


    removerEstadoAtivoBotoes();


    botaoCriarCategoria
        ?.classList.add(
            "ativo"
        );


    if (!areaCadastro) {

        return;

    }


    areaCadastro.innerHTML =
        criarFormularioCategoria(
            categoria
        );


    configurarFormularioCategoria();


    areaCadastro.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );

}


/* ============================================================
   16. FORMULÁRIO DE CATEGORIA
   ============================================================ */


function criarFormularioCategoria(
    categoria = null
) {

    const editando =
        Boolean(
            categoria
        );


    const titulo =
        editando
            ? "Editar Categoria"
            : "Criar Categoria";


    const descricao =
        editando
            ? "Atualize as informações desta categoria."
            : "Crie uma nova divisão para organizar o arquivo.";


    return `

        <form
            class="formulario-admin"
            id="formulario-categoria"
        >

            <div class="cabecalho-formulario">

                <div>

                    <span class="etiqueta-admin">
                        ${
                            editando
                                ? "EDIÇÃO"
                                : "NOVA CATEGORIA"
                        }
                    </span>

                    <h3>
                        ${titulo}
                    </h3>

                    <p>
                        ${descricao}
                    </p>

                </div>


                <button
                    type="button"
                    class="botao-fechar-formulario"
                    id="fechar-formulario"
                    aria-label="Fechar formulário"
                >
                    ×
                </button>

            </div>


            <div class="grid-formulario">

                <div class="campo-admin largo">

                    <label for="categoria-nome">
                        Nome da categoria
                        <span>*</span>
                    </label>

                    <input
                        type="text"
                        id="categoria-nome"
                        name="nome"
                        placeholder="Ex.: Espadas, Armaduras, Pokémon..."
                        value="${escaparHTML(
                            categoria?.nome || ""
                        )}"
                        maxlength="80"
                        required
                    >

                </div>


                <div class="campo-admin largo">

                    <label for="categoria-descricao">
                        Descrição
                    </label>

                    <textarea
                        id="categoria-descricao"
                        name="descricao"
                        placeholder="Descreva brevemente o que pertence a esta categoria..."
                        maxlength="500"
                    >${escaparHTML(
                        categoria?.descricao || ""
                    )}</textarea>

                </div>


                <div class="campo-admin largo">

                    <label for="categoria-imagem">
                        Imagem da categoria
                    </label>

                    <input
                        type="text"
                        id="categoria-imagem"
                        name="imagem"
                        placeholder="URL ou caminho da imagem"
                        value="${escaparHTML(
                            categoria?.imagem || ""
                        )}"
                    >

                    <span class="campo-ajuda-admin">
                        Você pode usar uma URL ou um caminho relativo,
                        como ../../Imagens/categorias/espadas.png
                    </span>

                </div>


                <div class="campo-admin largo">

                    <div
                        class="preview-imagem-admin"
                        id="preview-categoria"
                    >

                        <span>
                            Prévia da imagem
                        </span>

                        <img
                            id="preview-categoria-img"
                            alt="Prévia da categoria"
                        >

                    </div>

                </div>

            </div>


            <div class="acoes-formulario">

                <button
                    type="button"
                    class="botao-formulario"
                    id="cancelar-formulario"
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    class="botao-formulario principal"
                >
                    ${
                        editando
                            ? "Salvar Alterações"
                            : "Criar Categoria"
                    }
                </button>

            </div>

        </form>

    `;

}


/* ============================================================
   17. CONFIGURAR FORMULÁRIO DE CATEGORIA
   ============================================================ */


function configurarFormularioCategoria() {

    const formulario =
        document.getElementById(
            "formulario-categoria"
        );


    const botaoFechar =
        document.getElementById(
            "fechar-formulario"
        );


    const botaoCancelar =
        document.getElementById(
            "cancelar-formulario"
        );


    const campoImagem =
        document.getElementById(
            "categoria-imagem"
        );


    if (!formulario) {

        return;

    }


    formulario.addEventListener(
        "submit",
        salvarCategoria
    );


    botaoFechar?.addEventListener(
        "click",
        fecharFormulario
    );


    botaoCancelar?.addEventListener(
        "click",
        fecharFormulario
    );


    campoImagem?.addEventListener(
        "input",
        function () {

            atualizarPreviewImagem(
                campoImagem.value,
                "preview-categoria",
                "preview-categoria-img"
            );

        }
    );


    if (
        campoImagem?.value
    ) {

        atualizarPreviewImagem(
            campoImagem.value,
            "preview-categoria",
            "preview-categoria-img"
        );

    }

}


/* ============================================================
   18. SALVAR CATEGORIA
   ============================================================ */


async function salvarCategoria(
    evento
) {

    evento.preventDefault();


    const formulario =
        evento.currentTarget;


    const campoNome =
        formulario.querySelector(
            "#categoria-nome"
        );


    const campoDescricao =
        formulario.querySelector(
            "#categoria-descricao"
        );


    const campoImagem =
        formulario.querySelector(
            "#categoria-imagem"
        );


    const nome =
        campoNome.value.trim();


    const descricao =
        campoDescricao.value.trim();


    const imagem =
        campoImagem.value.trim();


    if (!nome) {

        mostrarMensagem(
            "Informe o nome da categoria.",
            "erro"
        );


        campoNome.focus();

        return;

    }


    /*
     * A API já possui validação contra categorias duplicadas.
     *
     * Mesmo assim fazemos uma verificação local para evitar
     * uma requisição desnecessária.
     */


    const nomeNormalizado =
        normalizarTexto(
            nome
        );


    const categoriaDuplicada =
        categorias.find(
            function (
                categoria
            ) {

                return (
                    normalizarTexto(
                        categoria.nome
                    ) === nomeNormalizado &&
                    categoria.id !== idEdicao
                );

            }
        );


    if (
        categoriaDuplicada
    ) {

        mostrarMensagem(
            "Já existe uma categoria com esse nome.",
            "erro"
        );


        campoNome.focus();

        return;

    }


    const dados =
        {
            nome:
                nome,

            descricao:
                descricao,

            imagem:
                imagem
        };


    try {

        let resposta;


        if (
            modoFormulario ===
            "editar-categoria"
        ) {

            resposta =
                await requisicaoAPI(
                    `${API_CATEGORIAS}/${encodeURIComponent(idEdicao)}`,
                    {
                        method:
                            "PUT",

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );


            mostrarMensagem(
                resposta?.mensagem ||
                "Categoria atualizada com sucesso.",
                "sucesso"
            );

        }

        else {

            resposta =
                await requisicaoAPI(
                    API_CATEGORIAS,
                    {
                        method:
                            "POST",

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );


            mostrarMensagem(
                resposta?.mensagem ||
                "Categoria criada com sucesso.",
                "sucesso"
            );

        }


        await carregarCategorias();

        await carregarItens();

        renderizarTudo();

        fecharFormulario(
            false
        );

    }

    catch (erro) {

        console.error(
            "Erro ao salvar categoria:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível salvar a categoria.",
            "erro"
        );

    }

}


/* ============================================================
   19. ABRIR FORMULÁRIO DE ITEM
   ============================================================ */


function abrirFormularioItem(
    item = null
) {

    if (
        categorias.length === 0 &&
        !item
    ) {

        mostrarMensagem(
            "Crie uma categoria antes de cadastrar um item.",
            "erro"
        );


        abrirFormularioCategoria();

        return;

    }


    modoFormulario =
        item
            ? "editar-item"
            : "item";


    idEdicao =
        item
            ? item.id
            : null;


    removerEstadoAtivoBotoes();


    botaoCadastrarItem
        ?.classList.add(
            "ativo"
        );


    if (!areaCadastro) {

        return;

    }


    areaCadastro.innerHTML =
        criarFormularioItem(
            item
        );


    configurarFormularioItem();


    areaCadastro.scrollIntoView(
        {
            behavior: "smooth",
            block: "start"
        }
    );

}


/* ============================================================
   20. FORMULÁRIO DE ITEM
   ============================================================ */


function criarFormularioItem(
    item = null
) {

    const editando =
        Boolean(
            item
        );


    const titulo =
        editando
            ? "Editar Item"
            : "Cadastrar Item";


    const descricao =
        editando
            ? "Atualize as informações deste registro."
            : "Adicione um novo registro ao arquivo da guilda.";


    const opcoesCategorias =
        categorias
            .map(
                function (
                    categoria
                ) {

                    const selecionada =
                        item?.categoriaId ===
                        categoria.id
                            ? "selected"
                            : "";


                    return `

                        <option
                            value="${escaparHTML(
                                categoria.id
                            )}"
                            ${selecionada}
                        >
                            ${escaparHTML(
                                categoria.nome
                            )}
                        </option>

                    `;

                }
            )
            .join("");


    const statusArmazem =
        !item ||
        item.status === "armazem" ||
        item.status === "No Armazém"
            ? "selected"
            : "";


    const statusJogador =
        item &&
        (
            item.status === "jogador" ||
            item.status === "Em posse de jogador"
        )
            ? "selected"
            : "";


    const jogadorAtual =
        item?.dono ||
        item?.jogador?.nome ||
        "";


    return `

        <form
            class="formulario-admin"
            id="formulario-item"
        >

            <div class="cabecalho-formulario">

                <div>

                    <span class="etiqueta-admin">
                        ${
                            editando
                                ? "EDIÇÃO"
                                : "NOVO REGISTRO"
                        }
                    </span>

                    <h3>
                        ${titulo}
                    </h3>

                    <p>
                        ${descricao}
                    </p>

                </div>


                <button
                    type="button"
                    class="botao-fechar-formulario"
                    id="fechar-formulario"
                    aria-label="Fechar formulário"
                >
                    ×
                </button>

            </div>


            <div class="grid-formulario">


                <!-- ============================================
                     CATEGORIA
                     ============================================ -->

                <div class="campo-admin">

                    <label for="item-categoria">

                        Categoria

                        <span>*</span>

                    </label>


                    <select
                        id="item-categoria"
                        name="categoriaId"
                        required
                    >

                        <option value="">
                            Selecione uma categoria
                        </option>

                        ${opcoesCategorias}

                    </select>

                </div>


                <!-- ============================================
                     NOME
                     ============================================ -->

                <div class="campo-admin">

                    <label for="item-nome">

                        Nome do item

                        <span>*</span>

                    </label>


                    <input
                        type="text"
                        id="item-nome"
                        name="nome"
                        placeholder="Ex.: Espada do Abismo"
                        value="${escaparHTML(
                            item?.nome || ""
                        )}"
                        maxlength="120"
                        required
                    >

                </div>


                <!-- ============================================
                     RARIDADE
                     ============================================ -->

                <div class="campo-admin">

                    <label for="item-raridade">

                        Raridade

                    </label>


                    <select
                        id="item-raridade"
                        name="raridade"
                    >

                        <option value="">
                            Não definida
                        </option>

                        <option
                            value="Comum"
                            ${
                                item?.raridade ===
                                "Comum"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Comum
                        </option>

                        <option
                            value="Incomum"
                            ${
                                item?.raridade ===
                                "Incomum"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Incomum
                        </option>

                        <option
                            value="Raro"
                            ${
                                item?.raridade ===
                                "Raro"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Raro
                        </option>

                        <option
                            value="Épico"
                            ${
                                item?.raridade ===
                                "Épico"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Épico
                        </option>

                        <option
                            value="Lendário"
                            ${
                                item?.raridade ===
                                "Lendário"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Lendário
                        </option>

                        <option
                            value="Mítico"
                            ${
                                item?.raridade ===
                                "Mítico"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Mítico
                        </option>

                        <option
                            value="Relíquia"
                            ${
                                item?.raridade ===
                                "Relíquia"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Relíquia
                        </option>

                    </select>

                </div>


                <!-- ============================================
                     TEMPORADA
                     ============================================ -->

                <div class="campo-admin">

                    <label for="item-temporada">

                        Temporada

                    </label>


                    <input
                        type="text"
                        id="item-temporada"
                        name="temporada"
                        placeholder="Ex.: Temporada 1"
                        value="${escaparHTML(
                            item?.temporada || ""
                        )}"
                        maxlength="60"
                    >

                </div>


                <!-- ============================================
                     AQUISIÇÃO
                     ============================================ -->

                <div class="campo-admin largo">

                    <label for="item-aquisicao">

                        Forma de aquisição

                    </label>


                    <input
                        type="text"
                        id="item-aquisicao"
                        name="aquisicao"
                        placeholder="Ex.: Evento, recompensa, craft, troca..."
                        value="${escaparHTML(
                            item?.aquisicao || ""
                        )}"
                        maxlength="160"
                    >

                </div>


                <!-- ============================================
                     STATUS
                     ============================================ -->

                <div class="campo-admin">

                    <label for="item-status">

                        Status

                    </label>


                    <select
                        id="item-status"
                        name="status"
                    >

                        <option
                            value="armazem"
                            ${statusArmazem}
                        >
                            No Armazém
                        </option>


                        <option
                            value="jogador"
                            ${statusJogador}
                        >
                            Em posse de jogador
                        </option>

                    </select>

                </div>


                <!-- ============================================
                     JOGADOR
                     ============================================ -->

                <div
                    class="campo-admin"
                    id="campo-jogador"
                >

                    <label for="item-jogador">

                        Jogador responsável

                    </label>


                    <input
                        type="text"
                        id="item-jogador"
                        name="dono"
                        placeholder="Nome do jogador"
                        value="${escaparHTML(
                            jogadorAtual
                        )}"
                        maxlength="80"
                    >


                    <span class="campo-ajuda-admin">

                        Preencha somente quando o item
                        estiver em posse de um jogador.

                    </span>

                </div>


                <!-- ============================================
                     IMAGEM
                     ============================================ -->

                <div class="campo-admin largo">

                    <label for="item-imagem">

                        Imagem do item

                    </label>


                    <input
                        type="text"
                        id="item-imagem"
                        name="imagem"
                        placeholder="URL ou caminho da imagem"
                        value="${escaparHTML(
                            item?.imagem || ""
                        )}"
                    >


                    <span class="campo-ajuda-admin">

                        Exemplo:
                        ../../Imagens/itens/espada.png

                    </span>

                </div>


                <!-- ============================================
                     PRÉVIA
                     ============================================ -->

                <div class="campo-admin largo">

                    <div
                        class="preview-imagem-admin"
                        id="preview-item"
                    >

                        <span>
                            Prévia da imagem
                        </span>


                        <img
                            id="preview-item-img"
                            alt="Prévia do item"
                        >

                    </div>

                </div>


                <!-- ============================================
                     DESCRIÇÃO
                     ============================================ -->

                <div class="campo-admin largo">

                    <label for="item-descricao">

                        Descrição

                    </label>


                    <textarea
                        id="item-descricao"
                        name="descricao"
                        placeholder="Conte a história ou características deste item..."
                        maxlength="1200"
                    >${escaparHTML(
                        item?.descricao || ""
                    )}</textarea>

                </div>


            </div>


            <div class="acoes-formulario">

                <button
                    type="button"
                    class="botao-formulario"
                    id="cancelar-formulario"
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    class="botao-formulario principal"
                >
                    ${
                        editando
                            ? "Salvar Alterações"
                            : "Cadastrar Item"
                    }
                </button>

            </div>


        </form>

    `;

}


/* ============================================================
   21. CONFIGURAR FORMULÁRIO DE ITEM
   ============================================================ */


function configurarFormularioItem() {

    const formulario =
        document.getElementById(
            "formulario-item"
        );


    const botaoFechar =
        document.getElementById(
            "fechar-formulario"
        );


    const botaoCancelar =
        document.getElementById(
            "cancelar-formulario"
        );


    const campoImagem =
        document.getElementById(
            "item-imagem"
        );


    const campoStatus =
        document.getElementById(
            "item-status"
        );


    if (!formulario) {

        return;

    }


    formulario.addEventListener(
        "submit",
        salvarItem
    );


    botaoFechar?.addEventListener(
        "click",
        fecharFormulario
    );


    botaoCancelar?.addEventListener(
        "click",
        fecharFormulario
    );


    campoImagem?.addEventListener(
        "input",
        function () {

            atualizarPreviewImagem(
                campoImagem.value,
                "preview-item",
                "preview-item-img"
            );

        }
    );


    campoStatus?.addEventListener(
        "change",
        atualizarCampoJogador
    );


    atualizarCampoJogador();


    if (
        campoImagem?.value
    ) {

        atualizarPreviewImagem(
            campoImagem.value,
            "preview-item",
            "preview-item-img"
        );

    }

}


/* ============================================================
   22. STATUS / JOGADOR
   ============================================================ */


function atualizarCampoJogador() {

    const campoStatus =
        document.getElementById(
            "item-status"
        );


    const campoJogador =
        document.getElementById(
            "campo-jogador"
        );


    const inputJogador =
        document.getElementById(
            "item-jogador"
        );


    if (
        !campoStatus ||
        !campoJogador ||
        !inputJogador
    ) {

        return;

    }


    const estaComJogador =
        campoStatus.value ===
        "jogador";


    campoJogador.classList.toggle(
        "desativado",
        !estaComJogador
    );


    inputJogador.disabled =
        !estaComJogador;


    if (!estaComJogador) {

        inputJogador.value =
            "";

    }

}


/* ============================================================
   23. PREVIEW DE IMAGEM
   ============================================================ */


function atualizarPreviewImagem(
    caminho,
    idContainer,
    idImagem
) {

    const container =
        document.getElementById(
            idContainer
        );


    const imagem =
        document.getElementById(
            idImagem
        );


    if (
        !container ||
        !imagem
    ) {

        return;

    }


    const valor =
        String(
            caminho || ""
        ).trim();


    if (!valor) {

        container.classList.remove(
            "tem-imagem"
        );


        imagem.removeAttribute(
            "src"
        );


        return;

    }


    imagem.onload =
        function () {

            container.classList.add(
                "tem-imagem"
            );

        };


    imagem.onerror =
        function () {

            container.classList.remove(
                "tem-imagem"
            );

        };


    imagem.src =
        valor;

}


/* ============================================================
   24. LOCALIZAR JOGADOR
   ============================================================ */


/*
 * O Back-End trabalha com jogadorId.
 *
 * O formulário, por questão de usabilidade, continua permitindo
 * que o administrador digite o nome do jogador.
 *
 * Aqui convertemos:
 *
 * "Angela"
 *
 * em:
 *
 * jogadorId correspondente.
 */


function encontrarJogadorPorNome(
    nome
) {

    const nomeNormalizado =
        normalizarTexto(
            nome
        );


    if (!nomeNormalizado) {

        return null;

    }


    return jogadores.find(
        function (
            jogador
        ) {

            return (
                normalizarTexto(
                    jogador.nome
                ) === nomeNormalizado
                ||
                normalizarTexto(
                    jogador.minecraft
                ) === nomeNormalizado
            );

        }
    ) || null;

}


/* ============================================================
   25. SALVAR ITEM
   ============================================================ */


async function salvarItem(
    evento
) {

    evento.preventDefault();


    const formulario =
        evento.currentTarget;


    const categoriaId =
        formulario.querySelector(
            "#item-categoria"
        ).value;


    const nome =
        formulario.querySelector(
            "#item-nome"
        ).value.trim();


    const raridade =
        formulario.querySelector(
            "#item-raridade"
        ).value;


    const temporada =
        formulario.querySelector(
            "#item-temporada"
        ).value.trim();


    const aquisicao =
        formulario.querySelector(
            "#item-aquisicao"
        ).value.trim();


    const status =
        formulario.querySelector(
            "#item-status"
        ).value;


    const dono =
        formulario.querySelector(
            "#item-jogador"
        ).value.trim();


    const imagem =
        formulario.querySelector(
            "#item-imagem"
        ).value.trim();


    const descricao =
        formulario.querySelector(
            "#item-descricao"
        ).value.trim();


    if (!categoriaId) {

        mostrarMensagem(
            "Selecione uma categoria.",
            "erro"
        );


        formulario
            .querySelector(
                "#item-categoria"
            )
            .focus();


        return;

    }


    if (!nome) {

        mostrarMensagem(
            "Informe o nome do item.",
            "erro"
        );


        formulario
            .querySelector(
                "#item-nome"
            )
            .focus();


        return;

    }


    /*
     * Verificação local de duplicidade.
     *
     * O Back-End também verifica isso.
     */


    const nomeNormalizado =
        normalizarTexto(
            nome
        );


    const itemDuplicado =
        itens.find(
            function (
                registro
            ) {

                return (
                    registro.categoriaId ===
                    categoriaId &&

                    normalizarTexto(
                        registro.nome
                    ) ===
                    nomeNormalizado &&

                    registro.id !==
                    idEdicao
                );

            }
        );


    if (
        itemDuplicado
    ) {

        mostrarMensagem(
            "Já existe um item com esse nome nesta categoria.",
            "erro"
        );


        formulario
            .querySelector(
                "#item-nome"
            )
            .focus();


        return;

    }


    let jogadorId =
        null;


    /*
     * Se o item estiver com um jogador, precisamos encontrar
     * esse jogador no banco.
     */


    if (
        status ===
        "jogador"
    ) {

        if (!dono) {

            mostrarMensagem(
                "Informe qual jogador está com o item.",
                "erro"
            );


            formulario
                .querySelector(
                    "#item-jogador"
                )
                .focus();


            return;

        }


        const jogador =
            encontrarJogadorPorNome(
                dono
            );


        if (!jogador) {

            mostrarMensagem(
                `O jogador "${dono}" não foi encontrado no cadastro de jogadores.`,
                "erro"
            );


            formulario
                .querySelector(
                    "#item-jogador"
                )
                .focus();


            return;

        }


        jogadorId =
            jogador.id;

    }


    const dados =
        {
            categoriaId:
                categoriaId,

            nome:
                nome,

            raridade:
                raridade,

            temporada:
                temporada,

            aquisicao:
                aquisicao,

            status:
                status,

            jogadorId:
                jogadorId,

            imagem:
                imagem,

            descricao:
                descricao
        };


    try {

        let resposta;


        if (
            modoFormulario ===
            "editar-item"
        ) {

            resposta =
                await requisicaoAPI(
                    `${API_ITENS}/${encodeURIComponent(idEdicao)}`,
                    {
                        method:
                            "PUT",

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );


            mostrarMensagem(
                resposta?.mensagem ||
                "Item atualizado com sucesso.",
                "sucesso"
            );

        }

        else {

            resposta =
                await requisicaoAPI(
                    API_ITENS,
                    {
                        method:
                            "POST",

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );


            mostrarMensagem(
                resposta?.mensagem ||
                "Item cadastrado com sucesso.",
                "sucesso"
            );

        }


        await carregarCategorias();

        await carregarItens();

        await carregarJogadores();

        renderizarTudo();

        fecharFormulario(
            false
        );

    }

    catch (erro) {

        console.error(
            "Erro ao salvar item:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível salvar o item.",
            "erro"
        );

    }

}


/* ============================================================
   26. FECHAR FORMULÁRIO
   ============================================================ */


function fecharFormulario(
    esconderMensagemAtual = true
) {

    if (!areaCadastro) {

        return;

    }


    areaCadastro.innerHTML =
        "";


    modoFormulario =
        null;


    idEdicao =
        null;


    removerEstadoAtivoBotoes();


    if (
        esconderMensagemAtual
    ) {

        esconderMensagem();

    }

}


/* ============================================================
   27. REMOVER ESTADO ATIVO
   ============================================================ */


function removerEstadoAtivoBotoes() {

    botaoCriarCategoria
        ?.classList.remove(
            "ativo"
        );


    botaoCadastrarItem
        ?.classList.remove(
            "ativo"
        );

}


/* ============================================================
   28. RENDERIZAÇÃO GERAL
   ============================================================ */


function renderizarTudo() {

    renderizarCategorias();

    renderizarItens();

    atualizarContadores();

}


/* ============================================================
   29. RENDERIZAR CATEGORIAS
   ============================================================ */


function renderizarCategorias() {

    if (!listaCategorias) {

        return;

    }


    listaCategorias.innerHTML =
        "";


    if (
        categorias.length ===
        0
    ) {

        if (
            estadoVazioCategorias
        ) {

            estadoVazioCategorias.style.display =
                "block";

        }


        return;

    }


    if (
        estadoVazioCategorias
    ) {

        estadoVazioCategorias.style.display =
            "none";

    }


    categorias.forEach(
        function (
            categoria
        ) {

            const quantidadeItens =
                itens.filter(
                    function (
                        item
                    ) {

                        return (
                            item.categoriaId ===
                            categoria.id
                        );

                    }
                ).length;


            listaCategorias.appendChild(
                criarCardCategoria(
                    categoria,
                    quantidadeItens
                )
            );

        }
    );

}


/* ============================================================
   30. CARD DE CATEGORIA
   ============================================================ */


function criarCardCategoria(
    categoria,
    quantidadeItens
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "card-registro-admin";


    const imagem =
        categoria.imagem
            ? `

                <img
                    src="${escaparHTML(
                        categoria.imagem
                    )}"
                    alt="${escaparHTML(
                        categoria.nome
                    )}"
                    loading="lazy"
                >

            `
            : `

                <span class="placeholder-registro-admin">
                    Sem imagem
                </span>

            `;


    card.innerHTML = `

        <div class="imagem-registro-admin">

            ${imagem}

        </div>


        <div class="conteudo-registro-admin">

            <span class="tipo-registro-admin">
                Categoria
            </span>


            <h3>
                ${escaparHTML(
                    categoria.nome
                )}
            </h3>


            <p>
                ${escaparHTML(
                    categoria.descricao ||
                    "Sem descrição cadastrada."
                )}
            </p>


            <div class="info-extra-registro">

                <span class="tag-registro">

                    ${quantidadeItens}

                    ${
                        quantidadeItens === 1
                            ? "item"
                            : "itens"
                    }

                </span>


                <span class="tag-registro">

                    Criada em
                    ${formatarData(
                        categoria.criadoEm
                    )}

                </span>

            </div>


            <div class="acoes-registro-admin">

                <button
                    type="button"
                    class="botao-registro"
                    data-acao="editar-categoria"
                    data-id="${escaparHTML(
                        categoria.id
                    )}"
                >
                    Editar
                </button>


                <button
                    type="button"
                    class="botao-registro excluir"
                    data-acao="excluir-categoria"
                    data-id="${escaparHTML(
                        categoria.id
                    )}"
                >
                    Excluir
                </button>

            </div>

        </div>

    `;


    configurarImagemFallback(
        card
    );


    const botaoEditar =
        card.querySelector(
            '[data-acao="editar-categoria"]'
        );


    const botaoExcluir =
        card.querySelector(
            '[data-acao="excluir-categoria"]'
        );


    botaoEditar?.addEventListener(
        "click",
        function () {

            editarCategoria(
                categoria.id
            );

        }
    );


    botaoExcluir?.addEventListener(
        "click",
        function () {

            excluirCategoria(
                categoria.id
            );

        }
    );


    return card;

}


/* ============================================================
   31. RENDERIZAR ITENS
   ============================================================ */


function renderizarItens() {

    if (!listaItens) {

        return;

    }


    listaItens.innerHTML =
        "";


    if (
        itens.length ===
        0
    ) {

        if (
            estadoVazioItens
        ) {

            estadoVazioItens.style.display =
                "block";

        }


        return;

    }


    if (
        estadoVazioItens
    ) {

        estadoVazioItens.style.display =
            "none";

    }


    itens.forEach(
        function (
            item
        ) {

            listaItens.appendChild(
                criarCardItem(
                    item
                )
            );

        }
    );

}


/* ============================================================
   32. CARD DE ITEM
   ============================================================ */


function criarCardItem(
    item
) {

    const categoria =
        categorias.find(
            function (
                registro
            ) {

                return (
                    registro.id ===
                    item.categoriaId
                );

            }
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "card-registro-admin";


    const imagem =
        item.imagem
            ? `

                <img
                    src="${escaparHTML(
                        item.imagem
                    )}"
                    alt="${escaparHTML(
                        item.nome
                    )}"
                    loading="lazy"
                >

            `
            : `

                <span class="placeholder-registro-admin">
                    Sem imagem
                </span>

            `;


    const jogadorNome =
        item.dono ||
        item.jogador?.nome ||
        "";


    const estaComJogador =
        item.status ===
            "jogador" ||
        item.status ===
            "Em posse de jogador";


    const statusTexto =
        estaComJogador
            ? (
                jogadorNome
                    ? `Com ${jogadorNome}`
                    : "Com jogador"
            )
            : "No Armazém";


    card.innerHTML = `

        <div class="imagem-registro-admin">

            ${imagem}

        </div>


        <div class="conteudo-registro-admin">

            <span class="tipo-registro-admin">

                ${escaparHTML(
                    categoria?.nome ||
                    "Categoria removida"
                )}

            </span>


            <h3>
                ${escaparHTML(
                    item.nome
                )}
            </h3>


            <p>
                ${escaparHTML(
                    item.descricao ||
                    "Sem descrição cadastrada."
                )}
            </p>


            <div class="info-extra-registro">

                ${
                    item.raridade
                        ? `

                            <span class="tag-registro">

                                ${escaparHTML(
                                    item.raridade
                                )}

                            </span>

                        `
                        : ""
                }


                ${
                    item.temporada
                        ? `

                            <span class="tag-registro">

                                ${escaparHTML(
                                    item.temporada
                                )}

                            </span>

                        `
                        : ""
                }


                <span class="tag-registro">

                    ${escaparHTML(
                        statusTexto
                    )}

                </span>


            </div>


            <div class="acoes-registro-admin">

                <button
                    type="button"
                    class="botao-registro"
                    data-acao="editar-item"
                    data-id="${escaparHTML(
                        item.id
                    )}"
                >
                    Editar
                </button>


                <button
                    type="button"
                    class="botao-registro excluir"
                    data-acao="excluir-item"
                    data-id="${escaparHTML(
                        item.id
                    )}"
                >
                    Excluir
                </button>

            </div>

        </div>

    `;


    configurarImagemFallback(
        card
    );


    const botaoEditar =
        card.querySelector(
            '[data-acao="editar-item"]'
        );


    const botaoExcluir =
        card.querySelector(
            '[data-acao="excluir-item"]'
        );


    botaoEditar?.addEventListener(
        "click",
        function () {

            editarItem(
                item.id
            );

        }
    );


    botaoExcluir?.addEventListener(
        "click",
        function () {

            excluirItem(
                item.id
            );

        }
    );


    return card;

}


/* ============================================================
   33. FALLBACK DE IMAGEM
   ============================================================ */


function configurarImagemFallback(
    elemento
) {

    const imagens =
        elemento.querySelectorAll(
            "img"
        );


    imagens.forEach(
        function (
            imagem
        ) {

            imagem.addEventListener(
                "error",
                function () {

                    const container =
                        imagem.closest(
                            ".imagem-registro-admin"
                        );


                    if (!container) {

                        return;

                    }


                    imagem.remove();


                    const placeholder =
                        document.createElement(
                            "span"
                        );


                    placeholder.className =
                        "placeholder-registro-admin";


                    placeholder.textContent =
                        "Imagem indisponível";


                    container.appendChild(
                        placeholder
                    );

                },
                {
                    once: true
                }
            );

        }
    );

}


/* ============================================================
   34. EDITAR CATEGORIA
   ============================================================ */


function editarCategoria(
    id
) {

    const categoria =
        categorias.find(
            function (
                registro
            ) {

                return (
                    registro.id ===
                    id
                );

            }
        );


    if (!categoria) {

        mostrarMensagem(
            "Categoria não encontrada.",
            "erro"
        );

        return;

    }


    abrirFormularioCategoria(
        categoria
    );

}


/* ============================================================
   35. EXCLUIR CATEGORIA
   ============================================================ */


async function excluirCategoria(
    id
) {

    const categoria =
        categorias.find(
            function (
                registro
            ) {

                return (
                    registro.id ===
                    id
                );

            }
        );


    if (!categoria) {

        mostrarMensagem(
            "Categoria não encontrada.",
            "erro"
        );

        return;

    }


    const itensDaCategoria =
        itens.filter(
            function (
                item
            ) {

                return (
                    item.categoriaId ===
                    id
                );

            }
        );


    let mensagemConfirmacao =
        `Deseja realmente excluir a categoria "${categoria.nome}"?`;


    if (
        itensDaCategoria.length > 0
    ) {

        mensagemConfirmacao +=
            `\n\nEssa categoria possui ${itensDaCategoria.length} ` +
            `${
                itensDaCategoria.length === 1
                    ? "item cadastrado"
                    : "itens cadastrados"
            }.\n\n` +
            "A categoria e todos esses itens serão removidos.";

    }


    const confirmou =
        window.confirm(
            mensagemConfirmacao
        );


    if (!confirmou) {

        return;

    }


    try {

        const resposta =
            await requisicaoAPI(
                `${API_CATEGORIAS}/${encodeURIComponent(id)}`,
                {
                    method:
                        "DELETE"
                }
            );


        await carregarCategorias();

        await carregarItens();

        renderizarTudo();


        if (
            idEdicao ===
            id
        ) {

            fecharFormulario(
                false
            );

        }


        mostrarMensagem(
            resposta?.mensagem ||
            "Categoria removida com sucesso.",
            "sucesso"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao excluir categoria:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível excluir a categoria.",
            "erro"
        );

    }

}


/* ============================================================
   36. EDITAR ITEM
   ============================================================ */


function editarItem(
    id
) {

    const item =
        itens.find(
            function (
                registro
            ) {

                return (
                    registro.id ===
                    id
                );

            }
        );


    if (!item) {

        mostrarMensagem(
            "Item não encontrado.",
            "erro"
        );

        return;

    }


    abrirFormularioItem(
        item
    );

}


/* ============================================================
   37. EXCLUIR ITEM
   ============================================================ */


async function excluirItem(
    id
) {

    const item =
        itens.find(
            function (
                registro
            ) {

                return (
                    registro.id ===
                    id
                );

            }
        );


    if (!item) {

        mostrarMensagem(
            "Item não encontrado.",
            "erro"
        );

        return;

    }


    const confirmou =
        window.confirm(
            `Deseja realmente excluir o item "${item.nome}"?\n\n` +
            "Essa ação não poderá ser desfeita."
        );


    if (!confirmou) {

        return;

    }


    try {

        const resposta =
            await requisicaoAPI(
                `${API_ITENS}/${encodeURIComponent(id)}`,
                {
                    method:
                        "DELETE"
                }
            );


        await carregarItens();

        await carregarCategorias();


        renderizarTudo();


        if (
            idEdicao ===
            id
        ) {

            fecharFormulario(
                false
            );

        }


        mostrarMensagem(
            resposta?.mensagem ||
            "Item removido com sucesso.",
            "sucesso"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao excluir item:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível excluir o item.",
            "erro"
        );

    }

}


/* ============================================================
   38. CONTADORES
   ============================================================ */


function atualizarContadores() {

    if (
        contadorCategorias
    ) {

        contadorCategorias.textContent =
            categorias.length === 1
                ? "1 categoria"
                : `${categorias.length} categorias`;

    }


    if (
        contadorItens
    ) {

        contadorItens.textContent =
            itens.length === 1
                ? "1 item"
                : `${itens.length} itens`;

    }

}


/* ============================================================
   39. EXPOSIÇÃO DE FUNÇÕES
   ============================================================ */


/*
 * Algumas funções ficam disponíveis no window para facilitar
 * futuras integrações e testes.
 *
 * Os dados continuam sendo controlados pela API.
 */


window.UnholyBloodAdmin = {

    carregarDados,

    carregarCategorias,

    carregarItens,

    carregarJogadores,

    renderizarTudo,

    abrirFormularioCategoria,

    abrirFormularioItem,

    editarCategoria,

    editarItem,

    excluirCategoria,

    excluirItem

};


/* ============================================================
   FIM DO ARQUIVO
   ============================================================ */