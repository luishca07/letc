window.onload = function () {
    // Puxa o id do estoque e as colunas
    let linhas = document.querySelectorAll("#estoque tr");
    // Por onde começar na coluna
    for (let i = 1; i < linhas.length; i++) {
        let quantidade = parseInt(linhas[i].children[1].innerText);
    // Pega o numero da coluna quantidade para verificar se e menor que 5
    if (quantidade < 5) {
            linhas[i].classList.add("estoque-baixo");
    // Se for menor que 5 puxa a classe do css
        }
    }
};

function ampliarImagem(srcCaminho) {
    // Pega o modal e a tag da imagem grande
    var modal = document.getElementById("meuModal");
    var imgGrande = document.getElementById("imagemGrande");
    
    // Passa o caminho da imagem clicada para a imagem grande e mostra o modal
    imgGrande.src = srcCaminho;
    modal.style.display = "flex";
}

function fecharImagem() {
    // Esconde o modal novamente
    document.getElementById("meuModal").style.display = "none";
}

function filtrarTabela() {
    let input = document.getElementById("campoBusca");
    let filtro = input.value.toLowerCase();
    let tabela = document.getElementById("tabelaDados");
    let linhas = tabela.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    for (let i = 0; i < linhas.length; i++) {
        let textoLinha = linhas[i].textContent.toLowerCase();
        if (textoLinha.includes(filtro)) {
            linhas[i].style.display = "";
        } else {
            linhas[i].style.display = "none";
        }
    }
}