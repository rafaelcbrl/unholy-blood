/* ============================================================
   UNHOLY BLOOD
   ROTAS DE CATEGORIAS
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

function criarRotasCategorias(
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
     * Normaliza textos para comparação.
     *
     * Exemplo:
     *
     * "Armaduras"
     * "armaduras"
     * " ARMADURAS "
     *
     * serão considerados o mesmo nome.
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
     * Adiciona informações calculadas à categoria.
     *
     * A quantidade de itens NÃO fica salva dentro
     * da categoria.
     *
     * Ela é calculada diretamente no Supabase
     * com base nos itens existentes.
     *
     * Isso evita que o número fique desatualizado.
     */

    async function prepararCategoria(
        categoria
    ) {

        const resultado =
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
                    "categoriaId",
                    categoria.id
                );


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        return {

            ...categoria,

            quantidade:
                resultado.count || 0

        };

    }


    /*
     * Prepara várias categorias de uma vez.
     */

    async function prepararCategorias(
        categorias
    ) {

        return await Promise.all(
            categorias.map(
                function (
                    categoria
                ) {

                    return prepararCategoria(
                        categoria
                    );

                }
            )
        );

    }


    /*
     * Verifica se uma categoria existe.
     *
     * Esta função continua sendo utilizada
     * para manter a organização da lógica.
     */

    function encontrarCategoria(
        categorias,
        id
    ) {

        return categorias.find(
            function (
                categoria
            ) {

                return (
                    categoria.id ===
                    id
                );

            }
        );

    }


    /* ========================================================
       04. GET — LISTAR TODAS AS CATEGORIAS
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/categorias
     *
     *
     * Também aceita:
     *
     * GET /api/categorias?busca=espada
     *
     * para pesquisar pelo nome ou descrição.
     */

    router.get(
        "/",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Busca todas as categorias
                 * diretamente no Supabase.
                 */

                const resultadoBusca =
                    await supabase
                        .from("categorias")
                        .select("*")
                        .order(
                            "nome",
                            {
                                ascending:
                                    true
                            }
                        );


                if (
                    resultadoBusca.error
                ) {

                    throw resultadoBusca.error;

                }


                let categorias =
                    resultadoBusca.data || [];


                const busca =
                    String(
                        req.query.busca || ""
                    ).trim();


                /*
                 * Caso tenha sido enviada uma busca,
                 * filtramos pelo nome ou descrição.
                 */

                if (busca) {

                    const buscaNormalizada =
                        normalizarTexto(
                            busca
                        );


                    categorias =
                        categorias.filter(
                            function (
                                categoria
                            ) {

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
                                        buscaNormalizada
                                    ) ||
                                    descricao.includes(
                                        buscaNormalizada
                                    )
                                );

                            }
                        );

                }


                const resultado =
                    await prepararCategorias(
                        categorias
                    );


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        total:
                            resultado.length,

                        categorias:
                            resultado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao listar categorias:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível carregar as categorias."

                    });

            }

        }
    );


    /* ========================================================
       05. GET — BUSCAR CATEGORIA POR ID
       ======================================================== */


    /*
     * URL:
     *
     * GET /api/categorias/:id
     */

    router.get(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                const resultadoBusca =
                    await supabase
                        .from("categorias")
                        .select("*")
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


                const categoria =
                    resultadoBusca.data;


                if (!categoria) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Categoria não encontrada."

                        });

                }


                const resultado =
                    await prepararCategoria(
                        categoria
                    );


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        categoria:
                            resultado

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao buscar categoria:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível buscar a categoria."

                    });

            }

        }
    );


    /* ========================================================
       06. POST — CRIAR CATEGORIA
       ======================================================== */


    /*
     * URL:
     *
     * POST /api/categorias
     *
     *
     * Corpo esperado:
     *
     * {
     *     "nome": "Armas",
     *     "descricao": "...",
     *     "imagem": "..."
     * }
     */

    router.post(
        "/",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Recebemos os dados enviados pelo Front-End.
                 */

                const nome =
                    String(
                        req.body.nome || ""
                    ).trim();


                const descricao =
                    String(
                        req.body.descricao || ""
                    ).trim();


                const imagem =
                    String(
                        req.body.imagem || ""
                    ).trim();


                /* ------------------------------------------------
                   VALIDAÇÃO DO NOME
                ------------------------------------------------ */


                if (!nome) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o nome da categoria."

                        });

                }


                /*
                 * Evita nomes absurdamente grandes.
                 */

                if (
                    nome.length > 100
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "O nome da categoria deve possuir no máximo 100 caracteres."

                        });

                }


                /*
                 * Limite da descrição.
                 */

                if (
                    descricao.length > 1000
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "A descrição deve possuir no máximo 1000 caracteres."

                        });

                }


                /* ------------------------------------------------
                   VERIFICAR DUPLICIDADE
                ------------------------------------------------ */


                const nomeNormalizado =
                    normalizarTexto(
                        nome
                    );


                const resultadoCategorias =
                    await supabase
                        .from("categorias")
                        .select(
                            "id,nome"
                        );


                if (
                    resultadoCategorias.error
                ) {

                    throw resultadoCategorias.error;

                }


                const categoriaDuplicada =
                    (
                        resultadoCategorias.data ||
                        []
                    ).find(
                        function (
                            categoria
                        ) {

                            return (
                                normalizarTexto(
                                    categoria.nome
                                ) ===
                                nomeNormalizado
                            );

                        }
                    );


                if (
                    categoriaDuplicada
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Já existe uma categoria com esse nome.",

                            categoriaId:
                                categoriaDuplicada.id

                        });

                }


                /* ------------------------------------------------
                   CRIAR CATEGORIA
                ------------------------------------------------ */


                const agora =
                    obterDataAtual();


                const novaCategoria = {

                    id:
                        gerarId(
                            "categoria"
                        ),

                    nome:
                        nome,

                    descricao:
                        descricao,

                    imagem:
                        imagem,

                    criadoEm:
                        agora,

                    atualizadoEm:
                        agora

                };


                /*
                 * Adiciona a categoria ao Supabase.
                 */

                const resultadoInsercao =
                    await supabase
                        .from("categorias")
                        .insert(
                            novaCategoria
                        )
                        .select("*")
                        .single();


                if (
                    resultadoInsercao.error
                ) {

                    throw resultadoInsercao.error;

                }


                /*
                 * Prepara a categoria criada.
                 */

                const categoriaCriada =
                    await prepararCategoria(
                        resultadoInsercao.data
                    );


                /*
                 * Retorna a categoria criada.
                 */

                res.status(201)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Categoria criada com sucesso.",

                        categoria:
                            categoriaCriada

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao criar categoria:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível criar a categoria."

                    });

            }

        }
    );


    /* ========================================================
       07. PUT — EDITAR CATEGORIA
       ======================================================== */


    /*
     * URL:
     *
     * PUT /api/categorias/:id
     *
     *
     * Corpo:
     *
     * {
     *     "nome": "Novo nome",
     *     "descricao": "...",
     *     "imagem": "..."
     * }
     */

    router.put(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Busca a categoria atual.
                 */

                const resultadoBusca =
                    await supabase
                        .from("categorias")
                        .select("*")
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


                const categoriaAtual =
                    resultadoBusca.data;


                /*
                 * Categoria não encontrada.
                 */

                if (!categoriaAtual) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Categoria não encontrada."

                        });

                }


                /*
                 * Se um campo não for enviado,
                 * mantemos o valor anterior.
                 */

                const nome =
                    req.body.nome !== undefined
                        ? String(
                            req.body.nome
                        ).trim()
                        : categoriaAtual.nome;


                const descricao =
                    req.body.descricao !== undefined
                        ? String(
                            req.body.descricao
                        ).trim()
                        : categoriaAtual.descricao;


                const imagem =
                    req.body.imagem !== undefined
                        ? String(
                            req.body.imagem
                        ).trim()
                        : categoriaAtual.imagem;


                /* ------------------------------------------------
                   VALIDAÇÕES
                ------------------------------------------------ */


                if (!nome) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Informe o nome da categoria."

                        });

                }


                if (
                    nome.length > 100
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "O nome da categoria deve possuir no máximo 100 caracteres."

                        });

                }


                if (
                    descricao.length > 1000
                ) {

                    return res
                        .status(400)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "A descrição deve possuir no máximo 1000 caracteres."

                        });

                }


                /* ------------------------------------------------
                   VERIFICAR DUPLICIDADE
                ------------------------------------------------ */


                const nomeNormalizado =
                    normalizarTexto(
                        nome
                    );


                const resultadoCategorias =
                    await supabase
                        .from("categorias")
                        .select(
                            "id,nome"
                        );


                if (
                    resultadoCategorias.error
                ) {

                    throw resultadoCategorias.error;

                }


                const categoriaDuplicada =
                    (
                        resultadoCategorias.data ||
                        []
                    ).find(
                        function (
                            categoria
                        ) {

                            return (
                                categoria.id !==
                                req.params.id &&
                                normalizarTexto(
                                    categoria.nome
                                ) ===
                                nomeNormalizado
                            );

                        }
                    );


                if (
                    categoriaDuplicada
                ) {

                    return res
                        .status(409)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Já existe outra categoria com esse nome.",

                            categoriaId:
                                categoriaDuplicada.id

                        });

                }


                /* ------------------------------------------------
                   ATUALIZAR
                ------------------------------------------------ */


                const dadosAtualizacao = {

                    nome:
                        nome,

                    descricao:
                        descricao,

                    imagem:
                        imagem,

                    atualizadoEm:
                        obterDataAtual()

                };


                const resultadoAtualizacao =
                    await supabase
                        .from("categorias")
                        .update(
                            dadosAtualizacao
                        )
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


                const categoriaAtualizada =
                    await prepararCategoria(
                        resultadoAtualizacao.data
                    );


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Categoria atualizada com sucesso.",

                        categoria:
                            categoriaAtualizada

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao atualizar categoria:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível atualizar a categoria."

                    });

            }

        }
    );


    /* ========================================================
       08. DELETE — EXCLUIR CATEGORIA
       ======================================================== */


    /*
     * URL:
     *
     * DELETE /api/categorias/:id
     *
     *
     * IMPORTANTE:
     *
     * Se a categoria possuir itens,
     * esses itens também serão removidos.
     *
     * O Supabase possui ON DELETE CASCADE
     * configurado para os itens da categoria.
     *
     * Os históricos desses itens também serão
     * removidos automaticamente pelo CASCADE
     * da tabela historico.
     */

    router.delete(
        "/:id",
        async function (
            req,
            res
        ) {

            try {

                /*
                 * Verifica se a categoria existe.
                 */

                const resultadoCategoria =
                    await supabase
                        .from("categorias")
                        .select("id")
                        .eq(
                            "id",
                            req.params.id
                        )
                        .maybeSingle();


                if (
                    resultadoCategoria.error
                ) {

                    throw resultadoCategoria.error;

                }


                const categoria =
                    resultadoCategoria.data;


                if (!categoria) {

                    return res
                        .status(404)
                        .json({

                            sucesso:
                                false,

                            mensagem:
                                "Categoria não encontrada."

                        });

                }


                /* ------------------------------------------------
                   LOCALIZAR ITENS DA CATEGORIA
                ------------------------------------------------ */


                const resultadoItens =
                    await supabase
                        .from("itens")
                        .select(
                            "id",
                            {
                                count:
                                    "exact",
                                head:
                                    true
                            }
                        )
                        .eq(
                            "categoriaId",
                            req.params.id
                        );


                if (
                    resultadoItens.error
                ) {

                    throw resultadoItens.error;

                }


                const quantidadeItens =
                    resultadoItens.count || 0;


                /* ------------------------------------------------
                   REMOVER CATEGORIA
                ------------------------------------------------ */


                /*
                 * O banco possui:
                 *
                 * categorias
                 *      ↓ ON DELETE CASCADE
                 * itens
                 *      ↓ ON DELETE CASCADE
                 * historico
                 *
                 * Portanto, excluir a categoria
                 * remove automaticamente os itens
                 * e seus históricos.
                 */

                const resultadoExclusao =
                    await supabase
                        .from("categorias")
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


                res.status(200)
                    .json({

                        sucesso:
                            true,

                        mensagem:
                            "Categoria removida com sucesso.",

                        categoriaId:
                            categoria.id,

                        itensRemovidos:
                            quantidadeItens

                    });

            }
            catch (erro) {

                console.error(
                    "Erro ao excluir categoria:",
                    erro
                );


                res.status(500)
                    .json({

                        sucesso:
                            false,

                        mensagem:
                            "Não foi possível excluir a categoria."

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
    criarRotasCategorias;


/* ============================================================
   FIM DO ARQUIVO
   ============================================================ */