/* ============================================================
   UNHOLY BLOOD — ARQUIVO DA GUILDA
   CATALOGO.JS
   ============================================================

   RESPONSABILIDADE DESTE ARQUIVO:

   - Carregar categorias através da API
   - Carregar itens através da API
   - Exibir as categorias dinamicamente
   - Mostrar a quantidade real de itens
   - Pesquisar categorias
   - Filtrar por raridade
   - Filtrar por temporada
   - Filtrar por status
   - Atualizar os filtros dinamicamente
   - Tratar estados vazios
   - Tratar erros da API
   - Manter a navegação para as páginas de categoria

   IMPORTANTE:

   Este arquivo NÃO possui mais dados temporários.

   Os dados exibidos aqui vêm do Back-End.
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

const gradeCategorias =
    document.getElementById(
        "grade-categorias"
    );


const contadorCategorias =
    document.getElementById(
        "contador-categorias"
    );


const estadoVazio =
    document.getElementById(
        "estado-vazio"
    );


const pesquisaItem =
    document.getElementById(
        "pesquisa-item"
    );


const filtroRaridade =
    document.getElementById(
        "filtro-raridade"
    );


const filtroTemporada =
    document.getElementById(
        "filtro-temporada"
    );


const filtroStatus =
    document.getElementById(
        "filtro-status"
    );


/* ============================================================
   03. ESTADO ATUAL DO CATÁLOGO
   ============================================================ */

let categoriasAtuais = [];

let itensAtuais = [];

let carregandoCatalogo = false;


/* ============================================================
   04. REQUISIÇÃO GENÉRICA PARA A API
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


    let dados = null;


    try {

        dados =
            await resposta.json();

    } catch (erro) {

        dados = null;

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
   05. NORMALIZAR RESPOSTA DA API
   ============================================================

   Dependendo de como a resposta for enviada pelo Back-End,
   podemos receber:

   [
       ...
   ]

   ou:

   {
       categorias: [...]
   }

   ou:

   {
       itens: [...]
   }

   Esta função permite que o Front-End aceite os formatos
   previstos sem quebrar.
   ============================================================ */

function extrairLista(
    dados,
    propriedade
) {

    if (
        Array.isArray(dados)
    ) {

        return dados;

    }


    if (
        dados &&
        Array.isArray(
            dados[propriedade]
        )
    ) {

        return dados[propriedade];

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
   06. CARREGAR CATEGORIAS
   ============================================================ */

async function carregarCategorias() {

    const dados =
        await requisicaoAPI(
            API_CATEGORIAS
        );


    categoriasAtuais =
        extrairLista(
            dados,
            "categorias"
        );


    /*
     * Garante que cada categoria tenha uma quantidade válida.
     *
     * O Back-End já calcula a quantidade, mas fazemos uma
     * proteção aqui para evitar problemas caso alguma categoria
     * venha sem esse campo.
     */

    categoriasAtuais =
        categoriasAtuais.map(
            function (categoria) {

                return {
                    ...categoria,

                    quantidade:
                        Number(
                            categoria.quantidade
                        ) || 0
                };

            }
        );

}


/* ============================================================
   07. CARREGAR ITENS
   ============================================================ */

async function carregarItens() {

    const dados =
        await requisicaoAPI(
            API_ITENS
        );


    itensAtuais =
        extrairLista(
            dados,
            "itens"
        );

}


/* ============================================================
   08. CARREGAR TODO O CATÁLOGO
   ============================================================ */

async function carregarCatalogo() {

    if (
        carregandoCatalogo
    ) {

        return;

    }


    carregandoCatalogo =
        true;


    mostrarCarregando();


    try {

        /*
         * As duas consultas podem acontecer ao mesmo tempo.
         */

        await Promise.all(
            [
                carregarCategorias(),
                carregarItens()
            ]
        );


        /*
         * Atualiza os filtros usando os dados reais.
         */

        atualizarFiltroRaridade();

        atualizarFiltroTemporada();

        atualizarFiltroStatus();


        /*
         * Mostra as categorias.
         */

        aplicarFiltros();


        console.log(
            "☩ Unholy Blood — Catálogo carregado pela API."
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar o catálogo:",
            erro
        );


        mostrarErro(
            erro
        );


    } finally {

        carregandoCatalogo =
            false;

    }

}


/* ============================================================
   09. CRIAR CARD DE CATEGORIA
   ============================================================ */

function criarCardCategoria(
    categoria
) {

    const card =
        document.createElement(
            "a"
        );


    /* --------------------------------------------------------
       Configurações básicas
    -------------------------------------------------------- */

    card.classList.add(
        "card-categoria"
    );


    card.href =
        `categoria.html?id=${encodeURIComponent(
            categoria.id
        )}`;


    card.setAttribute(
        "aria-label",
        `Abrir categoria ${categoria.nome}`
    );


    /* --------------------------------------------------------
       Imagem
    -------------------------------------------------------- */

    const imagem =
        document.createElement(
            "img"
        );


    imagem.classList.add(
        "card-categoria-imagem"
    );


    /*
     * Caso a categoria não possua imagem, utilizamos uma string
     * vazia para evitar que o navegador tente carregar "undefined".
     */

    imagem.src =
        categoria.imagem ||
        "";


    imagem.alt =
        `Categoria ${categoria.nome}`;


    imagem.loading =
        "lazy";


    /* --------------------------------------------------------
       Tratamento individual da imagem
    -------------------------------------------------------- */

    imagem.addEventListener(
        "error",
        function () {

            imagem.style.opacity =
                "0.15";

        }
    );


    /* --------------------------------------------------------
       Conteúdo
    -------------------------------------------------------- */

    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.classList.add(
        "card-categoria-conteudo"
    );


    /* --------------------------------------------------------
       Pré-título
    -------------------------------------------------------- */

    const preTitulo =
        document.createElement(
            "span"
        );


    preTitulo.classList.add(
        "card-categoria-pre-titulo"
    );


    preTitulo.textContent =
        "CATEGORIA DO ARQUIVO";


    /* --------------------------------------------------------
       Nome
    -------------------------------------------------------- */

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        categoria.nome ||
        "Categoria sem nome";


    /* --------------------------------------------------------
       Informações
    -------------------------------------------------------- */

    const informacoes =
        document.createElement(
            "div"
        );


    informacoes.classList.add(
        "card-categoria-info"
    );


    /* --------------------------------------------------------
       Quantidade
    -------------------------------------------------------- */

    const quantidade =
        document.createElement(
            "span"
        );


    quantidade.classList.add(
        "card-categoria-quantidade"
    );


    quantidade.textContent =
        formatarQuantidade(
            categoria.quantidade
        );


    /* --------------------------------------------------------
       Seta
    -------------------------------------------------------- */

    const seta =
        document.createElement(
            "span"
        );


    seta.classList.add(
        "card-categoria-seta"
    );


    seta.textContent =
        "→";


    /* --------------------------------------------------------
       Montagem
    -------------------------------------------------------- */

    informacoes.appendChild(
        quantidade
    );


    informacoes.appendChild(
        seta
    );


    conteudo.appendChild(
        preTitulo
    );


    conteudo.appendChild(
        titulo
    );


    conteudo.appendChild(
        informacoes
    );


    card.appendChild(
        imagem
    );


    card.appendChild(
        conteudo
    );


    return card;

}


/* ============================================================
   10. FORMATAR QUANTIDADE
   ============================================================ */

function formatarQuantidade(
    quantidade
) {

    const numero =
        Number(
            quantidade
        ) || 0;


    if (
        numero === 1
    ) {

        return "01 ITEM";

    }


    return (
        String(
            numero
        ).padStart(
            2,
            "0"
        )
        + " ITENS"
    );

}


/* ============================================================
   11. MOSTRAR CATEGORIAS
   ============================================================ */

function renderizarCategorias(
    categorias
) {

    if (!gradeCategorias) {

        return;

    }


    /*
     * Limpa o conteúdo atual.
     */

    gradeCategorias.innerHTML =
        "";


    /*
     * Nenhuma categoria encontrada.
     */

    if (
        !categorias ||
        categorias.length === 0
    ) {

        mostrarEstadoVazio();

        atualizarContadorCategorias(
            0
        );

        return;

    }


    /*
     * Esconde o estado vazio.
     */

    if (estadoVazio) {

        estadoVazio.style.display =
            "none";

    }


    /*
     * Cria os cards.
     */

    categorias.forEach(
        function (categoria) {

            const card =
                criarCardCategoria(
                    categoria
                );


            gradeCategorias.appendChild(
                card
            );

        }
    );


    /*
     * Atualiza contador.
     */

    atualizarContadorCategorias(
        categorias.length
    );

}


/* ============================================================
   12. ESTADO VAZIO
   ============================================================ */

function mostrarEstadoVazio() {

    if (!gradeCategorias) {

        return;

    }


    /*
     * Se o HTML já possui um estado vazio,
     * utilizamos o próprio elemento.
     */

    if (estadoVazio) {

        estadoVazio.style.display =
            "block";


        /*
         * Garante que o estado vazio não fique duplicado
         * dentro da grade.
         */

        if (
            estadoVazio.parentElement !==
            gradeCategorias
        ) {

            gradeCategorias.appendChild(
                estadoVazio
            );

        }


        return;

    }


    /*
     * Fallback caso o elemento não exista no HTML.
     */

    const vazio =
        document.createElement(
            "div"
        );


    vazio.classList.add(
        "estado-vazio"
    );


    vazio.innerHTML = `

        <div class="estado-vazio-simbolo">
            ✦
        </div>

        <h3>
            Nenhuma categoria encontrada.
        </h3>

        <p>
            O arquivo não possui registros
            correspondentes aos filtros selecionados.
        </p>

    `;


    gradeCategorias.appendChild(
        vazio
    );

}


/* ============================================================
   13. ESTADO DE CARREGAMENTO
   ============================================================ */

function mostrarCarregando() {

    if (!gradeCategorias) {

        return;

    }


    gradeCategorias.innerHTML = `

        <div class="estado-vazio">

            <div class="estado-vazio-simbolo">
                ✦
            </div>

            <h3>
                Consultando os arquivos...
            </h3>

            <p>
                O Arquivo da Unholy Blood está
                recuperando os registros da guilda.
            </p>

        </div>

    `;


    if (estadoVazio) {

        estadoVazio.style.display =
            "none";

    }


    atualizarContadorCategorias(
        0
    );

}


/* ============================================================
   14. ESTADO DE ERRO
   ============================================================ */

function mostrarErro(
    erro
) {

    if (!gradeCategorias) {

        return;

    }


    const mensagem =
        erro &&
        erro.message

            ? erro.message

            : "Não foi possível carregar os registros.";


    gradeCategorias.innerHTML = `

        <div class="estado-vazio">

            <div class="estado-vazio-simbolo">
                ⚠
            </div>

            <h3>
                Falha ao consultar o arquivo.
            </h3>

            <p>
                ${escaparHTML(mensagem)}
            </p>

            <button
                type="button"
                class="botao-tentar-novamente"
                id="botao-tentar-novamente"
            >
                Tentar novamente
            </button>

        </div>

    `;


    atualizarContadorCategorias(
        0
    );


    const botao =
        document.getElementById(
            "botao-tentar-novamente"
        );


    if (botao) {

        botao.addEventListener(
            "click",
            function () {

                carregarCatalogo();

            }
        );

    }

}


/* ============================================================
   15. ESCAPAR HTML
   ============================================================

   Usado somente para mensagens vindas da API/erro.

   Isso evita inserir diretamente conteúdo externo
   dentro do innerHTML.
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
   16. CONTADOR DE CATEGORIAS
   ============================================================ */

function atualizarContadorCategorias(
    quantidade
) {

    if (!contadorCategorias) {

        return;

    }


    const numero =
        Number(
            quantidade
        ) || 0;


    if (
        numero === 1
    ) {

        contadorCategorias.textContent =
            "1 CATEGORIA";


        return;

    }


    contadorCategorias.textContent =
        `${numero} CATEGORIAS`;

}


/* ============================================================
   17. NORMALIZAR TEXTO
   ============================================================

   Serve para pesquisas sem diferença entre:

   "Pokémon"
   "pokemon"
   "POKEMON"

   e também para acentos.
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
   18. PESQUISA POR NOME
   ============================================================ */

function pesquisarCategorias(
    categorias
) {

    if (!pesquisaItem) {

        return categorias;

    }


    const termo =
        normalizarTexto(
            pesquisaItem.value
        );


    if (!termo) {

        return categorias;

    }


    return categorias.filter(
        function (categoria) {

            const nome =
                normalizarTexto(
                    categoria.nome
                );


            const descricao =
                normalizarTexto(
                    categoria.descricao
                );


            return (
                nome.includes(
                    termo
                )
                ||
                descricao.includes(
                    termo
                )
            );

        }
    );

}


/* ============================================================
   19. OBTER ITENS DE UMA CATEGORIA
   ============================================================ */

function obterItensDaCategoria(
    categoriaId
) {

    return itensAtuais.filter(
        function (item) {

            return String(
                item.categoriaId
            ) === String(
                categoriaId
            );

        }
    );

}


/* ============================================================
   20. VERIFICAR STATUS DO ITEM
   ============================================================ */

function itemPossuiStatus(
    item,
    status
) {

    if (
        !item
    ) {

        return false;

    }


    const statusItem =
        String(
            item.status ?? ""
        )
            .toLowerCase()
            .trim();


    if (
        status ===
        "armazem"
    ) {

        return (
            statusItem ===
                "armazem"
            ||
            statusItem ===
                "no armazem"
            ||
            statusItem ===
                "no armazém"
        );

    }


    if (
        status ===
        "jogador"
    ) {

        return (
            statusItem ===
                "jogador"
            ||
            statusItem ===
                "em posse de jogador"
        );

    }


    return true;

}


/* ============================================================
   21. FILTRO DE RARIDADE
   ============================================================ */

function aplicarFiltroRaridade(
    categorias
) {

    if (!filtroRaridade) {

        return categorias;

    }


    const valor =
        filtroRaridade.value;


    if (
        !valor ||
        valor === "todas"
    ) {

        return categorias;

    }


    return categorias.filter(
        function (categoria) {

            const itens =
                obterItensDaCategoria(
                    categoria.id
                );


            return itens.some(
                function (item) {

                    return normalizarTexto(
                        item.raridade
                    ) ===
                    normalizarTexto(
                        valor
                    );

                }
            );

        }
    );

}


/* ============================================================
   22. FILTRO DE TEMPORADA
   ============================================================ */

function aplicarFiltroTemporada(
    categorias
) {

    if (!filtroTemporada) {

        return categorias;

    }


    const valor =
        filtroTemporada.value;


    if (
        !valor ||
        valor === "todas"
    ) {

        return categorias;

    }


    return categorias.filter(
        function (categoria) {

            const itens =
                obterItensDaCategoria(
                    categoria.id
                );


            return itens.some(
                function (item) {

                    return normalizarTexto(
                        item.temporada
                    ) ===
                    normalizarTexto(
                        valor
                    );

                }
            );

        }
    );

}


/* ============================================================
   23. FILTRO DE STATUS
   ============================================================ */

function aplicarFiltroStatus(
    categorias
) {

    if (!filtroStatus) {

        return categorias;

    }


    const valor =
        filtroStatus.value;


    if (
        !valor ||
        valor === "todos"
    ) {

        return categorias;

    }


    return categorias.filter(
        function (categoria) {

            const itens =
                obterItensDaCategoria(
                    categoria.id
                );


            return itens.some(
                function (item) {

                    return itemPossuiStatus(
                        item,
                        valor
                    );

                }
            );

        }
    );

}


/* ============================================================
   24. APLICAR TODOS OS FILTROS
   ============================================================ */

function aplicarFiltros() {

    let resultado =
        [
            ...categoriasAtuais
        ];


    /*
     * Pesquisa.
     */

    resultado =
        pesquisarCategorias(
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

    renderizarCategorias(
        resultado
    );

}


/* ============================================================
   25. OBTER VALORES ÚNICOS
   ============================================================ */

function obterValoresUnicos(
    itens,
    propriedade
) {

    const valores =
        itens
            .map(
                function (item) {

                    return String(
                        item?.[propriedade] ?? ""
                    ).trim();

                }
            )
            .filter(
                function (valor) {

                    return valor !== "";

                }
            );


    /*
     * Remove duplicados ignorando diferença de maiúsculas,
     * minúsculas e acentuação, mas preserva a primeira forma
     * encontrada para exibição.
     */

    const mapa =
        new Map();


    valores.forEach(
        function (valor) {

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
   26. ATUALIZAR FILTRO DE RARIDADE
   ============================================================ */

function atualizarFiltroRaridade() {

    if (!filtroRaridade) {

        return;

    }


    const valorAtual =
        filtroRaridade.value;


    const raridades =
        obterValoresUnicos(
            itensAtuais,
            "raridade"
        );


    filtroRaridade.innerHTML =
        "";


    const opcaoTodas =
        document.createElement(
            "option"
        );


    opcaoTodas.value =
        "todas";


    opcaoTodas.textContent =
        "Todas as raridades";


    filtroRaridade.appendChild(
        opcaoTodas
    );


    raridades.forEach(
        function (raridade) {

            const opcao =
                document.createElement(
                    "option"
                );


            opcao.value =
                raridade;


            opcao.textContent =
                raridade;


            filtroRaridade.appendChild(
                opcao
            );

        }
    );


    /*
     * Recupera a seleção anterior caso ela ainda exista.
     */

    const opcaoExiste =
        Array.from(
            filtroRaridade.options
        ).some(
            function (opcao) {

                return (
                    normalizarTexto(
                        opcao.value
                    ) ===
                    normalizarTexto(
                        valorAtual
                    )
                );

            }
        );


    if (opcaoExiste) {

        filtroRaridade.value =
            valorAtual;

    } else {

        filtroRaridade.value =
            "todas";

    }

}


/* ============================================================
   27. ATUALIZAR FILTRO DE TEMPORADA
   ============================================================ */

function atualizarFiltroTemporada() {

    if (!filtroTemporada) {

        return;

    }


    const valorAtual =
        filtroTemporada.value;


    const temporadas =
        obterValoresUnicos(
            itensAtuais,
            "temporada"
        );


    filtroTemporada.innerHTML =
        "";


    const opcaoTodas =
        document.createElement(
            "option"
        );


    opcaoTodas.value =
        "todas";


    opcaoTodas.textContent =
        "Todas as temporadas";


    filtroTemporada.appendChild(
        opcaoTodas
    );


    temporadas.forEach(
        function (temporada) {

            const opcao =
                document.createElement(
                    "option"
                );


            opcao.value =
                temporada;


            opcao.textContent =
                temporada;


            filtroTemporada.appendChild(
                opcao
            );

        }
    );


    const opcaoExiste =
        Array.from(
            filtroTemporada.options
        ).some(
            function (opcao) {

                return (
                    normalizarTexto(
                        opcao.value
                    ) ===
                    normalizarTexto(
                        valorAtual
                    )
                );

            }
        );


    if (opcaoExiste) {

        filtroTemporada.value =
            valorAtual;

    } else {

        filtroTemporada.value =
            "todas";

    }

}


/* ============================================================
   28. ATUALIZAR FILTRO DE STATUS
   ============================================================ */

function atualizarFiltroStatus() {

    if (!filtroStatus) {

        return;

    }


    /*
     * O status é controlado pelo sistema e não pelos usuários.
     *
     * Portanto, mantemos apenas os dois estados oficiais.
     */

    const valorAtual =
        filtroStatus.value;


    filtroStatus.innerHTML =
        "";


    const opcaoTodos =
        document.createElement(
            "option"
        );


    opcaoTodos.value =
        "todos";


    opcaoTodos.textContent =
        "Todos os status";


    filtroStatus.appendChild(
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


    filtroStatus.appendChild(
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


    filtroStatus.appendChild(
        opcaoJogador
    );


    const opcaoExiste =
        Array.from(
            filtroStatus.options
        ).some(
            function (opcao) {

                return (
                    opcao.value ===
                    valorAtual
                );

            }
        );


    if (opcaoExiste) {

        filtroStatus.value =
            valorAtual;

    } else {

        filtroStatus.value =
            "todos";

    }

}


/* ============================================================
   29. EVENTO — PESQUISA
   ============================================================ */

if (pesquisaItem) {

    pesquisaItem.addEventListener(
        "input",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   30. EVENTO — RARIDADE
   ============================================================ */

if (filtroRaridade) {

    filtroRaridade.addEventListener(
        "change",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   31. EVENTO — TEMPORADA
   ============================================================ */

if (filtroTemporada) {

    filtroTemporada.addEventListener(
        "change",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   32. EVENTO — STATUS
   ============================================================ */

if (filtroStatus) {

    filtroStatus.addEventListener(
        "change",
        function () {

            aplicarFiltros();

        }
    );

}


/* ============================================================
   33. TRATAMENTO GLOBAL DE IMAGENS
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
   34. INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarCatalogo();

    }
);