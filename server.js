require("dotenv").config(); // Carrega variáveis de ambiente do .env
const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json()); // Para processar JSON

// Configuração do SQL Server com dados do .env
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true, // Necessário para Azure ou conexões seguras
        trustServerCertificate: true, // Para conexões locais
    },
};

// Rota para inserir os dados
app.post("/api/feedback", async (req, res) => {
    const {
        tempo_entrega,
        qualidade_entregas,
        tempo_resposta,
        qualidade_atendimento,
        relacionamento,
        servicos_valor,
        feedback1,
        feedback2,
    } = req.body;

    try {
        // Conexão com o banco de dados
        const pool = await sql.connect(dbConfig);

        // Query para inserir os dados na tabela
        const query = `
            INSERT INTO feedback (
                tempo_de_entrega,
                qualidade_da_entrega,
                tempo_de_resposta,
                qualidade_do_atendimento,
                nosso_relacionamento,
                agregar_valor,
                palavra,
                observacoes
            )
            VALUES (
                @tempo_entrega, 
                @qualidade_entregas, 
                @tempo_resposta, 
                @qualidade_atendimento, 
                @relacionamento, 
                @servicos_valor, 
                @feedback1, 
                @feedback2
            )
        `;

        // Executa a query com os parâmetros
        await pool.request()
            .input("tempo_entrega", sql.Int, tempo_entrega || null) // Convertendo para Int
            .input("qualidade_entregas", sql.Int, qualidade_entregas || null)
            .input("tempo_resposta", sql.Int, tempo_resposta || null)
            .input("qualidade_atendimento", sql.Int, qualidade_atendimento || null)
            .input("relacionamento", sql.Int, relacionamento || null)
            .input("servicos_valor", sql.Int, servicos_valor || null)
            .input("feedback1", sql.NVarChar, feedback1 || null)
            .input("feedback2", sql.NVarChar, feedback2 || null)
            .query(query);

        res.status(200).send({ message: "Dados enviados com sucesso!" });
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
        res.status(500).send({ message: "Erro ao enviar os dados.", error: error.message });
    } finally {
        sql.close(); // Fecha a conexão com o banco
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
