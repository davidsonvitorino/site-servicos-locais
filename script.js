
// ============ SELEÇÃO DE ELEMENTOS ============ 
const listaAnuncios = [];
let categoriaAtiva = "Todos";

const campoBusca = document.getElementById("campo-busca");
const form = document.getElementById("form-anuncio");
const main = document.querySelector("main");

// ============ FUNÇÕES AUXILIARES ============ 

// Remove caracteres não numéricos do número de WhatsApp
function limparNumero(numero) {
    return numero.replace(/\D/g, "");
}

// Salva anúncios no LocalStorage
function salvarAnuncios() {
    localStorage.setItem("anuncios", JSON.stringify(listaAnuncios));
}

// Carrega anúncios do LocalStorage
function carregarAnuncios() {
    const dados = localStorage.getItem("anuncios");

    if (dados) {
        const listaSalva = JSON.parse(dados);

        // Garante que todos os anúncios tenham um id válido
        listaSalva.forEach(anuncio => {
            if (!anuncio.id) {
                anuncio.id = Date.now() + Math.floor(Math.random() * 10000);
            }
        });

        listaAnuncios.length = 0;
        listaAnuncios.push(...listaSalva);

        // Salva novamente para garantir que todos tenham id
        salvarAnuncios();

        renderizarAnuncios(listaAnuncios);
    }
}

// Filtra anúncios pelo texto digitado
function filtrarAnuncios(textoBusca) {
    return listaAnuncios.filter((anuncio) => {
        return (
            anuncio.nome.toLowerCase().includes(textoBusca.toLowerCase()) ||
            anuncio.descricao.toLowerCase().includes(textoBusca.toLowerCase()) || 
            anuncio.categoria.toLowerCase().includes(textoBusca.toLowerCase())
        );
    });
}

// Filtra anúncios por categoria
function filtrarCategoria(botao, categoria) {
    const botoes = document.querySelectorAll(".btn-filtro");
    botoes.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    categoriaAtiva = categoria;
    renderizarCategoriaAtual();
}

// Renderiza anúncios conforme a categoria ativa
function renderizarCategoriaAtual() {
    if (categoriaAtiva === "Todos") {
        renderizarAnuncios(listaAnuncios);
    } else {
        const filtrados = listaAnuncios.filter((anuncio) => anuncio.categoria === categoriaAtiva);
        renderizarAnuncios(filtrados);
    }
}


// Renderiza os anúncios na tela
function renderizarAnuncios(lista) {
    main.innerHTML = "";

    if (lista.length === 0) {
        main.innerHTML = '<p style="text-align: center; color: #999;">Nenhum anúncio cadastrado.</p>';
        return;
    }

    lista.forEach((anuncio) => {
        const div = document.createElement("div");
        div.classList.add("anuncio");

        div.innerHTML = `
            ${anuncio.imagem ? `<img src="${anuncio.imagem}" class="imagem-anuncio">` : ""}
            <h2>${anuncio.nome}</h2>
            <p>${anuncio.descricao}</p>
            <p class="categoria"><strong>Categoria:</strong> ${anuncio.categoria}</p>

            <div class="acoes">
                <a href="https://wa.me/55${anuncio.whatsapp}?text=Olá,%20vi%20seu%20anúncio%20no%20site%20de%20Serviços%20Locais!" 
                   target="_blank" class="whatsapp">
                    Whatsapp
                </a>
                <button class="excluir" data-id="${anuncio.id}">Excluir</button>
            </div>
        `;

        main.appendChild(div);
    });
}

// Cria e salva um novo anúncio
function salvarAnuncioComImagem(nome, descricao, whatsapp, categoria, imagem) {
    const novoAnuncio = {
        id: Date.now(),
        nome,
        descricao,
        whatsapp,
        categoria,
        imagem
    };

    listaAnuncios.push(novoAnuncio);
    salvarAnuncios();
    renderizarCategoriaAtual();
    form.reset();
    alert("Anúncio cadastrado com sucesso!");
}

// ============ EVENTOS ============ 

// Cadastro de anúncio
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const descricao = document.getElementById("descricao").value;
    const whatsapp = limparNumero(document.getElementById("whatsapp").value);
    const categoria = document.getElementById("categoria").value;
    const imagemInput = document.getElementById("imagem");
    let arquivo = null;

    if (imagemInput && imagemInput.files.length > 0) {
        arquivo = imagemInput.files[0];
    }

    if (!nome || !descricao || !whatsapp || !categoria) {
        alert("Preencha todos os campos.");
        return;
    }

    if (whatsapp.length < 10) {
        alert("Digite um número de Whatsapp válido.");
        return;
    }

    if (arquivo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            salvarAnuncioComImagem(nome, descricao, whatsapp, categoria, e.target.result);
        };
        reader.readAsDataURL(arquivo);
    } else {
        salvarAnuncioComImagem(nome, descricao, whatsapp, categoria, "");
    }
});

// Busca em tempo real
campoBusca.addEventListener("input", () => {
    const texto = campoBusca.value.trim();

    if (texto.length < 3) {
        renderizarAnuncios(listaAnuncios);
        return;
    }

    const resultado = filtrarAnuncios(texto);
    renderizarAnuncios(resultado);
});

// Excluir anúncio individual
main.addEventListener("click", (event) => {
    const botaoExcluir = event.target.closest(".excluir");
    if (!botaoExcluir) return;

    console.log("HTML do botão clicado:", botaoExcluir.outerHTML);

    const confirmar = confirm("Tem certeza que deseja excluir este anúncio?");
    if (!confirmar) return;

    const id = Number(botaoExcluir.getAttribute("data-id"));
    console.log("Botão excluir clicado. ID do anúncio:", id);
    console.log("Lista de anúncios antes:", JSON.stringify(listaAnuncios));
    const novaLista = listaAnuncios.filter((anuncio) => anuncio.id !== id);

    listaAnuncios.length = 0;
    listaAnuncios.push(...novaLista);
    console.log("Lista de anúncios depois:", JSON.stringify(listaAnuncios));

    salvarAnuncios();
    renderizarAnuncios(listaAnuncios);
});

// Limpar todos os anúncios
const botaoLimpar = document.getElementById("limpar-tudo");
botaoLimpar.addEventListener("click", () => {
    const confirmar = confirm("Deseja apagar todos os anúncios?");
    if (!confirmar) return;

    listaAnuncios.length = 0;
    salvarAnuncios();
    renderizarAnuncios(listaAnuncios);
});

// Carregar anúncios ao iniciar
carregarAnuncios();

// Garante que ao recarregar a página, o filtro ativo é "Todos"
window.addEventListener("DOMContentLoaded", () => {
    categoriaAtiva = "Todos";
    renderizarCategoriaAtual();
});