/* ============================================================
   UNHOLY BLOOD
   ROTAS DE HISTÓRICO
   ============================================================ */


/* ============================================================
   01. IMPORTAÇÕES
   ============================================================ */

const express = require("express");


/* ============================================================
   02. FUNÇÃO PRINCIPAL DAS ROTAS
   ============================================================ */


/*
 * O server.js envia para este arquivo as funções
 * responsáveis pelo sistema.
 *
 * Recebemos:
 *
 * supabase
 * gerarId
 * obterDataAtual
 */

function criarRotasHistorico(
    dependencias
) {

    const {
        supabase,
        gerarId,
        obterDataAtual
    } = dependencias;


    /*
     * Criamos um Router próprio.
     *
     * O server.js será responsável por conectar
     * este Router em:
     *
     * /api/historico
     */

    const router =
        express.Router();


    /* ========================================================
       03. FUNÇÕES AUXILIARES
       ======================================================== */


    /*
     * Limita o tamanho de um texto.
     */

    function limitarTexto(
        valor,
        tamanho
    ) {

        if (
            valor === undefined ||
            valor === null
        ) {

            return "";

        }


        return String(
            valor
        )
            .trim()
            .slice(
                0,
                tamanho
            );

    }


    /*
     * Procura um item pelo ID diretamente
     * no Supabase.
     */

    async function encontrarItem(
        itemId
    ) {

        if (!itemId) {

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
     * Procura um jogador pelo ID diretamente
     * no Supabase.
     */

    async function encontrarJogador(
        jogadorId
    ) {

        if (!jogadorId) {

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
     * Prepara um registro do histórico
     * para ser enviado ao Front-End.
     *
     * Além dos IDs, entregamos os nomes
     * correspondentes para facilitar a
     * utilização nas páginas.
     */

    async function prepararHistorico(
        registro
    ) {

        if (!registro) {

            return null;

        }


        const item =
            await encontrarItem(
                registro.itemId
            );


        const jogador =
            await encontrarJogador(
                registro.jogadorId
            );


        return {

            id:
                registro.id,

            itemId:
                registro.itemId,

            itemNome:
                item
                    ? item.nome
                    : "Item removido",

            tipo:
                registro.tipo,

            descricao:
                registro.descricao,

            jogadorId:
                registro.jogadorId ||
                null,

            jogadorNome:
                jogador
                    ? (
                        jogador.nome ||
                        jogador.minecraft ||
                        null
                    )
                    : null,

            data:
                registro.data

        };

    }


    /*
     * Prepara vários registros do histórico.
     *
     * Promise.all permite buscar os nomes
     * correspondentes sem alterar a estrutura
     * da resposta original.
     */

    async function prepararHistoricos(
        historico
    ) {

        return await Promise.all(
            historico.map(
                function (
                    registro
                ) {

                    return prepararHistorico(
                        registro
                    );

                }
            )
        );

    }


    /* ========================================================
       04. GET — LISTAR TODO O HISTÓRICO
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/historico
     *
     *
     * Filtros opcionais:
     *
     * ?item=ID
     * ?jogador=ID
     * ?tipo=criacao
     */

    router.get(
        "/",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Busca todos os registros diretamente
                 * no Supabase.
                 */

                const resultadoBusca =
                    await supabase
                        .from("historico")
                        .select("*");


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                /*
                 * Começamos com todos
                 * os registros.
                 */

                let historico =
                    resultadoBusca.data || [];


                /* --------------------------------------------
                   FILTRO POR ITEM
                -------------------------------------------- */


                const itemId =
                    String(
                        req.query.item ||
                        ""
                    ).trim();


                if (itemId) {

                    historico =
                        historico.filter(
                            function (
                                registro
                            ) {

                                return (
                                    registro.itemId ===
                                    itemId
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR JOGADOR
                -------------------------------------------- */


                const jogadorId =
                    String(
                        req.query.jogador ||
                        ""
                    ).trim();


                if (jogadorId) {

                    historico =
                        historico.filter(
                            function (
                                registro
                            ) {

                                return (
                                    registro.jogadorId ===
                                    jogadorId
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR TIPO
                -------------------------------------------- */


                const tipo =
                    String(
                        req.query.tipo ||
                        ""
                    ).trim();


                if (tipo) {

                    historico =
                        historico.filter(
                            function (
                                registro
                            ) {

                                return (
                                    registro.tipo ===
                                    tipo
                                );

                            }
                        );

                }


                /* --------------------------------------------
                   ORDENAÇÃO
                -------------------------------------------- */


                historico =
                    [...historico]
                        .sort(
                            function (
                                a,
                                b
                            ) {

                                return (
                                    new Date(
                                        b.data
                                    ) -
                                    new Date(
                                        a.data
                                    )
                                );

                            }
                        );


                /* --------------------------------------------
                   PREPARAR RESULTADO
                -------------------------------------------- */


                const resultado =
                    await prepararHistoricos(
                        historico
                    );


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        total:
                            resultado.length,

                        historico:
                            resultado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao listar histórico:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível carregar o histórico."

                    });

            }

        }
    );


    /* ========================================================
       05. GET — HISTÓRICO DE UM ITEM
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/historico/item/:itemId
     */

    router.get(
        "/item/:itemId",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Procura o item diretamente no Supabase.
                 */

                const item =
                    await encontrarItem(
                        req.params.itemId
                    );


                /*
                 * Item não encontrado.
                 */

                if (!item) {

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
                   BUSCAR HISTÓRICO
                -------------------------------------------- */


                const resultadoBusca =
                    await supabase
                        .from("historico")
                        .select("*")
                        .eq(
                            "itemId",
                            item.id
                        );


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                let historico =
                    resultadoBusca.data || [];


                /* --------------------------------------------
                   ORDENAÇÃO
                -------------------------------------------- */


                historico =
                    [...historico]
                        .sort(
                            function (
                                a,
                                b
                            ) {

                                return (
                                    new Date(
                                        b.data
                                    ) -
                                    new Date(
                                        a.data
                                    )
                                );

                            }
                        );


                /* --------------------------------------------
                   PREPARAR HISTÓRICO
                -------------------------------------------- */


                const historicoPreparado =
                    await prepararHistoricos(
                        historico
                    );


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        item: {

                            id:
                                item.id,

                            nome:
                                item.nome

                        },

                        total:
                            historicoPreparado.length,

                        historico:
                            historicoPreparado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao buscar histórico do item:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível carregar o histórico do item."

                    });

            }

        }
    );


    /* ========================================================
       06. GET — HISTÓRICO DE UM JOGADOR
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/historico/jogador/:jogadorId
     */

    router.get(
        "/jogador/:jogadorId",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Procura o jogador diretamente
                 * no Supabase.
                 */

                const jogador =
                    await encontrarJogador(
                        req.params.jogadorId
                    );


                /*
                 * Jogador não encontrado.
                 */

                if (!jogador) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Jogador não encontrado."

                        });

                }


                /* --------------------------------------------
                   BUSCAR HISTÓRICO
                -------------------------------------------- */


                const resultadoBusca =
                    await supabase
                        .from("historico")
                        .select("*")
                        .eq(
                            "jogadorId",
                            jogador.id
                        );


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                let historico =
                    resultadoBusca.data || [];


                /* --------------------------------------------
                   ORDENAÇÃO
                -------------------------------------------- */


                historico =
                    [...historico]
                        .sort(
                            function (
                                a,
                                b
                            ) {

                                return (
                                    new Date(
                                        b.data
                                    ) -
                                    new Date(
                                        a.data
                                    )
                                );

                            }
                        );


                /* --------------------------------------------
                   PREPARAR HISTÓRICO
                -------------------------------------------- */


                const historicoPreparado =
                    await prepararHistoricos(
                        historico
                    );


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        jogador: {

                            id:
                                jogador.id,

                            nome:
                                jogador.nome,

                            minecraft:
                                jogador.minecraft

                        },

                        total:
                            historicoPreparado.length,

                        historico:
                            historicoPreparado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao buscar histórico do jogador:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível carregar o histórico do jogador."

                    });

            }

        }
    );


    /* ========================================================
       07. POST — REGISTRAR HISTÓRICO
       ======================================================== */


    /*
     * URL:
     *
     * POST /api/historico
     *
     *
     * Corpo esperado:
     *
     * {
     *     "itemId": "item-123",
     *     "tipo": "retirada",
     *     "descricao": "Item entregue ao jogador.",
     *     "jogadorId": "jogador-123"
     * }
     */

    router.post(
        "/",
        async function (
            req,
            res
        ) {

            try {

                /* --------------------------------------------
                   DADOS RECEBIDOS
                -------------------------------------------- */


                const itemId =
                    limitarTexto(
                        req.body.itemId,
                        150
                    );


                const tipo =
                    limitarTexto(
                        req.body.tipo,
                        50
                    );


                const descricao =
                    limitarTexto(
                        req.body.descricao,
                        1000
                    );


                const jogadorId =
                    req.body.jogadorId
                        ? limitarTexto(
                            req.body.jogadorId,
                            150
                        )
                        : null;


                /* --------------------------------------------
                   VALIDAR ITEM
                -------------------------------------------- */


                if (!itemId) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o item."

                        });

                }


                const item =
                    await encontrarItem(
                        itemId
                    );


                if (!item) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "O item informado não existe."

                        });

                }


                /* --------------------------------------------
                   VALIDAR TIPO
                -------------------------------------------- */


                if (!tipo) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o tipo do histórico."

                        });

                }


                /* --------------------------------------------
                   VALIDAR DESCRIÇÃO
                -------------------------------------------- */


                if (!descricao) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe a descrição do histórico."

                        });

                }


                /* --------------------------------------------
                   VALIDAR JOGADOR
                -------------------------------------------- */


                let jogador = null;


                if (jogadorId) {

                    jogador =
                        await encontrarJogador(
                            jogadorId
                        );


                    if (!jogador) {

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
                   CRIAR REGISTRO
                -------------------------------------------- */


                const registro = {

                    id:
                        gerarId(
                            "historico"
                        ),

                    itemId:
                        itemId,

                    tipo:
                        tipo,

                    descricao:
                        descricao,

                    jogadorId:
                        jogadorId,

                    data:
                        obterDataAtual()

                };


                /* --------------------------------------------
                   SALVAR
                -------------------------------------------- */


                const resultadoInsercao =
                    await supabase
                        .from("historico")
                        .insert(
                            registro
                        )
                        .select("*")
                        .single();


                if (
                    resultadoInsercao.error
                ) {

                    throw resultadoInsercao.error;

                }


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                res.status(201)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Registro de histórico criado com sucesso.",

                        historico:
                            await prepararHistorico(
                                resultadoInsercao.data
                            )

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao criar histórico:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível registrar o histórico."

                    });

            }

        }
    );


    /* ========================================================
       08. DELETE — EXCLUIR REGISTRO
       ======================================================== */


    /*
     * URL:
     *
     * DELETE /api/historico/:id
     *
     *
     * Esta rota é principalmente para manutenção
     * administrativa.
     */

    router.delete(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Procura o registro diretamente
                 * no Supabase.
                 */

                const resultadoBusca =
                    await supabase
                        .from("historico")
                        .select("id")
                        .eq(
                            "id",
                            req.params.id
                        )
                        .maybeSingle();


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                const registro =
                    resultadoBusca.data;


                if (!registro) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Registro de histórico não encontrado."

                        });

                }


                /* --------------------------------------------
                   EXCLUIR
                -------------------------------------------- */


                const resultadoExclusao =
                    await supabase
                        .from("historico")
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
                   RESPOSTA
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Registro de histórico excluído com sucesso."

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao excluir histórico:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível excluir o registro de histórico."

                    });

            }

        }
    );


    /* ========================================================
       09. EXPORTAÇÃO DO ROUTER
       ======================================================== */


    /*
     * O server.js espera receber
     * diretamente este Router.
     */

    return router;

}


/* ============================================================
   10. EXPORTAÇÃO DO MÓDULO
   ============================================================ */

module.exports =
    criarRotasHistorico;