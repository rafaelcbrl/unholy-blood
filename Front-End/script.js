/* ============================================================
   UNHOLY BLOOD
   SCRIPT PRINCIPAL — PÁGINA INICIAL
   ============================================================ */


/* ============================================================
   01. ELEMENTOS DO MENU
   ============================================================ */

const menuLateral = document.getElementById("menu-lateral");

const menuOverlay = document.getElementById("menu-overlay");

const botaoMenu = document.getElementById("botao-menu");

const botaoFecharMenu = document.getElementById(
    "botao-fechar-menu"
);


/* ============================================================
   02. ABRIR O MENU LATERAL
   ============================================================ */

function abrirMenuLateral() {

    if (!menuLateral || !menuOverlay) {
        return;
    }

    menuLateral.classList.add("aberto");

    menuOverlay.classList.add("aberto");

    if (botaoMenu) {
        botaoMenu.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    document.body.classList.add("menu-aberto");

}


/* ============================================================
   03. FECHAR O MENU LATERAL
   ============================================================ */

function fecharMenuLateral() {

    if (!menuLateral || !menuOverlay) {
        return;
    }

    menuLateral.classList.remove("aberto");

    menuOverlay.classList.remove("aberto");

    if (botaoMenu) {
        botaoMenu.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    document.body.classList.remove("menu-aberto");

}


/* ============================================================
   04. BOTÃO — ABRIR MENU
   ============================================================ */

if (botaoMenu) {

    botaoMenu.addEventListener(
        "click",
        function () {

            abrirMenuLateral();

        }
    );

}


/* ============================================================
   05. BOTÃO — FECHAR MENU
   ============================================================ */

if (botaoFecharMenu) {

    botaoFecharMenu.addEventListener(
        "click",
        function () {

            fecharMenuLateral();

        }
    );

}


/* ============================================================
   06. FECHAR AO CLICAR NO OVERLAY
   ============================================================ */

if (menuOverlay) {

    menuOverlay.addEventListener(
        "click",
        function () {

            fecharMenuLateral();

        }
    );

}


/* ============================================================
   07. FECHAR AO CLICAR EM UMA OPÇÃO DO MENU
   ============================================================ */

const linksMenu = document.querySelectorAll(
    ".menu-lateral a"
);

linksMenu.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                fecharMenuLateral();

            }
        );

    }
);


/* ============================================================
   08. FECHAR COM A TECLA ESC
   ============================================================ */

document.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Escape") {

            fecharMenuLateral();

        }

    }
);


/* ============================================================
   09. ROLAGEM SUAVE — LINKS INTERNOS
   ============================================================ */

const linksInternos = document.querySelectorAll(
    'a[href^="#"]'
);

linksInternos.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function (evento) {

                const destino =
                    link.getAttribute("href");


                /* ------------------------------------------------
                   Ignora links vazios
                ------------------------------------------------ */

                if (
                    !destino ||
                    destino === "#"
                ) {
                    return;
                }


                /* ------------------------------------------------
                   Procura o elemento de destino
                ------------------------------------------------ */

                const elementoDestino =
                    document.querySelector(destino);


                /* ------------------------------------------------
                   Se o destino não existir,
                   não interfere no link
                ------------------------------------------------ */

                if (!elementoDestino) {
                    return;
                }


                /* ------------------------------------------------
                   Impede o salto instantâneo
                ------------------------------------------------ */

                evento.preventDefault();


                /* ------------------------------------------------
                   Faz a rolagem suave
                ------------------------------------------------ */

                elementoDestino.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    }
);


/* ============================================================
   10. BLOQUEAR SCROLL COM O MENU ABERTO
   ============================================================ */

function atualizarScrollMenu() {

    if (!menuLateral) {
        return;
    }


    if (
        menuLateral.classList.contains(
            "aberto"
        )
    ) {

        document.body.style.overflow =
            "hidden";

    } else {

        document.body.style.overflow =
            "";

    }

}


/* ============================================================
   11. OBSERVAR ABERTURA E FECHAMENTO DO MENU
   ============================================================ */

if (menuLateral) {

    const observadorMenu =
        new MutationObserver(
            function () {

                atualizarScrollMenu();

            }
        );


    observadorMenu.observe(
        menuLateral,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );

}


/* ============================================================
   12. GARANTIR ESTADO INICIAL DO MENU
   ============================================================ */

function inicializarMenu() {

    if (!menuLateral) {
        return;
    }

    menuLateral.classList.remove(
        "aberto"
    );


    if (menuOverlay) {

        menuOverlay.classList.remove(
            "aberto"
        );

    }


    if (botaoMenu) {

        botaoMenu.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    document.body.classList.remove(
        "menu-aberto"
    );


    document.body.style.overflow =
        "";

}


/* ============================================================
   13. BOTÃO — CONHECER NOSSA HISTÓRIA
   ============================================================ */

const botaoHistoria =
    document.querySelector(
        '.hero-botao[href="#lenda"]'
    );


if (botaoHistoria) {

    botaoHistoria.addEventListener(
        "click",
        function (evento) {

            const secaoLenda =
                document.getElementById(
                    "lenda"
                );


            if (!secaoLenda) {
                return;
            }


            evento.preventDefault();


            secaoLenda.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }
    );

}


/* ============================================================
   14. FECHAR MENU AO REDIMENSIONAR A TELA
   ============================================================ */

window.addEventListener(
    "resize",
    function () {

        /*
         * Se a tela ficar grande novamente,
         * garantimos que o menu volte ao
         * estado fechado.
         */

        if (window.innerWidth > 1100) {

            fecharMenuLateral();

        }

    }
);


/* ============================================================
   15. INICIALIZAÇÃO DA PÁGINA
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarMenu();


        console.log(
            "☩ Unholy Blood — Arquivo da Guilda carregado."
        );

    }
);