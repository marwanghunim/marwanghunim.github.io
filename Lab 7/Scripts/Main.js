// Limpar carrinho antigo (se existir)
localStorage.removeItem("carrinho");
if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

// Buscar produtos da API ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  fetch("https://deisishop.pythonanywhere.com/products/")
    .then(response => response.json())
    .then(produtos => {
      window.todosOsProdutos = produtos; // Guardar produtos em memória
      carregarCategorias(produtos);// Carregar categorias no select
      carregarProdutos(produtos);// Carregar todos os produtos inicialmente
      atualizaCesto();//  Atualizar cesto ao carregar a página
    })
    .catch(error => {
      console.error("Erro ao buscar produtos:", error);// Tratar erro de fetch
    });
});

function carregarCategorias(produtos) {
  const selectCategoria = document.getElementById("categoria");// Seleciona o elemento de categoria
  const selectOrdenar = document.getElementById("ordenar");// Seleciona o elemento de ordenação
  const inputPesquisa = document.getElementById("pesquisa");// Seleciona o elemento de pesquisa

  if (!selectCategoria || !selectOrdenar || !inputPesquisa) return;// Verifica se os elementos existem

  // Extrai categorias únicas
  const categorias = [...new Set(produtos.map(p => p.category))];

  // Preenche o select de categorias
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });

  //Adiciona eventos de atualização
  selectCategoria.addEventListener("change", atualizarProdutosFiltrados);
  selectOrdenar.addEventListener("change", atualizarProdutosFiltrados);
  inputPesquisa.addEventListener("input", atualizarProdutosFiltrados); // em tempo real
}

// Função para atualizar produtos com base nos filtros
function atualizarProdutosFiltrados() {
  const categoriaSelecionada = document.getElementById("categoria").value;
  const ordem = document.getElementById("ordenar").value;
  const pesquisa = document.getElementById("pesquisa").value.toLowerCase().trim();

  let lista = [...window.todosOsProdutos];// Copia dos produtos originais

  // Filtro por categoria
  if (categoriaSelecionada !== "") {
    lista = lista.filter(p => p.category === categoriaSelecionada);
  }

  // Filtro por pesquisa
  if (pesquisa !== "") {
    lista = lista.filter(p => p.title.toLowerCase().includes(pesquisa));
  }

  // Ordenação
  if (ordem === "asc") {
    lista.sort((a, b) => a.price - b.price);
  } else if (ordem === "desc") {
    lista.sort((a, b) => b.price - a.price);
  }

  carregarProdutos(lista);// Recarrega produtos filtrados
}

// Função para carregar produtos no contêiner
function carregarProdutos(produtos) {
  const container = document.getElementById("produtos");

  // Verifica se o contêiner existe
  if (!container) {
    console.error('Elemento com id="produtos" não encontrado.');
    return;
  }

  // Limpa o contêiner antes de adicionar novos produtos
  container.innerHTML = "";
  produtos.forEach((produto) => {
    const artigo = criarProduto(produto);
    container.appendChild(artigo);
  });
}

// Função para criar o elemento de produto
function criarProduto(produto) {
  const artigo = document.createElement("article");
  const titulo = document.createElement("h2");
  const imagem = document.createElement("img");
  const descricao = document.createElement("p");
  const preco = document.createElement("span");
  const botao = document.createElement("button");

  // Preencher os elementos com os dados do produto
  titulo.textContent = produto.title;
  imagem.src = produto.image;
  imagem.alt = produto.title;
  descricao.textContent = produto.description;
  preco.textContent = `Preço: €${produto.price.toFixed(2)}`;
  botao.textContent = "+ Adicionar ao cesto";

  // Adicionar evento ao botão
  botao.addEventListener("click", () => {
    adicionarAoCesto(produto);
  });

  // Montar o artigo
  artigo.append(titulo, imagem, descricao, preco, botao);
  return artigo;
}

// Função para adicionar produto ao cesto
function adicionarAoCesto(produto) {
  let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
  lista.push(produto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(lista));
  console.log(`Produto "${produto.title}" adicionado ao cesto!`);
  atualizaCesto();
}

// Função para atualizar o cesto de compras
function atualizaCesto() {
  const containerCesto = document.getElementById("cesto");// Seleciona o contêiner do cesto
  containerCesto.innerHTML = "";

  const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];// Recupera a lista do localStorage

  // Verifica se o cesto está vazio
  if (lista.length === 0) {
    const vazio = document.createElement("p");
    vazio.textContent = "O cesto está vazio.";
    containerCesto.appendChild(vazio);
    return;
  }

  // Adiciona cada produto ao cesto
  lista.forEach((produto, index) => {
    const artigoCesto = criaProdutoCesto(produto, index);
    containerCesto.appendChild(artigoCesto);
  });

  // Calcula e exibe o total
  const total = lista.reduce((soma, p) => soma + p.price, 0);
  const totalElem = document.createElement("p");
  totalElem.classList.add("total");
  totalElem.textContent = `Total: €${total.toFixed(2)}`;
  containerCesto.appendChild(totalElem);

  // Botão para finalizar compra
  const btnFinalizar = document.createElement("button");
  btnFinalizar.textContent = "Finalizar Compra";
  btnFinalizar.style.marginTop = "10px";
  btnFinalizar.addEventListener("click", mostrarFormularioCompra);
  containerCesto.appendChild(btnFinalizar);
}

// Função para mostrar o formulário de compra
function mostrarFormularioCompra() {
  if (document.getElementById("compra")) return;// Evita duplicar o formulário

  // Criar seção de compra
  const secCompra = document.createElement("section");
  secCompra.id = "compra";
  secCompra.innerHTML = `
    <h2>Finalizar Compra</h2>

    <label for="name">Nome:</label>
    <input type="text" id="name" required>

    <label>
      <input type="checkbox" id="student"> Sou estudante
    </label>

    <label for="coupon">Cupão:</label>
    <input type="text" id="coupon">

    <button id="comprar">Comprar</button>

    <div id="resultado-compra"></div>
  `;

  // Adiciona a seção ao main
  const main = document.querySelector("main");
  main.appendChild(secCompra);

  // Adiciona evento ao botão de comprar
  document.getElementById("comprar").addEventListener("click", efetuarCompra);
}


// Função para criar o elemento do produto no cesto
function criaProdutoCesto(produto, index) {
  const artigo = document.createElement("article");
  const titulo = document.createElement("h3");
  const preco = document.createElement("span");
  const botaoRemover = document.createElement("button");

  titulo.textContent = produto.title;
  preco.textContent = `€${produto.price.toFixed(2)}`;
  botaoRemover.textContent = "Remover";

  // Evento para remover o produto do cesto
  botaoRemover.addEventListener("click", () => {
    let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
    lista.splice(index, 1);
    localStorage.setItem("produtos-selecionados", JSON.stringify(lista));
    atualizaCesto();
  });

  // Montar o artigo do cesto
  artigo.append(titulo, preco, botaoRemover);
  artigo.style.border = "1px solid #ddd";
  artigo.style.padding = "8px";
  artigo.style.margin = "5px 0";
  artigo.style.borderRadius = "5px";

  return artigo;
}

// Função para efetuar a compra
document.addEventListener("DOMContentLoaded", () => {
  const btnComprar = document.getElementById("comprar");
  if (btnComprar) {
    btnComprar.addEventListener("click", efetuarCompra);
  }
});

// Função para efetuar a compra
function efetuarCompra() {
  const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

  // Verifica se o cesto está vazio
  if (lista.length === 0) {
    alert("O cesto está vazio!");
    return;
  }

  // Coleta dados do formulário
  const name = document.getElementById("name").value.trim();
  const student = document.getElementById("student").checked;
  const coupon = document.getElementById("coupon").value.trim();

  // Validação do nome
  if (!name) {
    alert("Por favor, insere o teu nome antes de finalizar a compra.");
    return;
  }

  const produtosIDs = lista.map(p => p.id);// Extrai IDs dos produtos

  // Prepara dados para o envio
  const dadosCompra = {
    products: produtosIDs,
    student: student,
    coupon: coupon || "",
    name: name
  };

  // Envia dados para a API
  fetch("https://deisishop.pythonanywhere.com/buy/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(dadosCompra)
  })
    .then(async response => {
      const data = await response.json();

      // Verifica se a resposta é um erro
      if (!response.ok) {
        throw { status: response.status, data };
      }
      // Compra bem-sucedida
      mostrarResultadoCompra(data);
      localStorage.removeItem("produtos-selecionados");
      atualizaCesto();
    })
    .catch(err => {
      tratarErroCompra(err);
    });
}

// Função para mostrar o resultado da compra
function mostrarResultadoCompra(data) {
  const container = document.getElementById("resultado-compra");
  container.innerHTML = `
    <div style="background:#e8f5e9; padding:15px; border-radius:10px; margin-top:10px; color:#1e40af;">
      <p><strong>Contactes:</strong> ${data.message}</p>
      <p><strong>Morada:</strong> ${data.address}</p>
      <p><strong>Total:</strong> €${parseFloat(data.totalCost).toFixed(2)}</p>
      <p><strong>Referência de pagamento:</strong> ${data.reference}</p>
    </div>
  `;
}

function tratarErroCompra(err) {
  const container = document.getElementById("resultado-compra");
  let msg = "Ocorreu um erro ao processar a compra.";
  // Personaliza a mensagem com base no erro
  if (err.data && err.data.detail) msg = err.data.detail;
  // Exibe a mensagem de erro
  container.innerHTML = `
    <div style="background:#fdecea; padding:15px; border-radius:10px; margin-top:10px; color:#b71c1c;">
      ${msg}
    </div>
  `;
}