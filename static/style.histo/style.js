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