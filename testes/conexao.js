// Teste rápido de conexão: node testes/conexao.js
const supabase = require('../supabaseClient');

(async () => {
    const { data, error } = await supabase.from('musicas').select('id, nome').limit(5);
    if (error) {
        console.error('Falhou:', error.message);
        process.exit(1);
    }
    console.log('Conexão OK. Linhas encontradas:', data);
})();