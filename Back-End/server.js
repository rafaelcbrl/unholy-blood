/* ============================================================
   UNHOLY BLOOD
   SERVIDOR PRINCIPAL DO BACK-END
   ============================================================ */


/* ============================================================
   01. IMPORTAÇÕES
   ============================================================ */

const express = require("express");
const path = require("path");

const supabase =
    require("./supabase");


/* ============================================================
   02. CONFIGURAÇÕES PRINCIPAIS
   ============================================================ */

const app =
    express();


const PORTA =
    process.env.PORT || 3000;


/*
 * Caminho da pasta principal do projeto.
 *
 * __dirname aponta para:
 *
 * UNHOLY-BLOOD/Back-End
 *
 * Então voltamos uma pasta para chegar em:
 *
 * UNHOLY-BLOOD
 */

const CAMINHO_RAIZ_PROJETO =
    path.join(
        __dirname,
        ".."
    );


/*
 * Caminho do Front-End.
 */

const CAMINHO_FRONT_END =
    path.join(
        CAMINHO_RAIZ_PROJETO,
        "Front-End"
    );


/* ============================================================
   03. MIDDLEWARES
   ============================================================ */


/*
 * Permite que o servidor receba informações
 * enviadas em formato JSON.
 */

app.use(
    express.json({
        limit: "2mb"
    })
);


/*
 * Permite receber formulários tradicionais.
 *
 * Não é obrigatório para tudo que faremos,
 * mas deixa o servidor preparado para diferentes
 * formas de envio de dados.
 */

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);


/*
 * Serve os arquivos do Front-End.
 *
 * Isso permite que o próprio Node.js entregue:
 *
 * HTML
 * CSS
 * JavaScript
 * imagens
 * etc.
 */

app.use(
    express.static(
        CAMINHO_FRONT_END
    )
);


/* ============================================================
   04. FUNÇÕES DO BANCO DE DADOS
   ============================================================ */


/*
 * O projeto agora utiliza o Supabase como banco principal.
 *
 * O acesso ao Supabase fica concentrado no Back-End.
 *
 * O Front-End nunca recebe a chave secreta.
 */


/* ============================================================
   05. GERADOR DE IDs
   ============================================================ */


/*
 * Gera IDs únicos para os registros.
 *
 * Exemplo:
 *
 * categoria-mg4k2x8a-x7f92p
 * item-mg4k31aa-a82k91
 * jogador-mg4k91bd-p92kd1
 */

function gerarId(
    prefixo
) {

    const tempo =
        Date.now()
            .toString(36);


    const aleatorio =
        Math.random()
            .toString(36)
            .substring(
                2,
                8
            );


    return (
        prefixo +
        "-" +
        tempo +
        "-" +
        aleatorio
    );

}


/* ============================================================
   06. DATA ATUAL
   ============================================================ */


/*
 * Mantemos todas as datas em ISO.
 *
 * Exemplo:
 *
 * 2026-10-06T03:30:00.000Z
 */

function obterDataAtual() {

    return new Date()
        .toISOString();

}


/* ============================================================
   07. ROTA PRINCIPAL
   ============================================================ */


/*
 * Ao acessar:
 *
 * http://localhost:3000/
 *
 * o servidor entrega o index.html
 * do Front-End.
 */

app.get(
    "/",
    function (
        req,
        res
    ) {

        res.sendFile(
            path.join(
                CAMINHO_FRONT_END,
                "index.html"
            )
        );

    }
);


/* ============================================================
   08. STATUS DO SERVIDOR
   ============================================================ */


/*
 * Essa rota serve para verificar rapidamente
 * se o Back-End está funcionando.
 *
 * URL:
 *
 * /api/status
 *
 *
 * Agora os números são consultados diretamente
 * nas tabelas do Supabase.
 */

app.get(
    "/api/status",
    async function (
        req,
        res
    ) {

        try {

            /*
             * Fazemos as quatro consultas em paralelo.
             */

            const [
                resultadoCategorias,
                resultadoItens,
                resultadoJogadores,
                resultadoHistorico
            ] = await Promise.all([

                supabase
                    .from("categorias")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    ),

                supabase
                    .from("itens")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    ),

                supabase
                    .from("jogadores")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    ),

                supabase
                    .from("historico")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )

            ]);


            /*
             * Se alguma consulta falhar,
             * consideramos que o banco não está disponível.
             */

            if (
                resultadoCategorias.error
            ) {

                throw resultadoCategorias.error;

            }


            if (
                resultadoItens.error
            ) {

                throw resultadoItens.error;

            }


            if (
                resultadoJogadores.error
            ) {

                throw resultadoJogadores.error;

            }


            if (
                resultadoHistorico.error
            ) {

                throw resultadoHistorico.error;

            }


            res.status(200)
                .json({

                    sucesso:
                        true,

                    servidor:
                        "online",

                    mensagem:
                        "UNHOLY BLOOD — Back-End funcionando.",

                    banco:

                        {

                            conectado:
                                true,

                            versao:
                                1,

                            categorias:
                                resultadoCategorias.count ||
                                0,

                            itens:
                                resultadoItens.count ||
                                0,

                            jogadores:
                                resultadoJogadores.count ||
                                0,

                            historico:
                                resultadoHistorico.count ||
                                0

                        }

                });

        }
        catch (erro) {

            console.error(
                "Erro ao consultar o Supabase:",
                erro
            );


            res.status(500)
                .json({

                    sucesso:
                        false,

                    servidor:
                        "online",

                    banco:
                        {

                            conectado:
                                false

                        },

                    mensagem:
                        "O servidor está funcionando, mas houve um erro ao acessar o banco de dados."

                });

        }

    }
);


/* ============================================================
   09. INFORMAÇÕES DA API
   ============================================================ */


/*
 * Rota para visualizar rapidamente
 * quais grupos de informações a API possui.
 *
 * URL:
 *
 * /api
 */

app.get(
    "/api",
    function (
        req,
        res
    ) {

        res.status(200)
            .json({

                nome:
                    "UNHOLY BLOOD API",

                versao:
                    "1.0.0",

                status:
                    "online",

                rotas:
                    {

                        categorias:
                            "/api/categorias",

                        itens:
                            "/api/itens",

                        jogadores:
                            "/api/jogadores",

                        historico:
                            "/api/historico",

                        status:
                            "/api/status"

                    }

            });

    }
);


/* ============================================================
   10. IMPORTAÇÃO DAS ROTAS
   ============================================================ */


/*
 * Cada arquivo será responsável por uma parte
 * específica do sistema.
 *
 * categorias.js
 * itens.js
 * jogadores.js
 * historico.js
 *
 * Todos recebem a mesma conexão do Supabase.
 */


/*
 * CATEGORIAS
 */

const criarRotasCategorias =
    require(
        "./routes/categorias"
    );


/*
 * ITENS
 */

const criarRotasItens =
    require(
        "./routes/itens"
    );


/*
 * JOGADORES
 */

const criarRotasJogadores =
    require(
        "./routes/jogadores"
    );


/*
 * HISTÓRICO
 */

const criarRotasHistorico =
    require(
        "./routes/historico"
    );


/* ============================================================
   11. REGISTRO DAS ROTAS
   ============================================================ */


/*
 * As funções abaixo receberão:
 *
 * supabase
 * gerarId
 * obterDataAtual
 *
 * Assim todos os módulos utilizam
 * a mesma conexão com o banco.
 */


/*
 * CATEGORIAS
 */

app.use(
    "/api/categorias",
    criarRotasCategorias({

        supabase,
        gerarId,
        obterDataAtual

    })
);


/*
 * ITENS
 */

app.use(
    "/api/itens",
    criarRotasItens({

        supabase,
        gerarId,
        obterDataAtual

    })
);


/*
 * JOGADORES
 */

app.use(
    "/api/jogadores",
    criarRotasJogadores({

        supabase,
        gerarId,
        obterDataAtual

    })
);


/*
 * HISTÓRICO
 */

app.use(
    "/api/historico",
    criarRotasHistorico({

        supabase,
        gerarId,
        obterDataAtual

    })
);


/* ============================================================
   12. ROTA 404 DA API
   ============================================================ */


/*
 * Se alguém tentar acessar uma rota /api
 * que não existe, retornamos JSON.
 */

app.use(
    "/api",
    function (
        req,
        res
    ) {

        res.status(404)
            .json({

                sucesso:
                    false,

                mensagem:
                    "Rota da API não encontrada.",

                caminho:
                    req.originalUrl

            });

    }
);


/* ============================================================
   13. TRATAMENTO GLOBAL DE ERROS
   ============================================================ */


/*
 * Caso alguma rota gere um erro que não tenha
 * sido tratado anteriormente, ele passa por aqui.
 */

app.use(
    function (
        erro,
        req,
        res,
        next
    ) {

        console.error(
            "Erro interno do servidor:",
            erro
        );


        if (
            res.headersSent
        ) {

            return next(
                erro
            );

        }


        res.status(500)
            .json({

                sucesso:
                    false,

                mensagem:
                    "Ocorreu um erro interno no servidor."

            });

    }
);


/* ============================================================
   14. INICIALIZAÇÃO DO SERVIDOR
   ============================================================ */


/*
 * Inicia o servidor na porta definida.
 */

app.listen(
    PORTA,
    function () {

        console.log(
            ""
        );


        console.log(
            "=============================================="
        );


        console.log(
            "        UNHOLY BLOOD — BACK-END"
        );


        console.log(
            "=============================================="
        );


        console.log(
            ""
        );


        console.log(
            `Servidor iniciado na porta ${PORTA}.`
        );


        console.log(
            `Site: http://localhost:${PORTA}`
        );


        console.log(
            `API:  http://localhost:${PORTA}/api`
        );


        console.log(
            `Status: http://localhost:${PORTA}/api/status`
        );


        console.log(
            ""
        );


        console.log(
            "Banco: Supabase"
        );


        console.log(
            "Aguardando conexões..."
        );


        console.log(
            ""
        );

    }
);


/* ============================================================
   FIM DO SERVER.JS
   ============================================================ */