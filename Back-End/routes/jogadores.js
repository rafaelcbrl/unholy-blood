/* ============================================================
   UNHOLY BLOOD
   ROTAS DE JOGADORES
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
 * responsáveis pelo banco de dados.
 *
 * Recebemos:
 *
 * supabase
 * gerarId
 * obterDataAtual
 */

function criarRotasJogadores(
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
     * /api/jogadores
     */

    const router =
        express.Router();


    /* ========================================================
       03. FUNÇÕES AUXILIARES
       ======================================================== */


    /*
     * Normaliza textos para comparação.
     *
     * Isso faz com que:
     *
     * "João"
     * "joao"
     * " JOÃO "
     *
     * sejam considerados equivalentes.
     */

    function normalizarTexto(
        valor
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
     * Prepara o jogador para ser enviado
     * ao Front-End.
     */

    function prepararJogador(
        jogador
    ) {

        if (!jogador) {

            return null;

        }


        return {

            id:
                jogador.id,

            nome:
                jogador.nome,

            minecraft:
                jogador.minecraft,

            avatar:
                jogador.avatar || "",

            ativo:
                jogador.ativo !== false,

            criadoEm:
                jogador.criadoEm,

            atualizadoEm:
                jogador.atualizadoEm

        };

    }


    /*
     * Procura um jogador pelo ID.
     *
     * Agora a consulta é feita diretamente
     * no Supabase.
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


    /* ========================================================
       04. GET — LISTAR JOGADORES
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/jogadores
     *
     *
     * Filtros opcionais:
     *
     * ?busca=Rafael
     *
     * ?ativo=true
     *
     * ?ativo=false
     */


    router.get(
        "/",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Busca os jogadores diretamente
                 * no Supabase.
                 */

                const resultadoBusca =
                    await supabase
                        .from("jogadores")
                        .select("*");


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                /*
                 * Começamos com todos
                 * os jogadores.
                 */

                let jogadores =
                    resultadoBusca.data || [];


                /* --------------------------------------------
                   FILTRO POR BUSCA
                -------------------------------------------- */


                const busca =
                    normalizarTexto(
                        req.query.busca
                    );


                if (
                    busca
                ) {

                    jogadores =
                        jogadores.filter(
                            function (
                                jogador
                            ) {

                                const nome =
                                    normalizarTexto(
                                        jogador.nome
                                    );


                                const minecraft =
                                    normalizarTexto(
                                        jogador.minecraft
                                    );


                                return (

                                    nome.includes(
                                        busca
                                    )

                                    ||

                                    minecraft.includes(
                                        busca
                                    )

                                );

                            }
                        );

                }


                /* --------------------------------------------
                   FILTRO POR STATUS
                -------------------------------------------- */


                if (
                    req.query.ativo !==
                    undefined
                ) {

                    const ativo =
                        String(
                            req.query.ativo
                        ).toLowerCase();


                    if (
                        ativo ===
                        "true"
                    ) {

                        jogadores =
                            jogadores.filter(
                                function (
                                    jogador
                                ) {

                                    return (
                                        jogador.ativo !==
                                        false
                                    );

                                }
                            );

                    }


                    if (
                        ativo ===
                        "false"
                    ) {

                        jogadores =
                            jogadores.filter(
                                function (
                                    jogador
                                ) {

                                    return (
                                        jogador.ativo ===
                                        false
                                    );

                                }
                            );

                    }

                }


                /* --------------------------------------------
                   ORDENAÇÃO
                -------------------------------------------- */


                jogadores.sort(
                    function (
                        a,
                        b
                    ) {

                        return normalizarTexto(
                            a.nome
                        ).localeCompare(
                            normalizarTexto(
                                b.nome
                            ),
                            "pt-BR"
                        );

                    }
                );


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                const resultado =
                    jogadores.map(
                        function (
                            jogador
                        ) {

                            return prepararJogador(
                                jogador
                            );

                        }
                    );


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        total:
                            resultado.length,

                        jogadores:
                            resultado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao listar jogadores:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível carregar os jogadores."

                    });

            }

        }
    );


    /* ========================================================
       05. GET — BUSCAR JOGADOR POR ID
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/jogadores/:id
     */


    router.get(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Procura o jogador no Supabase.
                 */

                const jogador =
                    await encontrarJogador(
                        req.params.id
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
                                "Jogador não encontrado."

                        });

                }


                /* --------------------------------------------
                   CONTAGEM DE ITENS
                -------------------------------------------- */


                const resultadoItens =
                    await supabase
                        .from("itens")
                        .select(
                            "id",
                            {
                                count: "exact",
                                head: true
                            }
                        )
                        .eq(
                            "jogadorId",
                            jogador.id
                        )
                        .eq(
                            "status",
                            "jogador"
                        );


                if (
                    resultadoItens.error
                ) {

                    throw resultadoItens.error;

                }


                const quantidadeItens =
                    resultadoItens.count || 0;


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        jogador:
                            prepararJogador(
                                jogador
                            ),

                        quantidadeItens:
                            quantidadeItens

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao buscar jogador:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível buscar o jogador."

                    });

            }

        }
    );


    /* ========================================================
       06. POST — CRIAR JOGADOR
       ======================================================== */


    /*
     * URL:
     *
     * POST /api/jogadores
     *
     *
     * Corpo esperado:
     *
     * {
     *     "nome": "Rafael",
     *     "minecraft": "Rafael123",
     *     "avatar": "..."
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


                const nome =
                    limitarTexto(
                        req.body.nome,
                        100
                    );


                const minecraft =
                    limitarTexto(
                        req.body.minecraft,
                        100
                    );


                const avatar =
                    limitarTexto(
                        req.body.avatar,
                        500
                    );


                /* --------------------------------------------
                   VALIDAÇÃO DO NOME
                -------------------------------------------- */


                if (!nome) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o nome do jogador."

                        });

                }


                /* --------------------------------------------
                   VALIDAÇÃO DO MINECRAFT
                -------------------------------------------- */


                if (!minecraft) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o nome do Minecraft."

                        });

                }


                /* --------------------------------------------
                   DUPLICIDADE DO NOME
                -------------------------------------------- */


                const nomeNormalizado =
                    normalizarTexto(
                        nome
                    );


                const resultadoNomes =
                    await supabase
                        .from("jogadores")
                        .select(
                            "id,nome"
                        );


                if (
                    resultadoNomes.error
                ) {

                    throw resultadoNomes.error;

                }


                const jogadorComMesmoNome =
                    (
                        resultadoNomes.data ||
                        []
                    ).find(
                        function (
                            jogador
                        ) {

                            return (
                                normalizarTexto(
                                    jogador.nome
                                ) ===
                                nomeNormalizado
                            );

                        }
                    );


                if (
                    jogadorComMesmoNome
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Já existe um jogador com esse nome.",

                            jogadorId:
                                jogadorComMesmoNome.id

                        });

                }


                /* --------------------------------------------
                   DUPLICIDADE DO MINECRAFT
                -------------------------------------------- */


                const minecraftNormalizado =
                    normalizarTexto(
                        minecraft
                    );


                const resultadoMinecraft =
                    await supabase
                        .from("jogadores")
                        .select(
                            "id,minecraft"
                        );


                if (
                    resultadoMinecraft.error
                ) {

                    throw resultadoMinecraft.error;

                }


                const jogadorComMesmoMinecraft =
                    (
                        resultadoMinecraft.data ||
                        []
                    ).find(
                        function (
                            jogador
                        ) {

                            return (
                                normalizarTexto(
                                    jogador.minecraft
                                ) ===
                                minecraftNormalizado
                            );

                        }
                    );


                if (
                    jogadorComMesmoMinecraft
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Já existe um jogador cadastrado com esse nome do Minecraft.",

                            jogadorId:
                                jogadorComMesmoMinecraft.id

                        });

                }


                /* --------------------------------------------
                   CRIAR JOGADOR
                -------------------------------------------- */


                const agora =
                    obterDataAtual();


                const novoJogador = {

                    id:
                        gerarId(
                            "jogador"
                        ),

                    nome:
                        nome,

                    minecraft:
                        minecraft,

                    avatar:
                        avatar,

                    ativo:
                        true,

                    criadoEm:
                        agora,

                    atualizadoEm:
                        agora

                };


                /* --------------------------------------------
                   SALVAR NO SUPABASE
                -------------------------------------------- */


                const resultadoInsercao =
                    await supabase
                        .from("jogadores")
                        .insert(
                            novoJogador
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
                            "Jogador criado com sucesso.",

                        jogador:
                            prepararJogador(
                                resultadoInsercao.data
                            )

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao criar jogador:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível criar o jogador."

                    });

            }

        }
    );


    /* ========================================================
       07. PUT — EDITAR JOGADOR
       ======================================================== */


    /*
     * URL:
     *
     * PUT /api/jogadores/:id
     *
     *
     * Pode alterar:
     *
     * nome
     * minecraft
     * avatar
     * ativo
     */


    router.put(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                /* --------------------------------------------
                   PROCURAR JOGADOR
                -------------------------------------------- */


                const jogador =
                    await encontrarJogador(
                        req.params.id
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
                                "Jogador não encontrado."

                        });

                }


                /* --------------------------------------------
                   NOME
                -------------------------------------------- */


                if (
                    req.body.nome !==
                    undefined
                ) {

                    const novoNome =
                        limitarTexto(
                            req.body.nome,
                            100
                        );


                    if (!novoNome) {

                        return res
                            .status(400)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "O nome do jogador não pode ficar vazio."

                            });

                    }


                    const nomeNormalizado =
                        normalizarTexto(
                            novoNome
                        );


                    const resultadoNomes =
                        await supabase
                            .from("jogadores")
                            .select(
                                "id,nome"
                            );


                    if (
                        resultadoNomes.error
                    ) {

                        throw resultadoNomes.error;

                    }


                    const duplicado =
                        (
                            resultadoNomes.data ||
                            []
                        ).find(
                            function (
                                outro
                            ) {

                                return (

                                    outro.id !==
                                    jogador.id

                                    &&

                                    normalizarTexto(
                                        outro.nome
                                    ) ===
                                    nomeNormalizado

                                );

                            }
                        );


                    if (
                        duplicado
                    ) {

                        return res
                            .status(409)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "Já existe outro jogador com esse nome."

                            });

                    }


                    jogador.nome =
                        novoNome;

                }


                /* --------------------------------------------
                   NOME DO MINECRAFT
                -------------------------------------------- */


                if (
                    req.body.minecraft !==
                    undefined
                ) {

                    const novoMinecraft =
                        limitarTexto(
                            req.body.minecraft,
                            100
                        );


                    if (!novoMinecraft) {

                        return res
                            .status(400)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "O nome do Minecraft não pode ficar vazio."

                            });

                    }


                    const minecraftNormalizado =
                        normalizarTexto(
                            novoMinecraft
                        );


                    const resultadoMinecraft =
                        await supabase
                            .from("jogadores")
                            .select(
                                "id,minecraft"
                            );


                    if (
                        resultadoMinecraft.error
                    ) {

                        throw resultadoMinecraft.error;

                    }


                    const duplicado =
                        (
                            resultadoMinecraft.data ||
                            []
                        ).find(
                            function (
                                outro
                            ) {

                                return (

                                    outro.id !==
                                    jogador.id

                                    &&

                                    normalizarTexto(
                                        outro.minecraft
                                    ) ===
                                    minecraftNormalizado

                                );

                            }
                        );


                    if (
                        duplicado
                    ) {

                        return res
                            .status(409)
                            .json({

                                sucesso:
                                    false,

                                mensagem:
                                    "Já existe outro jogador com esse nome do Minecraft."

                            });

                    }


                    jogador.minecraft =
                        novoMinecraft;

                }


                /* --------------------------------------------
                   AVATAR
                -------------------------------------------- */


                if (
                    req.body.avatar !==
                    undefined
                ) {

                    jogador.avatar =
                        limitarTexto(
                            req.body.avatar,
                            500
                        );

                }


                /* --------------------------------------------
                   STATUS
                -------------------------------------------- */


                if (
                    req.body.ativo !==
                    undefined
                ) {

                    jogador.ativo =
                        req.body.ativo !==
                        false;

                }


                /* --------------------------------------------
                   DATA DE ATUALIZAÇÃO
                -------------------------------------------- */


                jogador.atualizadoEm =
                    obterDataAtual();


                /* --------------------------------------------
                   ATUALIZAR NO SUPABASE
                -------------------------------------------- */


                const dadosAtualizacao = {

                    nome:
                        jogador.nome,

                    minecraft:
                        jogador.minecraft,

                    avatar:
                        jogador.avatar || "",

                    ativo:
                        jogador.ativo !== false,

                    atualizadoEm:
                        jogador.atualizadoEm

                };


                const resultadoAtualizacao =
                    await supabase
                        .from("jogadores")
                        .update(
                            dadosAtualizacao
                        )
                        .eq(
                            "id",
                            jogador.id
                        )
                        .select("*")
                        .single();


                if (
                    resultadoAtualizacao.error
                ) {

                    throw resultadoAtualizacao.error;

                }


                /* --------------------------------------------
                   RESPOSTA
                -------------------------------------------- */


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Jogador atualizado com sucesso.",

                        jogador:
                            prepararJogador(
                                resultadoAtualizacao.data
                            )

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao atualizar jogador:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível atualizar o jogador."

                    });

            }

        }
    );


    /* ========================================================
       08. DELETE — EXCLUIR JOGADOR
       ======================================================== */


    /*
     * URL:
     *
     * DELETE /api/jogadores/:id
     *
     *
     * IMPORTANTE:
     *
     * Um jogador não poderá ser excluído enquanto
     * possuir itens da coleção em sua posse.
     *
     * Isso evita deixar itens apontando para
     * jogadores inexistentes.
     */


    router.delete(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                /* --------------------------------------------
                   PROCURAR JOGADOR
                -------------------------------------------- */


                const jogador =
                    await encontrarJogador(
                        req.params.id
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
                                "Jogador não encontrado."

                        });

                }


                /* --------------------------------------------
                   VERIFICAR ITENS EM POSSE
                -------------------------------------------- */


                const resultadoItens =
                    await supabase
                        .from("itens")
                        .select(
                            "id"
                        )
                        .eq(
                            "status",
                            "jogador"
                        )
                        .eq(
                            "jogadorId",
                            jogador.id
                        );


                if (
                    resultadoItens.error
                ) {

                    throw resultadoItens.error;

                }


                const itensEmPosse =
                    resultadoItens.data || [];


                if (
                    itensEmPosse.length >
                    0
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Não é possível excluir este jogador porque existem itens da coleção em sua posse.",

                            quantidadeItens:
                                itensEmPosse.length

                        });

                }


                /* --------------------------------------------
                   EXCLUIR JOGADOR
                -------------------------------------------- */


                const resultadoExclusao =
                    await supabase
                        .from("jogadores")
                        .delete()
                        .eq(
                            "id",
                            jogador.id
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
                            "Jogador excluído com sucesso."

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao excluir jogador:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível excluir o jogador."

                    });

            }

        }
    );


    /* ========================================================
       09. EXPORTAÇÃO
       ======================================================== */


    /*
     * O server.js espera receber
     * este Router.
     */

    return router;

}


/* ============================================================
   10. EXPORTAÇÃO DO MÓDULO
   ============================================================ */

module.exports =
    criarRotasJogadores;