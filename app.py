from flask import Flask, render_template, request, redirect, session, Response, jsonify, send_from_directory
from flask import Flask, render_template, request, redirect, session, Response
from flask_cors import CORS
import mysql.connector
import os
import datetime
from flask_bcrypt import Bcrypt
import csv
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.secret_key = os.getenv("SECRET_KEY", "luis")


def conectar_bd():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),  # Mude aqui de 'db_almoxarifado' para 'localhost'
        user='root',
        password=os.getenv('DB_PASSWORD', ''), # Certifique-se de que a senha é a mesma do seu MySQL local
        database='almoxarifado'
    )


bcrypt = Bcrypt(app)

PASTA_UPLOAD = os.path.join('static', 'imagens_produtos')
app.config['UPLOAD_FOLDER'] = PASTA_UPLOAD

@app.route('/pag.login/login.html', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        usuario = request.form.get('usuario')
        senha = request.form.get('senha')

        conexao = conectar_bd()
        cursor = conexao.cursor()

        query = "SELECT id FROM usuario WHERE usuario = %s AND senha = %s"
        cursor.execute(query, (usuario, senha))
        resultado = cursor.fetchone()

        cursor.close()
        conexao.close()

        if resultado:
            session['usuario_logado'] = usuario

            session['eh_admin'] = False  # Garante que o usuário comum não ganha privilégios

            return redirect('/estoque')
        else:
            return render_template('/pag.login/login.html', erro=True)

    return render_template('/pag.login/login.html')

@app.route('/adm', methods=['POST', 'GET'])
def adm():
    if request.method == 'POST':
        usuario = request.form.get('usuario')
        senha = request.form.get('senha')

        conexao = conectar_bd()
        cursor = conexao.cursor(buffered=True)

        query = "SELECT id, senha FROM administrador WHERE usuario = %s"
        cursor.execute(query, (usuario,))
        resultado = cursor.fetchone()

        if resultado:
            senha_hash = resultado[1]
            if bcrypt.check_password_hash(senha_hash, senha):
                session['usuario_logado'] = usuario
                session['eh_admin'] = True  # Define perfil como admin
                cursor.close()
                conexao.close()
                return redirect('/estoque')

        cursor.close()
        conexao.close()
        return render_template('/pag.adm/adm.html', erro=True)

    return render_template('/pag.adm/adm.html')

@app.route('/logout')
def logout():
    session.clear()  # Limpa os dados de sessão ao sair
    return redirect('/pag.login/login.html')

@app.route('/historico')
def historico():
    conexao = conectar_bd()
    cursor = conexao.cursor()
    
    query = """
        SELECT e.nome AS nome_produto, h.qntd AS quantidade, h.tipo_movimentacao, h.data_hora
        FROM historico h
        INNER JOIN estoque e ON h.nome = e.id
        ORDER BY h.data_hora DESC
    """
    cursor.execute(query)
    dados_historico = cursor.fetchall()

    cursor.close()
    conexao.close()

    return render_template('/pag.historico/historico.html', resultado=dados_historico)

@app.route('/cadastro', methods=['POST', 'GET'])

def cadastro():
    # Trava do Admin
    if not session.get('eh_admin'):
        return redirect('/estoque')

    if request.method == 'POST':
        conexao = conectar_bd()
        dado_name = request.form['nome']
        dado_qntd = request.form['qntd']
        dado_tipo = request.form['tipo']
        arquivo_imagem = request.files['img']

        if arquivo_imagem and arquivo_imagem.filename != '':
            nome_arquivo = arquivo_imagem.filename
            
            # Garante que a pasta de destino existe (cria se não existir)
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            caminho_completo = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo)
            arquivo_imagem.save(caminho_completo)
        else:
            nome_arquivo = 'sem_foto.png'
        
        # --- ESTA PARTE FICA FORA DO IF/ELSE (alinhada com o 'if') ---
        cursor = conexao.cursor()
        query = """
            INSERT INTO estoque (nome, qntd, tipo, imagem) 
            VALUES (%s, %s, %s, %s)
        """
        valores = (dado_name, dado_qntd, dado_tipo, nome_arquivo)
        cursor.execute(query, valores)
        conexao.commit()
        cursor.close()
        conexao.close()
        print("Item e foto cadastrados com sucesso!")

    return render_template('/pag.cadastro/cad.html') 

@app.route('/estoque', methods=['GET', 'POST'])
def estoque():
    if 'usuario_logado' not in session:
        return redirect('/pag.login/login.html')

    conexao = conectar_bd()
    cursor = conexao.cursor()
    
    query = "SELECT id, nome, qntd, tipo, imagem FROM estoque"
    cursor.execute(query)
    resultado_banco = cursor.fetchall()
    
    cursor.close()
    conexao.close()

    return render_template('/pag.estoque/consultaestoque.html', resultado=resultado_banco)

@app.route('/solicitacoes', methods=['GET', 'POST'])
def solicitacoes():
    if request.method == 'POST':
        conexao = conectar_bd()
        cursor = conexao.cursor()
        
        dado_id = request.form['id']
        dado_qntd = int(request.form['qntd'])

        cursor.execute("SELECT qntd FROM estoque WHERE id = %s", (dado_id,))
        resultado = cursor.fetchone()

        if resultado:
            quantidade_atual = int(resultado[0]) if resultado[0] is not None else 0
            if quantidade_atual >= dado_qntd:
                nova_quantidade = quantidade_atual - dado_qntd

                cursor.execute("""
                    UPDATE estoque 
                    SET qntd = %s 
                    WHERE id = %s
                """, (nova_quantidade, dado_id))

                query_historico = """
                    INSERT INTO historico (nome, qntd, tipo_movimentacao)
                    VALUES (%s, %s, 'RETIRADA')
                """
                cursor.execute(query_historico, (dado_id, dado_qntd))

        conexao.commit()
        cursor.close()
        conexao.close()

    return render_template('pag.solicitacoes/index.html')

@app.route('/devolver', methods=['GET', 'POST'])
def devolver():
    if request.method == 'POST':
        conexao = conectar_bd()
        cursor = conexao.cursor()

        dado_id = request.form['id']
        dado_qntd = int(request.form['qntd'])

        cursor.execute("SELECT qntd FROM estoque WHERE id = %s", (dado_id,))
        resultado = cursor.fetchone()

        if resultado:
            quantidade_atual = int(resultado[0]) if resultado[0] is not None else 0
            nova_quantidade = quantidade_atual + dado_qntd

            cursor.execute("""
                UPDATE estoque 
                SET qntd = %s 
                WHERE id = %s
            """, (nova_quantidade, dado_id))

            query_historico = """
                INSERT INTO historico (nome, qntd, tipo_movimentacao)
                VALUES (%s, %s, 'DEVOLUÇÃO')
            """
            cursor.execute(query_historico, (dado_id, dado_qntd))

            conexao.commit()
            print("Devolução realizada com sucesso!")
        else:
            print("Erro: Item com este ID não foi encontrado!")

        cursor.close()
        conexao.close()

    return render_template('pag.devolver/devolver.html')

@app.route('/caduser', methods=['GET', 'POST'])
def caduser():

    # Trava do Admin
    if not session.get('eh_admin'):
        return redirect('/estoque')
    

    if request.method == 'POST':
        conexao = conectar_bd()
        dado_usuario = request.form['usuario']
        dado_senha = request.form['senha']
        
        cursor = conexao.cursor()
        query = """
            INSERT INTO usuario (usuario, senha) 
            VALUES (%s, %s)
        """
        valores = (dado_usuario, dado_senha)
        
        cursor.execute(query, valores)
        conexao.commit()
        cursor.close()
        conexao.close()


    return render_template('/pag.caduser/caduser.html')

@app.route('/estoque/zerar', methods=['POST'])
def zerar_estoque():
    # Trava do Admin
    if not session.get('eh_admin'):
        return redirect('/estoque')

    conexao = conectar_bd()
    cursor = conexao.cursor()
    
    cursor.execute("TRUNCATE TABLE estoque")
    
    conexao.commit()
    cursor.close()
    conexao.close()
    
    print("Banco de dados de estoque zerado com sucesso!")
    return redirect('/estoque')

@app.route('/estoque/exportar', methods=['GET'])
def exportar_csv():
    conexao = conectar_bd()
    cursor = conexao.cursor()
    cursor.execute("SELECT nome, qntd, tipo, imagem FROM estoque")
    itens = cursor.fetchall()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';', lineterminator='\n')
    
    writer.writerow(['nome', 'qntd', 'tipo', 'imagem'])
    
    for item in itens:
        writer.writerow(item)
        
    cursor.close()
    conexao.close()
    
    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=backup_estoque.csv"}
    )

@app.route('/estoque/importar', methods=['POST'])
def importar_csv():

    if not session.get('eh_admin'):
        return redirect('/estoque')

    if 'arquivo_csv' not in request.files:
        print("Nenhum arquivo enviado")
        return redirect('/estoque')
        
    arquivo = request.files['arquivo_csv']
    
    if arquivo.filename == '':
        print("Arquivo com nome vazio")
        return redirect('/estoque')
        
    if arquivo and arquivo.filename.endswith('.csv'):
        stream = io.StringIO(arquivo.stream.read().decode("utf-8"), newline=None)
        leitor_csv = csv.reader(stream, delimiter=';')
        
        next(leitor_csv, None)
        
        conexao = conectar_bd()
        cursor = conexao.cursor()
        
        query = "INSERT INTO estoque (nome, qntd, tipo, imagem) VALUES (%s, %s, %s, %s)"
        
        for linha in leitor_csv:
            if len(linha) == 4:
                nome_item = linha[0]
                qntd_item = int(linha[1])
                tipo_item = linha[2]
                imagem_item = linha[3]
                
                cursor.execute(query, (nome_item, qntd_item, tipo_item, imagem_item))
                
        conexao.commit()
        cursor.close()
        conexao.close()
        print("Produtos importados com sucesso!")
        
    return redirect('/estoque')

@app.route('/vampetinhIA', methods=['GET', 'POST'])
def vampetinhIA():
    return render_template('pag.vampetinha/vampetinhIA.html')

@app.route("/api/estoque", methods=["POST"])
def adicionar_item():
    try:
        dados = request.json

        nome = dados.get("nome")
        qntd = int(dados.get("qntd", 1))
        tipo = dados.get("tipo")
        imagem = dados.get("imagem", "sem_foto.png")

        if not nome:
            return jsonify({"erro": "O nome é obrigatório"}), 400

        conexao = conectar_bd()
        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO estoque (nome, qntd, tipo, imagem)
            VALUES (%s, %s, %s, %s)
        """, (nome, qntd, tipo, imagem))

        conexao.commit()

        novo_id = cursor.lastrowid

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Item adicionado com sucesso!",
            "id": novo_id
        }), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
    

@app.route("/api/estoque", methods=["GET"])
def listar_estoque():
    try:
        conexao = conectar_bd()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, nome, qntd, tipo, imagem
            FROM estoque
        """)

        itens = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(itens), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/api/estoque/<int:item_id>", methods=["DELETE"])
def remover_item(item_id):
    try:
        conexao = conectar_bd()
        cursor = conexao.cursor()

        cursor.execute(
            "DELETE FROM estoque WHERE id = %s",
            (item_id,)
        )

        conexao.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conexao.close()

            return jsonify({
                "erro": "Item não encontrado"
            }), 404

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": f"Item {item_id} removido com sucesso!"
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
@app.route("/api/historico", methods=["GET"])
def api_historico():
    try:
        conexao = conectar_bd()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                e.nome AS nome_produto,
                h.qntd AS quantidade,
                h.tipo_movimentacao,
                h.data_hora
            FROM historico h
            INNER JOIN estoque e ON h.nome = e.id
            ORDER BY h.data_hora DESC
        """)

        historico = cursor.fetchall()

        cursor.close()
        conexao.close()

        for item in historico:
            for chave, valor in item.items():
                if isinstance(valor, (datetime.timedelta, datetime.date, datetime.time, datetime.datetime)):
                    item[chave] = str(valor)

        return jsonify(historico), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
@app.route("/api/cadastrar", methods=["POST"])
def api_cadastrar():
    try:
        nome = request.form.get("nome")
        qntd = request.form.get("qntd")
        tipo = request.form.get("tipo")

        if not nome or not qntd or not tipo:
            return jsonify({
                "erro": "nome, qntd e tipo são obrigatórios"
            }), 400

        conexao = conectar_bd()
        cursor = conexao.cursor()

        # Imagem é opcional
        arquivo_imagem = request.files.get("img")

        if arquivo_imagem and arquivo_imagem.filename != "":
            nome_arquivo = arquivo_imagem.filename

            caminho_completo = os.path.join(
                app.config["UPLOAD_FOLDER"],
                nome_arquivo
            )

            arquivo_imagem.save(caminho_completo)
        else:
            nome_arquivo = "sem_foto.png"

        cursor.execute("""
            INSERT INTO estoque (nome, qntd, tipo, imagem)
            VALUES (%s, %s, %s, %s)
        """, (nome, qntd, tipo, nome_arquivo))

        conexao.commit()

        novo_id = cursor.lastrowid

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Item cadastrado com sucesso!",
            "id": novo_id,
            "nome": nome,
            "qntd": qntd,
            "tipo": tipo,
            "imagem": nome_arquivo
        }), 201

    except Exception as e:
        return jsonify({
            "erro": str(e)
        }), 500

@app.route("/api/cadastrar-usuario", methods=["POST"])
def api_cadastrar_usuario():
    try:
        usuario = request.form.get("usuario")
        senha = request.form.get("senha")

        if not usuario or not senha:
            return jsonify({
                "erro": "usuario e senha são obrigatórios"
            }), 400

        conexao = conectar_bd()
        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO usuario (usuario, senha)
            VALUES (%s, %s)
        """, (usuario, senha))

        conexao.commit()

        novo_id = cursor.lastrowid

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Usuário cadastrado com sucesso!",
            "id": novo_id,
            "usuario": usuario
        }), 201

    except Exception as e:
        return jsonify({
            "erro": str(e)
        }), 500

@app.route("/api/estoque/solicitar/<int:item_id>", methods=["PUT"])
def api_solicitar_item(item_id):
    try:
        dados = request.json
        qntd_solicitada = int(dados.get("qntd", 0))

        if qntd_solicitada <= 0:
            return jsonify({"erro": "A quantidade deve ser maior que zero"}), 400

        conexao = conectar_bd()
        cursor = conexao.cursor()

        # Verifica estoque atual
        cursor.execute("SELECT qntd FROM estoque WHERE id = %s", (item_id,))
        resultado = cursor.fetchone()

        if not resultado:
            cursor.close()
            conexao.close()
            return jsonify({"erro": "Item não encontrado"}), 404

        quantidade_atual = int(resultado[0]) if resultado[0] is not None else 0

        if quantidade_atual < qntd_solicitada:
            cursor.close()
            conexao.close()
            return jsonify({"erro": "Quantidade em estoque insuficiente"}), 400

        nova_quantidade = quantidade_atual - qntd_solicitada

        # Atualiza o estoque
        cursor.execute("""
            UPDATE estoque
            SET qntd = %s
            WHERE id = %s
        """, (nova_quantidade, item_id))

        # Registra no histórico
        cursor.execute("""
            INSERT INTO historico (nome, qntd, tipo_movimentacao)
            VALUES (%s, %s, 'RETIRADA')
        """, (item_id, qntd_solicitada))

        conexao.commit()
        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": f"Solicitação realizada com sucesso! Nova quantidade: {nova_quantidade}"
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/api/estoque/devolver/<int:item_id>", methods=["PUT"])
def api_devolver_item(item_id):
    try:
        dados = request.json
        qntd_devolvida = int(dados.get("qntd", 0))

        if qntd_devolvida <= 0:
            return jsonify({"erro": "A quantidade deve ser maior que zero"}), 400

        conexao = conectar_bd()
        cursor = conexao.cursor()

        # Verifica estoque atual
        cursor.execute("SELECT qntd FROM estoque WHERE id = %s", (item_id,))
        resultado = cursor.fetchone()

        if not resultado:
            cursor.close()
            conexao.close()
            return jsonify({"erro": "Item não encontrado"}), 404

        quantidade_atual = int(resultado[0]) if resultado[0] is not None else 0
        nova_quantidade = quantidade_atual + qntd_devolvida

        # Atualiza o estoque
        cursor.execute("""
            UPDATE estoque
            SET qntd = %s
            WHERE id = %s
        """, (nova_quantidade, item_id))

        # Registra no histórico
        cursor.execute("""
            INSERT INTO historico (nome, qntd, tipo_movimentacao)
            VALUES (%s, %s, 'DEVOLUÇÃO')
        """, (item_id, qntd_devolvida))

        conexao.commit()
        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": f"Devolução realizada com sucesso! Nova quantidade: {nova_quantidade}"
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        dados = request.json or {}
        usuario = dados.get("usuario")
        senha = dados.get("senha")

        if not usuario or not senha:
            return jsonify({"erro": "Usuário e senha são obrigatórios"}), 400

        conexao = conectar_bd()
        cursor = conexao.cursor()

        query = "SELECT id FROM usuario WHERE usuario = %s AND senha = %s"
        cursor.execute(query, (usuario, senha))
        resultado = cursor.fetchone()

        cursor.close()
        conexao.close()

        if resultado:
            return jsonify({
                "mensagem": "Login bem-sucedido!",
                "usuario": usuario,
                "eh_admin": False
            }), 200
        else:
            return jsonify({"erro": "Usuário ou senha incorretos"}), 401

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
@app.route('/api/adm', methods=['POST', 'OPTIONS'])
def api_adm_login():
    # Responde imediatamente à requisição OPTIONS do navegador (Preflight CORS)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        dados = request.json or {}
        usuario = dados.get('usuario')
        senha = dados.get('senha')

        if not usuario or not senha:
            return jsonify({"erro": "Usuário e senha são obrigatórios"}), 400

        conexao = conectar_bd()
        cursor = conexao.cursor(dictionary=True)

        query = "SELECT id, usuario, senha FROM administrador WHERE usuario = %s"
        cursor.execute(query, (usuario,))
        resultado = cursor.fetchone()

        cursor.close()
        conexao.close()

        if resultado:
            senha_hash = str(resultado['senha'])
            
            senha_valida = False
            try:
                senha_valida = bcrypt.check_password_hash(senha_hash, senha)
            except Exception:
                senha_valida = (senha_hash == senha)

            if senha_valida:
                return jsonify({
                    "mensagem": "Login ADM realizado com sucesso!",
                    "usuario": resultado['usuario'],
                    "eh_admin": True
                }), 200

        return jsonify({"erro": "Usuário ou senha de administrador inválidos"}), 401

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)