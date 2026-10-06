/* ============================================================
   UNHOLY BLOOD
   ROTAS DE ITENS
   ============================================================ */


/* ============================================================
   01. IMPORTAÇÕES
   ============================================================ */

const express = require("express");


/* ============================================================
   02. FUNÇÃO PRINCIPAL DAS ROTAS
   ============================================================ */

function criarRotasItens(
    dependencias
) {

    const {
        supabase,
        gerarId,
        obterDataAtual
    } = dependencias;


    const router =
        express.Router();


    /* ========================================================
       03. FUNÇÕES AUXILIARES
       ======================================================== */


    /*
     * Normaliza textos para pesquisas e comparações.
     */

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


    /*
     * Procura uma categoria pelo ID.
     *
     * A categoria agora vem diretamente do Supabase.
     */

    async function encontrarCategoria(
        categoriaId
    ) {

        if (
            !categoriaId
        ) {

            return null;

        }


        const resultado =
            await supabase
                .from("categorias")
                .select("*")
                .eq(
                    "id",
                    categoriaId
                )
                .maybeSingle();


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        return resultado.data || null;

    }


    /*
     * Procura um jogador pelo ID.
     */

    async function encontrarJogador(
        jogadorId
    ) {

        if (
            !jogadorId
        ) {

            return null;

        }


        const resultado =
            await supabase
                .from("jogadores")
                .select("*")
                .eq(
                    "id",
                    jogadorId
                )
                .maybeSingle();


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        return resultado.data || null;

    }


    /*
     * Procura um item pelo ID.
     */

    async function encontrarItem(
        itemId
    ) {

        if (
            !itemId
        ) {

            return null;

        }


        const resultado =
            await supabase
                .from("itens")
                .select("*")
                .eq(
                    "id",
                    itemId
                )
                .maybeSingle();


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        return resultado.data || null;

    }


    /*
     * Converte o status vindo do Front-End
     * para o formato interno utilizado pelo Back-End.
     */

    function normalizarStatus(
        status
    ) {

        const valor =
            normalizarTexto(
                status
            );


        if (
            valor === "armazem" ||
            valor === "no armazem"
        ) {

            return "armazem";

        }


        if (
            valor === "jogador" ||
            valor === "em posse de jogador"
        ) {

            return "jogador";

        }


        return null;

    }


    /*
     * Converte o status interno para um texto
     * amigável para o Front-End.
     */

    function formatarStatus(
        status
    ) {

        if (
            status === "armazem"
        ) {

            return "No Armazém";

        }


        if (
            status === "jogador"
        ) {

            return "Em posse de jogador";

        }


        return "Indefinido";

    }


    /*
     * Procura o nome do jogador responsável
     * pela posse do item.
     */

    async function obterNomeJogador(
        jogadorId
    ) {

        const jogador =
            await encontrarJogador(
                jogadorId
            );


        if (
            !jogador
        ) {

            return null;

        }


        return (
            jogador.nome ||
            jogador.minecraft ||
            null
        );

    }


    /*
     * Monta o objeto final enviado para o Front-End.
     *
     * O banco guarda jogadorId.
     * A API também entrega dono com o nome do jogador
     * para facilitar a utilização das páginas atuais.
     */

    async function prepararItem(
        item
    ) {

        const categoria =
            await encontrarCategoria(
                item.categoriaId
            );


        const jogador =
            await encontrarJogador(
                item.jogadorId
            );


        const resultadoHistorico =
            await supabase
                .from("historico")
                .select("*")
                .eq(
                    "itemId",
                    item.id
                )
                .order(
                    "data",
                    {
                        ascending: false
                    }
                );


        if (
            resultadoHistorico.error
        ) {

            throw resultadoHistorico.error;

        }


        const historico =
            resultadoHistorico.data || [];


        return {

            ...item,

            categoriaNome:
                categoria
                    ? categoria.nome
                    : "Categoria não encontrada",

            statusTexto:
                formatarStatus(
                    item.status
                ),

            jogador:
                jogador
                    ? {

                        id:
                            jogador.id,

                        nome:
                            jogador.nome ||
                            jogador.minecraft ||
                            "Jogador"

                    }
                    : null,

            dono:
                jogador
                    ? (
                        jogador.nome ||
                        jogador.minecraft ||
                        null
                    )
                    : null,

            historico:
                historico

        };

    }


    /*
     * Adiciona um registro ao histórico.
     */

    async function adicionarHistorico(
        dados
    ) {

        const registro = {

            id:
                gerarId(
                    "historico"
                ),

            itemId:
                dados.itemId,

            tipo:
                dados.tipo,

            descricao:
                dados.descricao,

            jogadorId:
                dados.jogadorId ||
                null,

            data:
                obterDataAtual()

        };


        const resultado =
            await supabase
                .from("historico")
                .insert(registro)
                .select("*")
                .single();


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        return resultado.data;

    }


    /*
     * Verifica se o nome do item já existe
     * dentro da mesma categoria.
     */

    async function encontrarItemDuplicado(
        categoriaId,
        nome,
        ignorarId = null
    ) {

        const nomeNormalizado =
            normalizarTexto(
                nome
            );


        const resultado =
            await supabase
                .from("itens")
                .select(
                    "id,nome,categoriaId"
                )
                .eq(
                    "categoriaId",
                    categoriaId
                );


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        return (
            resultado.data || []
        ).find(
            function (
                item
            ) {

                return (

                    item.id !==
                    ignorarId

                    &&

                    normalizarTexto(
                        item.nome
                    ) ===
                    nomeNormalizado

                );

            }
        ) || null;

    }


    /* ========================================================
       04. GET — LISTAR ITENS
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/itens
     *
     * Filtros opcionais:
     *
     * ?busca=
     * ?categoria=
     * ?raridade=
     * ?temporada=
     * ?status=
     * ?jogador=
     */

    router.get(
        "/",
        async function (
            req,
            res
        ) {

            try {

                const resultadoBusca =
                    await supabase
                        .from("itens")
                        .select("*");


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                let itens =
                    resultadoBusca.data || [];


                /* --------------------------------------------
                   FILTRO POR TEXTO
                -------------------------------------------- */

                const busca =
                    String(
                        req.query.busca || ""
                    ).trim();


                if (
                    busca
                ) {

                    const buscaNormalizada =
                        normalizarTexto(
                            busca
                        );


                    itens =
                        itens.filter(
                            function (
                                item
                            ) {

                                const nome =
                                    normalizarTexto(
                                        item.nome
                                    );


                                const descricao =
                                    normalizarTexto(
                                        item.descricao
                                    );


                                return (

                                    nome.includes(
                                        buscaNormalizada
                                    )

                                    ||

                                    descricao.includes(
                                        buscaNormalizada
                                    )

                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR CATEGORIA
                -------------------------------------------- */

                const categoriaId =
                    String(
                        req.query.categoria || ""
                    ).trim();


                if (
                    categoriaId
                ) {

                    itens =
                        itens.filter(
                            function (
                                item
                            ) {

                                return (
                                    item.categoriaId ===
                                    categoriaId
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR RARIDADE
                -------------------------------------------- */

                const raridade =
                    String(
                        req.query.raridade || ""
                    ).trim();


                if (
                    raridade &&
                    raridade !== "todos"
                ) {

                    const raridadeNormalizada =
                        normalizarTexto(
                            raridade
                        );


                    itens =
                        itens.filter(
                            function (
                                item
                            ) {

                                return (
                                    normalizarTexto(
                                        item.raridade
                                    ) ===
                                    raridadeNormalizada
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR TEMPORADA
                -------------------------------------------- */

                const temporada =
                    String(
                        req.query.temporada || ""
                    ).trim();


                if (
                    temporada &&
                    temporada !== "todos"
                ) {

                    const temporadaNormalizada =
                        normalizarTexto(
                            temporada
                        );


                    itens =
                        itens.filter(
                            function (
                                item
                            ) {

                                return (
                                    normalizarTexto(
                                        item.temporada
                                    ) ===
                                    temporadaNormalizada
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR STATUS
                -------------------------------------------- */

                const statusRecebido =
                    req.query.status;


                if (
                    statusRecebido &&
                    statusRecebido !== "todos"
                ) {

                    const status =
                        normalizarStatus(
                            statusRecebido
                        );


                    if (
                        status
                    ) {

                        itens =
                            itens.filter(
                                function (
                                    item
                                ) {

                                    return (
                                        item.status ===
                                        status
                                    );

                                }
                            );

                    }

                }


                /* --------------------------------------------
                   FILTRO POR JOGADOR
                -------------------------------------------- */

                const jogadorId =
                    String(
                        req.query.jogador || ""
                    ).trim();


                if (
                    jogadorId
                ) {

                    itens =
                        itens.filter(
                            function (
                                item
                            ) {

                                return (
                                    item.jogadorId ===
                                    jogadorId
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   PREPARAR RESULTADO
                -------------------------------------------- */

                const resultado =
                    await Promise.all(
                        itens.map(
                            function (
                                item
                            ) {

                                return prepararItem(
                                    item
                                );

                            }
                        )
                    );


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        total:
                            resultado.length,

                        itens:
                            resultado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao listar itens:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível carregar os itens."

                    });

            }

        }
    );


    /* ========================================================
       05. GET — BUSCAR ITEM POR ID
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/itens/:id
     */

    router.get(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                const item =
                    await encontrarItem(
                        req.params.id
                    );


                if (
                    !item
                ) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Item não encontrado."

                        });

                }


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        item:
                            await prepararItem(
                                item
                            )

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao buscar item:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível buscar o item."

                    });

            }

        }
    );


    /* ========================================================
       06. POST — CRIAR ITEM
       ======================================================== */


    /*
     * URL:
     *
     * POST /api/itens
     *
     * Corpo:
     *
     * {
     *     "categoriaId": "...",
     *     "nome": "...",
     *     "imagem": "...",
     *     "raridade": "...",
     *     "temporada": "...",
     *     "aquisicao": "...",
     *     "status": "armazem",
     *     "jogadorId": null,
     *     "descricao": "..."
     * }
     */

    router.post(
        "/",
        async function (
            req,
            res
        ) {

            try {

                const categoriaId =
                    String(
                        req.body.categoriaId || ""
                    ).trim();


                const nome =
                    String(
                        req.body.nome || ""
                    ).trim();


                const imagem =
                    String(
                        req.body.imagem || ""
                    ).trim();


                const raridade =
                    String(
                        req.body.raridade || ""
                    ).trim();


                const temporada =
                    String(
                        req.body.temporada || ""
                    ).trim();


                const aquisicao =
                    String(
                        req.body.aquisicao || ""
                    ).trim();


                const descricao =
                    String(
                        req.body.descricao || ""
                    ).trim();


                const status =
                    normalizarStatus(
                        req.body.status
                    );


                const jogadorId =
                    req.body.jogadorId
                        ? String(
                            req.body.jogadorId
                        ).trim()
                        : null;


                /* --------------------------------------------
                   VALIDAÇÕES OBRIGATÓRIAS
                -------------------------------------------- */


                if (
                    !categoriaId
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe a categoria do item."

                        });

                }


                if (
                    !nome
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o nome do item."

                        });

                }


                if (
                    !raridade
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe a raridade do item."

                        });

                }


                if (
                    !status
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe um status válido."

                        });

                }


                /* --------------------------------------------
                   VALIDAR CATEGORIA
                -------------------------------------------- */


                const categoria =
                    await encontrarCategoria(
                        categoriaId
                    );


                if (
                    !categoria
                ) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "A categoria informada não existe."

                        });

                }


                /* --------------------------------------------
                   VALIDAR JOGADOR
                -------------------------------------------- */


                if (
                    status === "jogador"
                ) {

                    if (
                        !jogadorId
                    ) {

                        return res
                            .status(400)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "Informe o jogador que está com o item."

                            });

                    }


                    const jogador =
                        await encontrarJogador(
                            jogadorId
                        );


                    if (
                        !jogador
                    ) {

                        return res
                            .status(404)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "O jogador informado não existe."

                            });

                    }

                }


                /* --------------------------------------------
                   VERIFICAR DUPLICIDADE
                -------------------------------------------- */


                const itemDuplicado =
                    await encontrarItemDuplicado(
                        categoriaId,
                        nome
                    );


                if (
                    itemDuplicado
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Já existe um item com esse nome nesta categoria.",

                            itemId:
                                itemDuplicado.id

                        });

                }


                /* --------------------------------------------
                   CRIAR ITEM
                -------------------------------------------- */


                const agora =
                    obterDataAtual();


                const novoItem = {

                    id:
                        gerarId(
                            "item"
                        ),

                    categoriaId:
                        categoriaId,

                    nome:
                        nome,

                    imagem:
                        imagem,

                    raridade:
                        raridade,

                    temporada:
                        temporada,

                    aquisicao:
                        aquisicao,

                    status:
                        status,

                    jogadorId:
                        status === "jogador"
                            ? jogadorId
                            : null,

                    descricao:
                        descricao,

                    criadoEm:
                        agora,

                    atualizadoEm:
                        agora

                };


                const resultadoInsercao =
                    await supabase
                        .from("itens")
                        .insert(novoItem)
                        .select("*")
                        .single();


                if (
                    resultadoInsercao.error
                ) {

                    throw resultadoInsercao.error;

                }


                /* --------------------------------------------
                   REGISTRAR HISTÓRICO
                -------------------------------------------- */


                await adicionarHistorico({

                    itemId:
                        novoItem.id,

                    tipo:
                        "criacao",

                    descricao:
                        "Item cadastrado no arquivo da Unholy Blood.",

                    jogadorId:
                        novoItem.jogadorId

                });


                res.status(201)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Item cadastrado com sucesso.",

                        item:
                            await prepararItem(
                                resultadoInsercao.data
                            )

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao criar item:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível criar o item."

                    });

            }

        }
    );


    /* ========================================================
       07. PUT — EDITAR ITEM
       ======================================================== */


    /*
     * URL:
     *
     * PUT /api/itens/:id
     */

    router.put(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                const itemAtual =
                    await encontrarItem(
                        req.params.id
                    );


                if (
                    !itemAtual
                ) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Item não encontrado."

                        });

                }


                /* --------------------------------------------
                   CAMPOS
                -------------------------------------------- */


                const categoriaId =
                    req.body.categoriaId !== undefined
                        ? String(
                            req.body.categoriaId
                        ).trim()
                        : itemAtual.categoriaId;


                const nome =
                    req.body.nome !== undefined
                        ? String(
                            req.body.nome
                        ).trim()
                        : itemAtual.nome;


                const imagem =
                    req.body.imagem !== undefined
                        ? String(
                            req.body.imagem
                        ).trim()
                        : itemAtual.imagem;


                const raridade =
                    req.body.raridade !== undefined
                        ? String(
                            req.body.raridade
                        ).trim()
                        : itemAtual.raridade;


                const temporada =
                    req.body.temporada !== undefined
                        ? String(
                            req.body.temporada
                        ).trim()
                        : itemAtual.temporada;


                const aquisicao =
                    req.body.aquisicao !== undefined
                        ? String(
                            req.body.aquisicao
                        ).trim()
                        : itemAtual.aquisicao;


                const descricao =
                    req.body.descricao !== undefined
                        ? String(
                            req.body.descricao
                        ).trim()
                        : itemAtual.descricao;


                const statusRecebido =
                    req.body.status !== undefined
                        ? req.body.status
                        : itemAtual.status;


                const status =
                    normalizarStatus(
                        statusRecebido
                    );


                const jogadorId =
                    req.body.jogadorId !== undefined
                        ? (
                            req.body.jogadorId
                                ? String(
                                    req.body.jogadorId
                                ).trim()
                                : null
                        )
                        : itemAtual.jogadorId;


                /* --------------------------------------------
                   VALIDAÇÕES
                -------------------------------------------- */


                if (
                    !categoriaId
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe a categoria do item."

                        });

                }


                if (
                    !nome
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o nome do item."

                        });

                }


                if (
                    !raridade
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe a raridade do item."

                        });

                }


                if (
                    !status
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe um status válido."

                        });

                }


                /* --------------------------------------------
                   VALIDAR CATEGORIA
                -------------------------------------------- */


                const categoria =
                    await encontrarCategoria(
                        categoriaId
                    );


                if (
                    !categoria
                ) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "A categoria informada não existe."

                        });

                }


                /* --------------------------------------------
                   VALIDAR JOGADOR
                -------------------------------------------- */


                let jogadorFinal =
                    jogadorId;


                if (
                    status === "armazem"
                ) {

                    jogadorFinal =
                        null;

                }
                else {

                    if (
                        !jogadorFinal
                    ) {

                        return res
                            .status(400)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "Informe o jogador que está com o item."

                            });

                    }


                    const jogador =
                        await encontrarJogador(
                            jogadorFinal
                        );


                    if (
                        !jogador
                    ) {

                        return res
                            .status(404)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "O jogador informado não existe."

                            });

                    }

                }


                /* --------------------------------------------
                   DUPLICIDADE
                -------------------------------------------- */


                const itemDuplicado =
                    await encontrarItemDuplicado(
                        categoriaId,
                        nome,
                        req.params.id
                    );


                if (
                    itemDuplicado
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Já existe outro item com esse nome nesta categoria.",

                            itemId:
                                itemDuplicado.id

                        });

                }


                /* --------------------------------------------
                   VERIFICAR ALTERAÇÕES
                -------------------------------------------- */


                const mudouCategoria =
                    itemAtual.categoriaId !==
                    categoriaId;


                const mudouStatus =
                    itemAtual.status !==
                    status;


                const mudouJogador =
                    (
                        itemAtual.jogadorId ||
                        null
                    ) !==
                    (
                        jogadorFinal ||
                        null
                    );


                /* --------------------------------------------
                   ATUALIZAR ITEM
                -------------------------------------------- */


                const dadosAtualizacao = {

                    categoriaId:
                        categoriaId,

                    nome:
                        nome,

                    imagem:
                        imagem,

                    raridade:
                        raridade,

                    temporada:
                        temporada,

                    aquisicao:
                        aquisicao,

                    status:
                        status,

                    jogadorId:
                        jogadorFinal,

                    descricao:
                        descricao,

                    atualizadoEm:
                        obterDataAtual()

                };


                const resultadoAtualizacao =
                    await supabase
                        .from("itens")
                        .update(dadosAtualizacao)
                        .eq(
                            "id",
                            req.params.id
                        )
                        .select("*")
                        .single();


                if (
                    resultadoAtualizacao.error
                ) {

                    throw resultadoAtualizacao.error;

                }


                const itemAtualizado =
                    resultadoAtualizacao.data;


                /* --------------------------------------------
                   HISTÓRICO — CATEGORIA
                -------------------------------------------- */


                if (
                    mudouCategoria
                ) {

                    await adicionarHistorico({

                        itemId:
                            itemAtualizado.id,

                        tipo:
                            "categoria",

                        descricao:
                            `Categoria alterada para "${categoria.nome}".`,

                        jogadorId:
                            itemAtualizado.jogadorId

                    });

                }


                /* --------------------------------------------
                   HISTÓRICO — POSSE
                -------------------------------------------- */


                if (
                    mudouStatus ||
                    mudouJogador
                ) {

                    if (
                        status === "armazem"
                    ) {

                        await adicionarHistorico({

                            itemId:
                                itemAtualizado.id,

                            tipo:
                                "movimentacao",

                            descricao:
                                "Item retornou ao armazém.",

                            jogadorId:
                                null

                        });

                    }
                    else {

                        const jogador =
                            await encontrarJogador(
                                jogadorFinal
                            );


                        const nomeJogador =
                            jogador
                                ? (
                                    jogador.nome ||
                                    jogador.minecraft ||
                                    "jogador"
                                )
                                : "jogador";


                        await adicionarHistorico({

                            itemId:
                                itemAtualizado.id,

                            tipo:
                                "movimentacao",

                            descricao:
                                `Item atribuído a ${nomeJogador}.`,

                            jogadorId:
                                jogadorFinal

                        });

                    }

                }


                /* --------------------------------------------
                   HISTÓRICO — EDIÇÃO
                -------------------------------------------- */


                if (
                    !mudouCategoria &&
                    !mudouStatus &&
                    !mudouJogador
                ) {

                    await adicionarHistorico({

                        itemId:
                            itemAtualizado.id,

                        tipo:
                            "edicao",

                        descricao:
                            "Informações do item foram atualizadas.",

                        jogadorId:
                            itemAtualizado.jogadorId

                    });

                }


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Item atualizado com sucesso.",

                        item:
                            await prepararItem(
                                itemAtualizado
                            )

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao atualizar item:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível atualizar o item."

                    });

            }

        }
    );


    /* ========================================================
       08. DELETE — EXCLUIR ITEM
       ======================================================== */


    /*
     * URL:
     *
     * DELETE /api/itens/:id
     */

    router.delete(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                const item =
                    await encontrarItem(
                        req.params.id
                    );


                if (
                    !item
                ) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Item não encontrado."

                        });

                }


                /* --------------------------------------------
                   REMOVER ITEM
                -------------------------------------------- */


                const resultadoExclusao =
                    await supabase
                        .from("itens")
                        .delete()
                        .eq(
                            "id",
                            req.params.id
                        );


                if (
                    resultadoExclusao.error
                ) {

                    throw resultadoExclusao.error;

                }


                /* --------------------------------------------
                   REMOVER HISTÓRICO
                --------------------------------------------

                   A tabela historico possui uma chave estrangeira
                   com ON DELETE CASCADE para itens. Portanto,
                   o histórico ligado a este item é removido
                   automaticamente pelo Supabase.
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Item removido com sucesso.",

                        itemId:
                            item.id

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao excluir item:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível excluir o item."

                    });

            }

        }
    );


    /* ========================================================
       09. EXPORTAÇÃO
       ======================================================== */

    return router;

}


/* ============================================================
   10. EXPORTAR MÓDULO
   ============================================================ */

module.exports =
    criarRotasItens;


/* ============================================================
   FIM DO ARQUIVO
   ============================================================ */