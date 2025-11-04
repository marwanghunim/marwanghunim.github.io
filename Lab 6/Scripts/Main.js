// Dados dos produtos
localStorage.removeItem("carrinho");
if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

// DOM - carregar os produtos
document.addEventListener("DOMContentLoaded", function () {
  carregarProdutos(produtos);
});

// Carregar produtos na página
function carregarProdutos(produtos) {
  const container = document.getElementById("produtos");

  if (!container) {
    console.error('Elemento com id="produtos" não encontrado.');
    return;
  }

  container.innerHTML = ""; // Limpa os produtos antigos antes de adicionar

  produtos.forEach((produto) => {
    const artigo = criarProduto(produto);
    container.appendChild(artigo);
  });
}

// Criar elemento de produto
function criarProduto(produto) {
  const artigo = document.createElement("article");
  const titulo = document.createElement("h2");
  const imagem = document.createElement("img");
  const descricao = document.createElement("p");
  const preco = document.createElement("span");
  const botao = document.createElement("button");

  // Preencher dados do produto
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

// Adicionar produto ao cesto
function adicionarAoCesto(produto) {
  // Buscar lista atual
  let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

  // Adicionar o produto
  lista.push(produto);

  // Atualizar localStorage
  localStorage.setItem("produtos-selecionados", JSON.stringify(lista));

  console.log(`Produto "${produto.title}" adicionado ao cesto!`);
}

// Atualizar visualmente o cesto
function atualizaCesto() {
  const containerCesto = document.getElementById("cesto");
  containerCesto.innerHTML = ""; // Limpar conteúdo antigo
  const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

  // Verificar se o cesto está vazio
  if (lista.length === 0) {
    const vazio = document.createElement("p");
    vazio.textContent = "O cesto está vazio.";
    containerCesto.appendChild(vazio);
    return;
  }

  // Percorre cada produto e cria um article com botão de remover
  lista.forEach((produto, index) => {
    const artigoCesto = criaProdutoCesto(produto, index);
    containerCesto.appendChild(artigoCesto);
  });

  // Mostrar total
  const total = lista.reduce((soma, p) => soma + p.price, 0);
  const totalElem = document.createElement("p");
  totalElem.textContent = `Total: €${total.toFixed(2)}`;
  totalElem.style.fontWeight = "bold";
  containerCesto.appendChild(totalElem);
}

// Criar elemento de produto no cesto com botão de remover
function criaProdutoCesto(produto, index) {
  const artigo = document.createElement("article");
  const titulo = document.createElement("h3");
  const preco = document.createElement("span");
  const botaoRemover = document.createElement("button");

  // Preencher dados do produto
  titulo.textContent = produto.title;
  preco.textContent = `€${produto.price.toFixed(2)}`;
  botaoRemover.textContent = "Remover";

  // Adicionar evento ao botão de remover
  botaoRemover.addEventListener("click", () => {
    // 1 - Buscar a lista atual
    let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

    // 2 - Remover o produto pelo índice
    lista.splice(index, 1);

    // 3 - Atualizar o localStorage
    localStorage.setItem("produtos-selecionados", JSON.stringify(lista));

    // 4 - Atualizar o cesto visualmente
    atualizaCesto();
  });

  // Montar o artigo
  artigo.append(titulo, preco, botaoRemover);
  artigo.style.border = "1px solid #ddd";
  artigo.style.padding = "8px";
  artigo.style.margin = "5px 0";
  artigo.style.borderRadius = "5px";

  return artigo;
}


// Adicionar produto ao cesto (versão atualizada)
function adicionarAoCesto(produto) {
  let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
  lista.push(produto);
  localStorage.setItem("produtos-selecionados", JSON.stringify(lista));
  console.log(`Produto "${produto.title}" adicionado ao cesto!`);

  // Atualiza o cesto visualmente
  atualizaCesto();
}

// Inicializar a página
document.addEventListener("DOMContentLoaded", function () {
  carregarProdutos(produtos);
  atualizaCesto(); // Mostra o cesto ao iniciar
});