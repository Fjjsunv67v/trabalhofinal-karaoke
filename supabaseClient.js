// supabaseClient.js — conexão com o Supabase.
// Só os DAOs devem usar este arquivo. A página (public/) nunca fala com o banco.

require('dotenv').config(); // lê o arquivo .env (só no seu computador)
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const chave = process.env.SUPABASE_SECRET_KEY;

if (!url || !chave) {
    throw new Error(
        'Faltam SUPABASE_URL e/ou SUPABASE_SECRET_KEY. ' +
        'No computador, confira o .env. Na Render, confira Environment.'
    );
}

// persistSession: false -> o servidor não precisa guardar "login" de usuário
const supabase = createClient(url, chave, {
    auth: { persistSession: false }
});

module.exports = supabase;