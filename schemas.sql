CREATE DATABASE IF NOT EXISTS almoxarifado;

USE almoxarifado;

CREATE TABLE IF NOT EXISTS administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(180) NOT NULL,
    senha VARCHAR(255)
);

INSERT INTO administrador (usuario, senha) 
VALUES ('luis', '$2a$12$Ay8NpuncNALkmhYTjP8Bk.6V3fHwWPwO4tWwqlYjBLFL2qm2dmQQi');


CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(180) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS estoque (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    qntd INT,
    tipo VARCHAR(255),
	imagem VARCHAR(255) DEFAULT 'sem_foto.png'
);

CREATE TABLE IF NOT EXISTS historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome INT,
    qntd INT,
    tipo_movimentacao VARCHAR(20), -- Salva 'RETIRADA' ou 'DEVOLUÇÃO'
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO usuario (usuario, senha)
VALUES ('eu','2');