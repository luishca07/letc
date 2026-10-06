
function verificarlogin() {
    console.log (x=1);

    // Usuario e senha

    const usuarioCorreto = "senai";
    const senhaCorreta = "1234";

    // Valores do usuario e senha
    
    const usuarioDigitado = document.getElementById("usuario").value;
    const senhaDigitada = document.getElementById("senha").value;

    // Verificaçao

    if (usuarioDigitado === usuarioCorreto && senhaDigitada === senhaCorreta) {

    // Se tiver correto

    window.location.href = "../pag.estoque/consultaestoque.html";

    } else {

    // Se tiver errado

    Swal.fire({
    icon: "error",
    title: "Algo está errado...",
    text: "Verifique se o usuario e senha estão corretos",
});

    }
}