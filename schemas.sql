<<<<<<< HEAD
CREATE DATABASE IF NOT EXISTS almoxarifado;

USE almoxarifado;

CREATE TABLE IF NOT EXISTS administrador (
=======

USE almoxarifado;

CREATE TABLE administrador (
>>>>>>> b1bfbd5f16f94a9e4aff50e2c40c8d146bcdc21b
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(180) NOT NULL,
    senha VARCHAR(255)
);

INSERT INTO administrador (usuario, senha) 
VALUES ('luis', '$2a$12$Ay8NpuncNALkmhYTjP8Bk.6V3fHwWPwO4tWwqlYjBLFL2qm2dmQQi');


<<<<<<< HEAD
CREATE TABLE IF NOT EXISTS usuario (
=======
CREATE TABLE usuario (
>>>>>>> b1bfbd5f16f94a9e4aff50e2c40c8d146bcdc21b
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(180) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

<<<<<<< HEAD
CREATE TABLE IF NOT EXISTS estoque (
=======
CREATE TABLE estoque (
>>>>>>> b1bfbd5f16f94a9e4aff50e2c40c8d146bcdc21b
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    qntd INT,
    tipo VARCHAR(255),
	imagem VARCHAR(255) DEFAULT 'sem_foto.png'
);

<<<<<<< HEAD
CREATE TABLE IF NOT EXISTS historico (
=======
CREATE TABLE historico (
>>>>>>> b1bfbd5f16f94a9e4aff50e2c40c8d146bcdc21b
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome INT,
    qntd INT,
    tipo_movimentacao VARCHAR(20), -- Salva 'RETIRADA' ou 'DEVOLUÇÃO'
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO usuario (usuario, senha)
VALUES ('eu','2');