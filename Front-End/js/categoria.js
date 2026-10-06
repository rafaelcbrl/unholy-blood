/* ============================================================
   UNHOLY BLOOD — ARQUIVO DA GUILDA
   CATEGORIA.JS
   ============================================================

   RESPONSABILIDADE DESTE ARQUIVO:

   - Identificar a categoria através da URL
   - Buscar a categoria na API
   - Buscar os itens da categoria na API
   - Exibir os dados reais da categoria
   - Exibir os itens cadastrados
   - Pesquisar itens
   - Filtrar por raridade
   - Filtrar por temporada
   - Filtrar por status
   - Exibir o proprietário do item
   - Abrir a página individual do item
   - Tratar categoria inexistente
   - Tratar erros da API
   - Manter a interface dinâmica

   IMPORTANTE:

   Este arquivo NÃO utiliza mais dados temporários.

   Todos os registros vêm do Back-End.
   ============================================================ */


/* ============================================================
   01. CONFIGURAÇÃO DA API
   ============================================================ */

const API_CATEGORIAS =
    "/api/categorias";


const API_ITENS =
    "/api/itens";


/* ============================================================
   02. ELEMENTOS DA PÁGINA
   ============================================================ */

const tituloCategoria =
    document.getElementById(
        "titulo-categoria"
    );


const descricaoCategoria =
    document.getElementById(
        "descricao-categoria"
    );


const pesquisaItemCategoria =
    document.getElementById(
        "pesquisa-item-categoria"
    );


const filtroRaridadeCategoria =
    document.getElementById(
        "filtro-raridade-categoria"
    );


const filtroTemporadaCategoria =
    document.getElementById(
        "filtro-temporada-categoria"
    );


const filtroStatusCategoria =
    document.getElementById(
        "filtro-status-categoria"
    );


const contadorItens =
    document.getElementById(
        "contador-itens"
    );


const gradeItens =
    document.getElementById(
        "grade-itens"
    );


const estadoVazioCategoria =
    document.getElementById(
        "estado-vazio-categoria"
    );


const caminhoCategoria =
    document.getElementById(
        "caminho-categoria"
    );


/* ============================================================
   03. IDENTIFICAR A CATEGORIA PELA URL
   ============================================================

   Exemplo:

   categoria.html?id=armas

   O valor "armas" será utilizado para consultar a API.

   Como as categorias agora são dinâmicas, não podemos mais
   assumir que exista uma categoria chamada "armas", "pokemons",
   "armaduras", etc.
   ============================================================ */

const parametrosURL =
    new URLSearchParams(
        window.location.search
    );


const idCategoria =
    parametrosURL.get(
        "id"
    );


/* ============================================================
   04. ESTADO ATUAL
   ============================================================ */

let categoriaAtual =
    null;


let itensAtuais =
    [];


let carregandoCategoria =
    false;


/* ============================================================
   05. REQUISIÇÃO GENÉRICA PARA A API
   ============================================================ */

async function requisicaoAPI(
    url,
    opcoes = {}
) {

    const resposta =
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


    let dados =
        null;


    try {

        dados =
            await resposta.json();

    } catch (erro) {

        dados =
            null;

    }


    if (!resposta.ok) {

        const mensagem =
            dados &&
            typeof dados === "object" &&
            dados.mensagem

                ? dados.mensagem

                : `Erro HTTP ${resposta.status}.`;


        throw new Error(
            mensagem
        );

    }


    return dados;

}


/* ============================================================
   06. EXTRAIR DADOS DE CATEGORIA
   ============================================================

   A API pode retornar diretamente o objeto ou encapsulá-lo
   em uma propriedade.

   Mantemos essa função flexível para evitar que pequenas
   mudanças no formato da resposta quebrem o Front-End.
   ============================================================ */

function extrairCategoria(
    dados
) {

    if (
        !dados
    ) {

        return null;

    }


    /*
     * Caso a API retorne diretamente:

     * {
     *     id: "...",
     *     nome: "..."
     * }
     */

    if (
        dados.id &&
        dados.nome
    ) {

        return dados;

    }


    /*
     * Caso retorne:

     * {
     *     categoria: {...}
     * }
     */

    if (
        dados.categoria &&
        typeof dados.categoria ===
            "object"
    ) {

        return dados.categoria;

    }


    /*
     * Caso retorne:

     * {
     *     dados: {...}
     * }
     */

    if (
        dados.dados &&
        typeof dados.dados ===
            "object" &&
        !Array.isArray(
            dados.dados
        )
    ) {

        return dados.dados;

    }


    return null;

}


/* ============================================================
   07. EXTRAIR LISTA DE ITENS
   ============================================================ */

function extrairItens(
    dados
) {

    if (
        Array.isArray(
            dados
        )
    ) {

        return dados;

    }


    if (
        dados &&
        Array.isArray(
            dados.itens
        )
    ) {

        return dados.itens;

    }


    if (
        dados &&
        Array.isArray(
            dados.dados
        )
    ) {

        return dados.dados;

    }


    return [];

}


/* ============================================================
   08. NORMALIZAR TEXTO
   ============================================================

   Permite comparar:

   "Lendário"
   "lendario"
   "LENDARIO"

   como o mesmo valor.

   Também remove acentos.
   ============================================================ */

function normalizarTexto(
    valor
) {

    return String(
        valor ?? ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


/* ============================================================
   09. CARREGAR CATEGORIA
   ============================================================ */

async function carregarCategoria() {

    if (
        !idCategoria
    ) {

        mostrarCategoriaNaoEncontrada();

        return;

    }


    const dados =
        await requisicaoAPI(
            `${API_CATEGORIAS}/${encodeURIComponent(
                idCategoria
            )}`
        );


    categoriaAtual =
        extrairCategoria(
            dados
        );


    if (
        !categoriaAtual
    ) {

        throw new Error(
            "A categoria solicitada não foi encontrada."
        );

    }

}


/* ============================================================
   10. CARREGAR ITENS DA CATEGORIA
   ============================================================ */

async function carregarItens() {

    if (
        !idCategoria
    ) {

        itensAtuais =
            [];

        return;

    }


    const url =
        `${API_ITENS}?categoria=${encodeURIComponent(
            idCategoria
        )}`;


    const dados =
        await requisicaoAPI(
            url
        );


    itensAtuais =
        extrairItens(
            dados
        );

}


/* ============================================================
   11. CARREGAR TODA A PÁGINA
   ============================================================ */

async function carregarPaginaCategoria() {

    if (
        carregandoCategoria
    ) {

        return;

    }


    carregandoCategoria =
        true;


    mostrarCarregando();


    try {

        /*
         * Busca categoria e itens simultaneamente.
         */

        await Promise.all(
            [
                carregarCategoria(),
                carregarItens()
            ]
        );


        /*
         * Preenche as informações da categoria.
         */

        preencherDadosCategoria();


        /*
         * Cria as opções dos filtros de acordo
         * com os itens realmente existentes.
         */

        preencherFiltroRaridades();

        preencherFiltroTemporadas();

        preencherFiltroStatus();


        /*
         * Renderiza os itens.
         */

        aplicarFiltros();


        console.log(
            "☩ Unholy Blood — Categoria carregada pela API."
        );


        console.log(
            "Categoria:",
            idCategoria
        );


        console.log(
            "Itens encontrados:",
            itensAtuais.length
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar categoria:",
            erro
        );


        /*
         * Se a própria API informou que a categoria não
         * existe, exibimos o estado específico.
         */

        if (
            erro &&
            erro.message &&
            normalizarTexto(
                erro.message
            ).includes(
                "nao foi encontrada"
            )
        ) {

            mostrarCategoriaNaoEncontrada();

        } else {

            mostrarErro(
                erro
            );

        }


    } finally {

        carregandoCategoria =
            false;

    }

}


/* ============================================================
   12. PREENCHER DADOS DA CATEGORIA
   ============================================================ */

function preencherDadosCategoria() {

    if (
        !categoriaAtual
    ) {

        return;

    }


    if (
        tituloCategoria
    ) {

        tituloCategoria.textContent =
            categoriaAtual.nome ||
            "Categoria sem nome";

    }


    if (
        descricaoCategoria
    ) {

        descricaoCategoria.textContent =
            categoriaAtual.descricao ||
            "Nenhuma descrição foi registrada para esta categoria.";

    }


    if (
        caminhoCategoria
    ) {

        caminhoCategoria.textContent =
            String(
                categoriaAtual.nome ||
                "Categoria"
            ).toUpperCase();

    }

}


/* ============================================================
   13. CATEGORIA NÃO ENCONTRADA
   ============================================================ */

function mostrarCategoriaNaoEncontrada() {

    if (
        tituloCategoria
    ) {

        tituloCategoria.textContent =
            "Categoria não encontrada";

    }


    if (
        descricaoCategoria
    ) {

        descricaoCategoria.textContent =
            "O registro solicitado não existe ou não está disponível no arquivo.";

    }


    if (
        caminhoCategoria
    ) {

        caminhoCategoria.textContent =
            "NÃO ENCONTRADA";

    }


    if (
        gradeItens
    ) {

        gradeItens.innerHTML =
            "";

    }


    atualizarContadorItens(
        0
    );


    if (
        estadoVazioCategoria
    ) {

        estadoVazioCategoria.hidden =
            false;

    }

}


/* ============================================================
   14. ESTADO DE CARREGAMENTO
   ============================================================ */

function mostrarCarregando() {

    if (
        tituloCategoria
    ) {

        tituloCategoria.textContent =
            "Consultando arquivo...";

    }


    if (
        descricaoCategoria
    ) {

        descricaoCategoria.textContent =
            "Recuperando os registros desta categoria.";

    }


    if (
        caminhoCategoria
    ) {

        caminhoCategoria.textContent =
            "CARREGANDO";

    }


    if (
        gradeItens
    ) {

        gradeItens.innerHTML = `

            <div class="estado-vazio">

                <div class="estado-vazio-simbolo">
                    ✦
                </div>

                <h3>
                    Consultando os arquivos...
                </h3>

                <p>
                    Os registros da categoria estão
                    sendo recuperados.
                </p>

            </div>

        `;

    }


    atualizarContadorItens(
        0
    );


    if (
        estadoVazioCategoria
    ) {

        estadoVazioCategoria.hidden =
            true;

    }

}


/* ============================================================
   15. ESTADO DE ERRO
   ============================================================ */

function mostrarErro(
    erro
) {

    const mensagem =
        erro &&
        erro.message

            ? erro.message

            : "Não foi possível carregar os registros desta categoria.";


    if (
        tituloCategoria
    ) {

        tituloCategoria.textContent =
            "Falha no arquivo";

    }


    if (
        descricaoCategoria
    ) {

        descricaoCategoria.textContent =
            "Não foi possível consultar os registros desta categoria.";

    }


    if (
        caminhoCategoria
    ) {

        caminhoCategoria.textContent =
            "ERRO";

    }


    if (
        gradeItens
    ) {

        gradeItens.innerHTML = `

            <div class="estado-vazio">

                <div class="estado-vazio-simbolo">
                    ⚠
                </div>

                <h3>
                    Falha ao consultar o arquivo.
                </h3>

                <p>
                    ${escaparHTML(
                        mensagem
                    )}
                </p>

                <button
                    type="button"
                    class="botao-tentar-novamente"
                    id="botao-tentar-novamente-categoria"
                >
                    Tentar novamente
                </button>

            </div>

        `;

    }


    atualizarContadorItens(
        0
    );


    const botao =
        document.getElementById(
            "botao-tentar-novamente-categoria"
        );


    if (
        botao
    ) {

        botao.addEventListener(
            "click",
            function () {

                carregarPaginaCategoria();

            }
        );

    }

}


/* ============================================================
   16. ESCAPAR HTML
   ============================================================ */

function escaparHTML(
    valor
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            valor ?? ""
        );


    return div.innerHTML;

}


/* ============================================================
   17. PREENCHER FILTRO DE RARIDADES
   ============================================================ */

function preencherFiltroRaridades() {

    if (
        !filtroRaridadeCategoria
    ) {

        return;

    }


    const valorAtual =
        filtroRaridadeCategoria.value;


    const raridades =
        obterValoresUnicos(
            itensAtuais,
            "raridade"
        );


    filtroRaridadeCategoria.innerHTML =
        "";


    const opcaoTodas =
        document.createElement(
            "option"
        );


    opcaoTodas.value =
        "todas";


    opcaoTodas.textContent =
        "Todas";


    filtroRaridadeCategoria.appendChild(
        opcaoTodas
    );


    raridades.forEach(
        function (raridade) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                raridade;


            option.textContent =
                formatarRaridade(
                    raridade
                );


            filtroRaridadeCategoria.appendChild(
                option
            );

        }
    );


    restaurarValorFiltro(
        filtroRaridadeCategoria,
        valorAtual,
        "todas"
    );

}


/* ============================================================
   18. PREENCHER FILTRO DE TEMPORADAS
   ============================================================ */

function preencherFiltroTemporadas() {

    if (
        !filtroTemporadaCategoria
    ) {

        return;

    }


    const valorAtual =
        filtroTemporadaCategoria.value;


    const temporadas =
        obterValoresUnicos(
            itensAtuais,
            "temporada"
        );


    filtroTemporadaCategoria.innerHTML =
        "";


    const opcaoTodas =
        document.createElement(
            "option"
        );


    opcaoTodas.value =
        "todas";


    opcaoTodas.textContent =
        "Todas";


    filtroTemporadaCategoria.appendChild(
        opcaoTodas
    );


    temporadas.forEach(
        function (temporada) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                temporada;


            option.textContent =
                formatarTemporada(
                    temporada
                );


            filtroTemporadaCategoria.appendChild(
                option
            );

        }
    );


    restaurarValorFiltro(
        filtroTemporadaCategoria,
        valorAtual,
        "todas"
    );

}


/* ============================================================
   19. PREENCHER FILTRO DE STATUS
   ============================================================ */

function preencherFiltroStatus() {

    if (
        !filtroStatusCategoria
    ) {

        return;

    }


    const valorAtual =
        filtroStatusCategoria.value;


    filtroStatusCategoria.innerHTML =
        "";


    const opcaoTodos =
        document.createElement(
            "option"
        );


    opcaoTodos.value =
        "todos";


    opcaoTodos.textContent =
        "Todos";


    filtroStatusCategoria.appendChild(
        opcaoTodos
    );


    const opcaoArmazem =
        document.createElement(
            "option"
        );


    opcaoArmazem.value =
        "armazem";


    opcaoArmazem.textContent =
        "No Armazém";


    filtroStatusCategoria.appendChild(
        opcaoArmazem
    );


    const opcaoJogador =
        document.createElement(
            "option"
        );


    opcaoJogador.value =
        "jogador";


    opcaoJogador.textContent =
        "Em posse de jogador";


    filtroStatusCategoria.appendChild(
        opcaoJogador
    );


    restaurarValorFiltro(
        filtroStatusCategoria,
        valorAtual,
        "todos"
    );

}


/* ============================================================
   20. RESTAURAR VALOR DE FILTRO
   ============================================================ */

function restaurarValorFiltro(
    elemento,
    valor,
    valorPadrao
) {

    if (
        !elemento
    ) {

        return;

    }


    const existe =
        Array.from(
            elemento.options
        ).some(
            function (option) {

                return (
                    normalizarTexto(
                        option.value
                    ) ===
                    normalizarTexto(
                        valor
                    )
                );

            }
        );


    if (
        existe
    ) {

        elemento.value =
            valor;

    } else {

        elemento.value =
            valorPadrao;

    }

}


/* ============================================================
   21. OBTER VALORES ÚNICOS
   ============================================================ */

function obterValoresUnicos(
    itens,
    propriedade
) {

    const mapa =
        new Map();


    itens.forEach(
        function (item) {

            const valor =
                String(
                    item?.[propriedade] ??
                    ""
                ).trim();


            if (
                !valor
            ) {

                return;

            }


            const chave =
                normalizarTexto(
                    valor
                );


            if (
                !mapa.has(
                    chave
                )
            ) {

                mapa.set(
                    chave,
                    valor
                );

            }

        }
    );


    return Array.from(
        mapa.values()
    ).sort(
        function (a, b) {

            return a.localeCompare(
                b,
                "pt-BR",
                {
                    sensitivity:
                        "base"
                }
            );

        }
    );

}


/* ============================================================
   22. CRIAR CARD DE ITEM
   ============================================================ */

function criarCardItem(
    item
) {

    /*
     * Card principal.
     */

    const card =
        document.createElement(
            "article"
        );


    card.classList.add(
        "card-item"
    );


    card.dataset.itemId =
        item.id;


    /*
     * Indica que o card pode ser aberto.
     */

    card.setAttribute(
        "role",
        "button"
    );


    card.setAttribute(
        "tabindex",
        "0"
    );


    card.setAttribute(
        "aria-label",
        `Abrir registro ${item.nome}`
    );


    /* --------------------------------------------------------
       Área da imagem
    -------------------------------------------------------- */

    const imagemContainer =
        document.createElement(
            "div"
        );


    imagemContainer.classList.add(
        "card-item-imagem"
    );


    /* --------------------------------------------------------
       Imagem
    -------------------------------------------------------- */

    if (
        item.imagem
    ) {

        const imagem =
            document.createElement(
                "img"
            );


        imagem.src =
            item.imagem;


        imagem.alt =
            item.nome ||
            "Item do arquivo";


        imagem.loading =
            "lazy";


        imagem.addEventListener(
            "error",
            function () {

                imagem.style.opacity =
                    "0.15";

            }
        );


        imagemContainer.appendChild(
            imagem
        );


    } else {

        /*
         * Caso o item ainda não possua imagem.
         */

        const simbolo =
            document.createElement(
                "span"
            );


        simbolo.classList.add(
            "card-item-imagem-simbolo"
        );


        simbolo.textContent =
            "✦";


        imagemContainer.appendChild(
            simbolo
        );

    }


    /* --------------------------------------------------------
       Badge de raridade
    -------------------------------------------------------- */

    const raridade =
        document.createElement(
            "span"
        );


    raridade.classList.add(
        "card-item-raridade"
    );


    const raridadeNormalizada =
        normalizarTexto(
            item.raridade
        )
            .replace(
                /\s+/g,
                "-"
            );


    if (
        raridadeNormalizada
    ) {

        raridade.classList.add(
            `raridade-${raridadeNormalizada}`
        );

    }


    raridade.textContent =
        formatarRaridade(
            item.raridade
        );


    imagemContainer.appendChild(
        raridade
    );


    /* --------------------------------------------------------
       Conteúdo
    -------------------------------------------------------- */

    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.classList.add(
        "card-item-conteudo"
    );


    /* --------------------------------------------------------
       Pré-título
    -------------------------------------------------------- */

    const preTitulo =
        document.createElement(
            "span"
        );


    preTitulo.classList.add(
        "card-item-pre-titulo"
    );


    preTitulo.textContent =
        "REGISTRO DO ARQUIVO";


    /* --------------------------------------------------------
       Nome
    -------------------------------------------------------- */

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        item.nome ||
        "Item sem nome";


    /* --------------------------------------------------------
       Descrição
    -------------------------------------------------------- */

    const descricao =
        document.createElement(
            "p"
        );


    descricao.classList.add(
        "card-item-descricao"
    );


    descricao.textContent =
        item.descricao ||
        "Nenhuma descrição foi registrada para este item.";


    /* --------------------------------------------------------
       Informações
    -------------------------------------------------------- */

    const informacoes =
        document.createElement(
            "div"
        );


    informacoes.classList.add(
        "card-item-informacoes"
    );


    /* --------------------------------------------------------
       Temporada
    -------------------------------------------------------- */

    const temporada =
        document.createElement(
            "span"
        );


    temporada.textContent =
        formatarTemporada(
            item.temporada
        );


    /* --------------------------------------------------------
       Status
    -------------------------------------------------------- */

    const status =
        document.createElement(
            "span"
        );


    status.classList.add(
        "card-item-status"
    );


    const statusNormalizado =
        normalizarTexto(
            item.status
        )
            .replace(
                /\s+/g,
                "-"
            );


    if (
        statusNormalizado
    ) {

        status.classList.add(
            `status-${statusNormalizado}`
        );

    }


    status.textContent =
        formatarStatus(
            item
        );


    /* --------------------------------------------------------
       Montagem das informações
    -------------------------------------------------------- */

    informacoes.appendChild(
        temporada
    );


    informacoes.appendChild(
        status
    );


    /* --------------------------------------------------------
       Montagem do conteúdo
    -------------------------------------------------------- */

    conteudo.appendChild(
        preTitulo
    );


    conteudo.appendChild(
        titulo
    );


    conteudo.appendChild(
        descricao
    );


    conteudo.appendChild(
        informacoes
    );


    /* --------------------------------------------------------
       Montagem final
    -------------------------------------------------------- */

    card.appendChild(
        imagemContainer
    );


    card.appendChild(
        conteudo
    );


    /* --------------------------------------------------------
       Clique no item
    -------------------------------------------------------- */

    card.addEventListener(
        "click",
        function () {

            abrirItem(
                item
            );

        }
    );


    /* --------------------------------------------------------
       Acessibilidade — tecla Enter
    -------------------------------------------------------- */

    card.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key ===
                "Enter"
            ) {

                evento.preventDefault();

                abrirItem(
                    item
                );

            }

        }
    );


    return card;

}


/* ============================================================
   23. FORMATAR RARIDADE
   ============================================================ */

function formatarRaridade(
    raridade
) {

    const chave =
        normalizarTexto(
            raridade
        );


    const nomes = {

        comum:
            "Comum",

        incomum:
            "Incomum",

        raro:
            "Raro",

        epico:
            "Épico",

        lendario:
            "Lendário",

        mitico:
            "Mítico"

    };


    return (
        nomes[chave]
        ||
        raridade
        ||
        "Desconhecida"
    );

}


/* ============================================================
   24. FORMATAR TEMPORADA
   ============================================================ */

function formatarTemporada(
    temporada
) {

    if (
        !temporada
    ) {

        return "Sem temporada";

    }


    const valor =
        String(
            temporada
        ).trim();


    const valorNormalizado =
        normalizarTexto(
            valor
        );


    /*
     * Exemplo:

     * temporada-1
     *       ↓
     * Temporada 1
     */


    if (
        valorNormalizado.startsWith(
            "temporada-"
        )
    ) {

        return valor
            .replace(
                /temporada-/i,
                "Temporada "
            );

    }


    return valor;

}


/* ============================================================
   25. FORMATAR STATUS
   ============================================================ */

function formatarStatus(
    item
) {

    const status =
        normalizarTexto(
            item?.status
        );


    if (
        status ===
            "armazem"
        ||
        status ===
            "no armazem"
    ) {

        return "NO ARMAZÉM";

    }


    if (
        status ===
            "jogador"
        ||
        status ===
            "em posse de jogador"
    ) {

        /*
         * O Back-End disponibiliza "dono"
         * quando o item pertence a alguém.
         */

        if (
            item.dono
        ) {

            return (
                "COM "
                +
                String(
                    item.dono
                ).toUpperCase()
            );

        }


        /*
         * Fallback caso o dono ainda não
         * esteja disponível na resposta.
         */

        if (
            item.jogador &&
            item.jogador.nome
        ) {

            return (
                "COM "
                +
                String(
                    item.jogador.nome
                ).toUpperCase()
            );

        }


        return "EM POSSE DE JOGADOR";

    }


    return "STATUS DESCONHECIDO";

}


/* ============================================================
   26. ABRIR ITEM
   ============================================================ */

function abrirItem(
    item
) {

    if (
        !item ||
        !item.id
    ) {

        console.error(
            "Não foi possível abrir o item:",
            item
        );


        return;

    }


    window.location.href =
        `item.html?id=${encodeURIComponent(
            item.id
        )}`;

}


/* ============================================================
   27. RENDERIZAR ITENS
   ============================================================ */

function renderizarItens(
    itens
) {

    if (
        !gradeItens
    ) {

        return;

    }


    /*
     * Limpa a grade.
     */

    gradeItens.innerHTML =
        "";


    /*
     * Atualiza contador.
     */

    atualizarContadorItens(
        itens.length
    );


    /*
     * Nenhum resultado.
     */

    if (
        !itens ||
        itens.length === 0
    ) {

        mostrarEstadoVazio();

        return;

    }


    /*
     * Esconde estado vazio.
     */

    esconderEstadoVazio();


    /*
     * Cria os cards.
     */

    itens.forEach(
        function (item) {

            const card =
                criarCardItem(
                    item
                );


            gradeItens.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   28. CONTADOR DE ITENS
   ============================================================ */

function atualizarContadorItens(
    quantidade
) {

    if (
        !contadorItens
    ) {

        return;

    }


    const numero =
        Number(
            quantidade
        ) || 0;


    contadorItens.textContent =
        String(
            numero
        ).padStart(
            2,
            "0"
        )
        +
        (
            numero === 1
                ? " ITEM"
                : " ITENS"
        );

}


/* ============================================================
   29. MOSTRAR ESTADO VAZIO
   ============================================================ */

function mostrarEstadoVazio() {

    if (
        !estadoVazioCategoria
    ) {

        return;

    }


    estadoVazioCategoria.hidden =
        false;

}


/* ============================================================
   30. ESCONDER ESTADO VAZIO
   ============================================================ */

function esconderEstadoVazio() {

    if (
        !estadoVazioCategoria
    ) {

        return;

    }


    estadoVazioCategoria.hidden =
        true;

}


/* ============================================================
   31. FILTRO — PESQUISA
   ============================================================ */

function aplicarPesquisa(
    itens
) {

    if (
        !pesquisaItemCategoria
    ) {

        return itens;

    }


    const termo =
        normalizarTexto(
            pesquisaItemCategoria.value
        );


    if (
        !termo
    ) {

        return itens;

    }


    return itens.filter(
        function (item) {

            const nome =
                normalizarTexto(
                    item.nome
                );


            const descricao =
                normalizarTexto(
                    item.descricao
                );


            const dono =
                normalizarTexto(
                    item.dono
                );


            return (
                nome.includes(
                    termo
                )
                ||
                descricao.includes(
                    termo
                )
                ||
                dono.includes(
                    termo
                )
            );

        }
    );

}


/* ============================================================
   32. FILTRO — RARIDADE
   ============================================================ */

function aplicarFiltroRaridade(
    itens
) {

    if (
        !filtroRaridadeCategoria
    ) {

        return itens;

    }


    const valor =
        filtroRaridadeCategoria.value;


    if (
        !valor ||
        valor === "todas"
    ) {

        return itens;

    }


    return itens.filter(
        function (item) {

            return (
                normalizarTexto(
                    item.raridade
                )
                ===
                normalizarTexto(
                    valor
                )
            );

        }
    );

}


/* ============================================================
   33. FILTRO — TEMPORADA
   ============================================================ */

function aplicarFiltroTemporada(
    itens
) {

    if (
        !filtroTemporadaCategoria
    ) {

        return itens;

    }


    const valor =
        filtroTemporadaCategoria.value;


    if (
        !valor ||
        valor === "todas"
    ) {

        return itens;

    }


    return itens.filter(
        function (item) {

            return (
                normalizarTexto(
                    item.temporada
                )
                ===
                normalizarTexto(
                    valor
                )
            );

        }
    );

}


/* ============================================================
   34. FILTRO — STATUS
   ============================================================ */

function aplicarFiltroStatus(
    itens
) {

    if (
        !filtroStatusCategoria
    ) {

        return itens;

    }


    const valor =
        filtroStatusCategoria.value;


    if (
        !valor ||
        valor === "todos"
    ) {

        return itens;

    }


    return itens.filter(
        function (item) {

            const status =
                normalizarTexto(
                    item.status
                );


            if (
                valor === "armazem"
            ) {

                return (
                    status ===
                        "armazem"
                    ||
                    status ===
                        "no armazem"
                );

            }


            if (
                valor === "jogador"
            ) {

                return (
                    status ===
                        "jogador"
                    ||
                    status ===
                        "em posse de jogador"
                );

            }


            return (
                status ===
                normalizarTexto(
                    valor
                )
            );

        }
    );

}


/* ============================================================
   35. APLICAR TODOS OS FILTROS
   ============================================================ */

function aplicarFiltros() {

    let resultado =
        [
            ...itensAtuais
        ];


    /*
     * Pesquisa.
     */

    resultado =
        aplicarPesquisa(
            resultado
        );


    /*
     * Raridade.
     */

    resultado =
        aplicarFiltroRaridade(
            resultado
        );


    /*
     * Temporada.
     */

    resultado =
        aplicarFiltroTemporada(
            resultado
        );


    /*
     * Status.
     */

    resultado =
        aplicarFiltroStatus(
            resultado
        );


    /*
     * Renderização final.
     */

    renderizarItens(
        resultado
    );

}


/* ============================================================
   36. EVENTO — PESQUISA
   ============================================================ */

if (
    pesquisaItemCategoria
) {

    pesquisaItemCategoria.addEventListener(
        "input",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   37. EVENTO — RARIDADE
   ============================================================ */

if (
    filtroRaridadeCategoria
) {

    filtroRaridadeCategoria.addEventListener(
        "change",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   38. EVENTO — TEMPORADA
   ============================================================ */

if (
    filtroTemporadaCategoria
) {

    filtroTemporadaCategoria.addEventListener(
        "change",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   39. EVENTO — STATUS
   ============================================================ */

if (
    filtroStatusCategoria
) {

    filtroStatusCategoria.addEventListener(
        "change",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   40. TRATAMENTO GLOBAL DE IMAGENS
   ============================================================ */

document.addEventListener(
    "error",
    function (evento) {

        if (
            evento.target &&
            evento.target.tagName ===
            "IMG"
        ) {

            evento.target.style.opacity =
                "0.15";

        }

    },
    true
);


/* ============================================================
   41. INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarPaginaCategoria();

    }
);