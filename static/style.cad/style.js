function but(){

// Alerta de item cadastrado e não cadastrado

Swal.fire({
  title: "Você quer Cadastrar este item?",
  showDenyButton: true, 
  confirmButtonText: "Sim",
  denyButtonText: `Não`
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire("Cadastrado", "", "success");
  } else if (result.isDenied) {
    Swal.fire("Não Cadastrado", "", "error");
  }
});
}

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