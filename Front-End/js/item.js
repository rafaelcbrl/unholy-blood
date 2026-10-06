/* ============================================================
   UNHOLY BLOOD — ARQUIVO DA GUILDA
   ITEM.JS
   ============================================================

   RESPONSABILIDADE DESTE ARQUIVO:

   - Identificar o item pela URL
   - Buscar o item através da API
   - Exibir informações reais do item
   - Exibir categoria
   - Exibir raridade
   - Exibir temporada
   - Exibir status
   - Exibir proprietário
   - Exibir forma de aquisição
   - Exibir imagem
   - Exibir histórico
   - Permitir voltar para a categoria
   - Tratar item inexistente
   - Tratar erros da API

   IMPORTANTE:

   Este arquivo NÃO utiliza mais dados temporários.

   Todos os dados exibidos nesta página vêm do Back-End.
   ============================================================ */


/* ============================================================
   01. CONFIGURAÇÃO DA API
   ============================================================ */

const API_ITENS =
    "/api/itens";


/* ============================================================
   02. ELEMENTOS DA PÁGINA
   ============================================================ */

const tituloItem =
    document.getElementById(
        "titulo-item"
    );


const idItem =
    document.getElementById(
        "id-item"
    );


const descricaoItem =
    document.getElementById(
        "descricao-item"
    );


const raridadeItem =
    document.getElementById(
        "raridade-item"
    );


const temporadaItem =
    document.getElementById(
        "temporada-item"
    );


const statusItem =
    document.getElementById(
        "status-item"
    );


const donoItem =
    document.getElementById(
        "dono-item"
    );


const aquisicaoItem =
    document.getElementById(
        "aquisicao-item"
    );


const imagemItem =
    document.getElementById(
        "imagem-item"
    );


const imagemItemPlaceholder =
    document.getElementById(
        "imagem-item-placeholder"
    );


const breadcrumbCategoria =
    document.getElementById(
        "breadcrumb-categoria"
    );


const breadcrumbItem =
    document.getElementById(
        "breadcrumb-item"
    );


const linhaTempo =
    document.getElementById(
        "linha-tempo"
    );


const contadorHistorico =
    document.getElementById(
        "contador-historico"
    );


const historicoVazio =
    document.getElementById(
        "historico-vazio"
    );


const itemNaoEncontrado =
    document.getElementById(
        "item-nao-encontrado"
    );


const registroItem =
    document.querySelector(
        ".registro-item"
    );


const historicoSecao =
    document.querySelector(
        ".historico-item"
    );


/* ============================================================
   03. PEGAR ID DO ITEM PELA URL
   ============================================================

   Exemplo:

   item.html?id=abc123

   O valor "abc123" será usado para consultar:

   GET /api/itens/abc123
   ============================================================ */

const parametrosURL =
    new URLSearchParams(
        window.location.search
    );


const idAtual =
    parametrosURL.get(
        "id"
    );


/* ============================================================
   04. ESTADO ATUAL DO ITEM
   ============================================================ */

let itemAtual =
    null;


let carregandoItem =
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
   06. EXTRAIR ITEM DA RESPOSTA DA API
   ============================================================

   Aceita os formatos:

   {
       id: "...",
       nome: "..."
   }

   ou:

   {
       item: {...}
   }

   ou:

   {
       dados: {...}
   }
   ============================================================ */

function extrairItem(
    dados
) {

    if (
        !dados
    ) {

        return null;

    }


    /*
     * Resposta direta.
     */

    if (
        dados.id &&
        dados.nome
    ) {

        return dados;

    }


    /*
     * Resposta dentro de "item".
     */

    if (
        dados.item &&
        typeof dados.item ===
            "object"
    ) {

        return dados.item;

    }


    /*
     * Resposta dentro de "dados".
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
   07. NORMALIZAR TEXTO
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
   08. CARREGAR ITEM
   ============================================================ */

async function carregarItem() {

    if (
        !idAtual
    ) {

        mostrarItemNaoEncontrado();

        return;

    }


    const dados =
        await requisicaoAPI(
            `${API_ITENS}/${encodeURIComponent(
                idAtual
            )}`
        );


    itemAtual =
        extrairItem(
            dados
        );


    if (
        !itemAtual
    ) {

        throw new Error(
            "O item solicitado não foi encontrado."
        );

    }

}


/* ============================================================
   09. CARREGAR PÁGINA DO ITEM
   ============================================================ */

async function inicializarItem() {

    if (
        carregandoItem
    ) {

        return;

    }


    carregandoItem =
        true;


    mostrarCarregando();


    try {

        /*
         * Sem ID não existe item para consultar.
         */

        if (
            !idAtual
        ) {

            mostrarItemNaoEncontrado();

            return;

        }


        /*
         * Busca o item na API.
         */

        await carregarItem();


        /*
         * Confirma que o item foi encontrado.
         */

        if (
            !itemAtual
        ) {

            mostrarItemNaoEncontrado();

            return;

        }


        /*
         * Preenche as informações principais.
         */

        preencherInformacoes();


        /*
         * Carrega a imagem.

         */

        carregarImagem();


        /*
         * Renderiza o histórico.

         */

        renderizarHistorico();


        /*
         * Log para desenvolvimento.

         */

        console.log(
            "☩ Unholy Blood — Registro carregado pela API."
        );


        console.log(
            "Item:",
            itemAtual
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar item:",
            erro
        );


        /*
         * Caso o Back-End informe que o item não existe,
         * mostramos o estado específico.
         */

        if (
            erro &&
            erro.message &&
            (
                normalizarTexto(
                    erro.message
                ).includes(
                    "nao encontrado"
                )
                ||
                normalizarTexto(
                    erro.message
                ).includes(
                    "nao existe"
                )
            )
        ) {

            mostrarItemNaoEncontrado();

        } else {

            mostrarErro(
                erro
            );

        }


    } finally {

        carregandoItem =
            false;

    }

}


/* ============================================================
   10. FORMATAR RARIDADE
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
   11. FORMATAR TEMPORADA
   ============================================================ */

function formatarTemporada(
    temporada
) {

    if (
        !temporada
    ) {

        return "Não registrada";

    }


    const valor =
        String(
            temporada
        ).trim();


    const normalizado =
        normalizarTexto(
            valor
        );


    /*
     * Exemplo:

     * temporada-1
     *
     * vira:
     *
     * Temporada 1
     */

    if (
        normalizado.startsWith(
            "temporada-"
        )
    ) {

        return valor.replace(
            /temporada-/i,
            "Temporada "
        );

    }


    return valor;

}


/* ============================================================
   12. FORMATAR STATUS
   ============================================================ */

function formatarStatus(
    item
) {

    const status =
        normalizarTexto(
            item?.status
        );


    /* --------------------------------------------------------
       Item no armazém
    -------------------------------------------------------- */

    if (
        status ===
            "armazem"
        ||
        status ===
            "no armazem"
    ) {

        return "No Armazém";

    }


    /* --------------------------------------------------------
       Item com jogador
    -------------------------------------------------------- */

    if (
        status ===
            "jogador"
        ||
        status ===
            "em posse de jogador"
    ) {

        return "Em posse de jogador";

    }


    return "Não registrado";

}


/* ============================================================
   13. OBTER NOME DA CATEGORIA
   ============================================================ */

function obterNomeCategoria() {

    /*
     * O Back-End pode retornar "categoriaNome".
     */

    if (
        itemAtual &&
        itemAtual.categoriaNome
    ) {

        return itemAtual.categoriaNome;

    }


    /*
     * Ou pode retornar um objeto "categoria".
     */

    if (
        itemAtual &&
        itemAtual.categoria &&
        typeof itemAtual.categoria ===
            "object" &&
        itemAtual.categoria.nome
    ) {

        return itemAtual.categoria.nome;

    }


    /*
     * Fallback.

     * Se apenas o ID da categoria existir,
     * exibimos esse ID de forma legível.
     */

    if (
        itemAtual &&
        typeof itemAtual.categoria ===
            "string"
    ) {

        return itemAtual.categoria;

    }


    return "Categoria";

}


/* ============================================================
   14. OBTER ID DA CATEGORIA
   ============================================================ */

function obterIdCategoria() {

    if (
        !itemAtual
    ) {

        return "";

    }


    /*
     * Formato principal utilizado pelo Back-End.
     */

    if (
        itemAtual.categoriaId
    ) {

        return itemAtual.categoriaId;

    }


    /*
     * Compatibilidade caso a API utilize "categoria"
     * como ID diretamente.
     */

    if (
        typeof itemAtual.categoria ===
            "string"
    ) {

        return itemAtual.categoria;

    }


    /*
     * Compatibilidade com objeto categoria.
     */

    if (
        itemAtual.categoria &&
        typeof itemAtual.categoria ===
            "object" &&
        itemAtual.categoria.id
    ) {

        return itemAtual.categoria.id;

    }


    return "";

}


/* ============================================================
   15. OBTER NOME DO DONO
   ============================================================ */

function obterNomeDono() {

    if (
        !itemAtual
    ) {

        return "";

    }


    /*
     * Campo preparado pelo Back-End.
     */

    if (
        itemAtual.dono
    ) {

        return itemAtual.dono;

    }


    /*
     * Caso a API retorne um objeto jogador.
     */

    if (
        itemAtual.jogador &&
        typeof itemAtual.jogador ===
            "object"
    ) {

        return (
            itemAtual.jogador.nome
            ||
            itemAtual.jogador.minecraft
            ||
            ""
        );

    }


    return "";

}


/* ============================================================
   16. PREENCHER INFORMAÇÕES
   ============================================================ */

function preencherInformacoes() {

    if (
        !itemAtual
    ) {

        return;

    }


    /* --------------------------------------------------------
       Título
    -------------------------------------------------------- */

    if (
        tituloItem
    ) {

        tituloItem.textContent =
            itemAtual.nome ||
            "Item sem nome";

    }


    /* --------------------------------------------------------
       ID
    -------------------------------------------------------- */

    if (
        idItem
    ) {

        idItem.textContent =
            itemAtual.id ||
            "Não registrado";

    }


    /* --------------------------------------------------------
       Descrição
    -------------------------------------------------------- */

    if (
        descricaoItem
    ) {

        descricaoItem.textContent =
            itemAtual.descricao ||
            "Nenhuma descrição foi registrada para este item.";

    }


    /* --------------------------------------------------------
       Raridade
    -------------------------------------------------------- */

    if (
        raridadeItem
    ) {

        raridadeItem.textContent =
            formatarRaridade(
                itemAtual.raridade
            );


        /*
         * Remove classes antigas de raridade.

         */

        raridadeItem.classList.remove(
            "raridade-comum",
            "raridade-incomum",
            "raridade-raro",
            "raridade-epico",
            "raridade-lendario",
            "raridade-mitico"
        );


        const raridadeNormalizada =
            normalizarTexto(
                itemAtual.raridade
            )
                .replace(
                    /\s+/g,
                    "-"
                );


        if (
            raridadeNormalizada
        ) {

            raridadeItem.classList.add(
                `raridade-${raridadeNormalizada}`
            );

        }

    }


    /* --------------------------------------------------------
       Temporada
    -------------------------------------------------------- */

    if (
        temporadaItem
    ) {

        temporadaItem.textContent =
            formatarTemporada(
                itemAtual.temporada
            );

    }


    /* --------------------------------------------------------
       Status
    -------------------------------------------------------- */

    if (
        statusItem
    ) {

        statusItem.textContent =
            formatarStatus(
                itemAtual
            );


        statusItem.classList.remove(
            "status-armazem",
            "status-jogador"
        );


        const statusNormalizado =
            normalizarTexto(
                itemAtual.status
            )
                .replace(
                    /\s+/g,
                    "-"
                );


        if (
            statusNormalizado
        ) {

            statusItem.classList.add(
                `status-${statusNormalizado}`
            );

        }

    }


    /* --------------------------------------------------------
       Dono
    -------------------------------------------------------- */

    if (
        donoItem
    ) {

        donoItem.textContent =
            obterNomeDono()
            ||
            "Nenhum";

    }


    /* --------------------------------------------------------
       Aquisição
    -------------------------------------------------------- */

    if (
        aquisicaoItem
    ) {

        aquisicaoItem.textContent =
            itemAtual.aquisicao
            ||
            "Não registrada";

    }


    /* --------------------------------------------------------
       Breadcrumb — Categoria
    -------------------------------------------------------- */

    const nomeCategoria =
        obterNomeCategoria();


    const idDaCategoria =
        obterIdCategoria();


    if (
        breadcrumbCategoria
    ) {

        breadcrumbCategoria.textContent =
            nomeCategoria;


        if (
            idDaCategoria
        ) {

            breadcrumbCategoria.href =
                `categoria.html?id=${encodeURIComponent(
                    idDaCategoria
                )}`;

        } else {

            breadcrumbCategoria.removeAttribute(
                "href"
            );

        }

    }


    /* --------------------------------------------------------
       Breadcrumb — Item
    -------------------------------------------------------- */

    if (
        breadcrumbItem
    ) {

        breadcrumbItem.textContent =
            itemAtual.nome ||
            "Item";

    }


    /* --------------------------------------------------------
       Título da aba
    -------------------------------------------------------- */

    document.title =
        `${itemAtual.nome || "Registro"} | Unholy Blood`;

}


/* ============================================================
   17. CARREGAR IMAGEM
   ============================================================ */

function carregarImagem() {

    if (
        !imagemItem ||
        !imagemItemPlaceholder
    ) {

        return;

    }


    /*
     * Remove handlers antigos através de uma nova função.
     */

    imagemItem.onload =
        null;


    imagemItem.onerror =
        null;


    /*
     * Se não existe imagem cadastrada,
     * mostra o placeholder.
     */

    if (
        !itemAtual ||
        !itemAtual.imagem
    ) {

        imagemItem.removeAttribute(
            "src"
        );


        imagemItem.style.display =
            "none";


        imagemItemPlaceholder.style.display =
            "flex";


        return;

    }


    /*
     * Configura a imagem.
     */

    imagemItem.src =
        itemAtual.imagem;


    imagemItem.alt =
        itemAtual.nome ||
        "Item do arquivo";


    imagemItem.style.display =
        "block";


    imagemItemPlaceholder.style.display =
        "none";


    /*
     * Caso a imagem não carregue.
     */

    imagemItem.onerror =
        function () {

            imagemItem.style.display =
                "none";


            imagemItemPlaceholder.style.display =
                "flex";

        };

}


/* ============================================================
   18. NORMALIZAR HISTÓRICO
   ============================================================

   O Back-End trabalha com registros separados no banco,
   mas a resposta do item já pode trazer o histórico anexado.

   Esta função garante que diferentes formatos de data,
   título e descrição não quebrem a interface.
   ============================================================ */

function normalizarHistorico(
    historico
) {

    if (
        !Array.isArray(
            historico
        )
    ) {

        return [];

    }


    return historico.map(
        function (registro) {

            return {

                ...registro,

                data:
                    registro.data
                    ||
                    registro.dataFormatada
                    ||
                    registro.criadoEm
                    ||
                    "Data não registrada",

                titulo:
                    registro.titulo
                    ||
                    registro.tipo
                    ||
                    "Registro do arquivo",

                descricao:
                    registro.descricao
                    ||
                    "Nenhuma descrição registrada.",

                tipo:
                    registro.tipo
                    ||
                    "registro"

            };

        }
    );

}


/* ============================================================
   19. CRIAR REGISTRO DO HISTÓRICO
   ============================================================ */

function criarRegistroHistorico(
    registro,
    indice
) {

    const elemento =
        document.createElement(
            "article"
        );


    elemento.classList.add(
        "registro-historico"
    );


    elemento.dataset.tipo =
        registro.tipo
        ||
        "registro";


    /* --------------------------------------------------------
       Marcador
    -------------------------------------------------------- */

    const marcador =
        document.createElement(
            "div"
        );


    marcador.classList.add(
        "marcador-historico"
    );


    marcador.textContent =
        "✦";


    /* --------------------------------------------------------
       Conteúdo
    -------------------------------------------------------- */

    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.classList.add(
        "conteudo-historico"
    );


    /* --------------------------------------------------------
       Número
    -------------------------------------------------------- */

    const numero =
        document.createElement(
            "span"
        );


    numero.classList.add(
        "numero-historico"
    );


    numero.textContent =
        String(
            indice + 1
        ).padStart(
            2,
            "0"
        );


    /* --------------------------------------------------------
       Data
    -------------------------------------------------------- */

    const data =
        document.createElement(
            "span"
        );


    data.classList.add(
        "data-historico"
    );


    data.textContent =
        formatarDataHistorico(
            registro.data
        );


    /* --------------------------------------------------------
       Título
    -------------------------------------------------------- */

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        registro.titulo ||
        "Registro do arquivo";


    /* --------------------------------------------------------
       Descrição
    -------------------------------------------------------- */

    const descricao =
        document.createElement(
            "p"
        );


    descricao.textContent =
        registro.descricao ||
        "Nenhuma descrição registrada.";


    /* --------------------------------------------------------
       Topo
    -------------------------------------------------------- */

    const topo =
        document.createElement(
            "div"
        );


    topo.classList.add(
        "topo-historico"
    );


    topo.appendChild(
        numero
    );


    topo.appendChild(
        data
    );


    /* --------------------------------------------------------
       Montagem
    -------------------------------------------------------- */

    conteudo.appendChild(
        topo
    );


    conteudo.appendChild(
        titulo
    );


    conteudo.appendChild(
        descricao
    );


    elemento.appendChild(
        marcador
    );


    elemento.appendChild(
        conteudo
    );


    return elemento;

}


/* ============================================================
   20. FORMATAR DATA DO HISTÓRICO
   ============================================================ */

function formatarDataHistorico(
    valor
) {

    if (
        !valor
    ) {

        return "Data não registrada";

    }


    /*
     * Se já for uma data textual como:
     *
     * Temporada 1
     *
     * simplesmente mantém.
     */

    if (
        typeof valor ===
            "string" &&
        !valor.includes(
            "T"
        )
    ) {

        return valor;

    }


    /*
     * Tenta converter datas ISO vindas do Back-End.
     */

    const data =
        new Date(
            valor
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return String(
            valor
        );

    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }
    );

}


/* ============================================================
   21. RENDERIZAR HISTÓRICO
   ============================================================ */

function renderizarHistorico() {

    if (
        !linhaTempo
    ) {

        return;

    }


    linhaTempo.innerHTML =
        "";


    const historico =
        normalizarHistorico(
            itemAtual?.historico
        );


    /* --------------------------------------------------------
       Nenhum registro
    -------------------------------------------------------- */

    if (
        historico.length === 0
    ) {

        if (
            contadorHistorico
        ) {

            contadorHistorico.textContent =
                "00 REGISTROS";

        }


        if (
            historicoVazio
        ) {

            historicoVazio.hidden =
                false;

        }


        return;

    }


    /* --------------------------------------------------------
       Existem registros
    -------------------------------------------------------- */

    if (
        historicoVazio
    ) {

        historicoVazio.hidden =
            true;

    }


    if (
        contadorHistorico
    ) {

        contadorHistorico.textContent =
            String(
                historico.length
            ).padStart(
                2,
                "0"
            )
            +
            (
                historico.length === 1
                    ? " REGISTRO"
                    : " REGISTROS"
            );

    }


    /* --------------------------------------------------------
       Cria cada acontecimento
    -------------------------------------------------------- */

    historico.forEach(
        function (
            registro,
            indice
        ) {

            const elemento =
                criarRegistroHistorico(
                    registro,
                    indice
                );


            linhaTempo.appendChild(
                elemento
            );

        }
    );

}


/* ============================================================
   22. MOSTRAR ITEM NÃO ENCONTRADO
   ============================================================ */

function mostrarItemNaoEncontrado() {

    /*
     * Esconde o registro principal.
     */

    if (
        registroItem
    ) {

        registroItem.style.display =
            "none";

    }


    /*
     * Esconde o histórico.
     */

    if (
        historicoSecao
    ) {

        historicoSecao.style.display =
            "none";

    }


    /*
     * Mostra a mensagem própria.
     */

    if (
        itemNaoEncontrado
    ) {

        itemNaoEncontrado.hidden =
            false;

    }


    document.title =
        "Registro não encontrado | Unholy Blood";

}


/* ============================================================
   23. MOSTRAR CARREGAMENTO
   ============================================================ */

function mostrarCarregando() {

    if (
        registroItem
    ) {

        registroItem.style.display =
            "";

    }


    if (
        historicoSecao
    ) {

        historicoSecao.style.display =
            "";

    }


    if (
        itemNaoEncontrado
    ) {

        itemNaoEncontrado.hidden =
            true;

    }


    if (
        tituloItem
    ) {

        tituloItem.textContent =
            "Consultando arquivo...";

    }


    if (
        idItem
    ) {

        idItem.textContent =
            "CARREGANDO";

    }


    if (
        descricaoItem
    ) {

        descricaoItem.textContent =
            "Recuperando os dados deste registro.";

    }


    if (
        contadorHistorico
    ) {

        contadorHistorico.textContent =
            "00 REGISTROS";

    }


    document.title =
        "Consultando registro | Unholy Blood";

}


/* ============================================================
   24. MOSTRAR ERRO
   ============================================================ */

function mostrarErro(
    erro
) {

    const mensagem =
        erro &&
        erro.message

            ? erro.message

            : "Não foi possível consultar este registro.";


    if (
        registroItem
    ) {

        registroItem.style.display =
            "none";

    }


    if (
        historicoSecao
    ) {

        historicoSecao.style.display =
            "none";

    }


    if (
        itemNaoEncontrado
    ) {

        itemNaoEncontrado.hidden =
            false;


        const tituloErro =
            itemNaoEncontrado.querySelector(
                "h2, h3"
            );


        const textoErro =
            itemNaoEncontrado.querySelector(
                "p"
            );


        if (
            tituloErro
        ) {

            tituloErro.textContent =
                "Falha ao consultar o arquivo.";

        }


        if (
            textoErro
        ) {

            textoErro.textContent =
                mensagem;

        }

    }


    document.title =
        "Erro no registro | Unholy Blood";

}


/* ============================================================
   25. TRATAMENTO GLOBAL DE IMAGENS
   ============================================================ */

document.addEventListener(
    "error",
    function (evento) {

        if (
            evento.target &&
            evento.target.tagName ===
            "IMG"
        ) {

            /*
             * A imagem principal possui seu próprio tratamento,
             * então aqui apenas aplicamos uma proteção geral.
             */

            if (
                evento.target !==
                imagemItem
            ) {

                evento.target.style.opacity =
                    "0.15";

            }

        }

    },
    true
);


/* ============================================================
   26. INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarItem();

    }
);