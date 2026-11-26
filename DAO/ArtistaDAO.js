// DAO/ArtistaDAO.js
// Acesso à tabela "artistas" no Supabase.
const supabase = require('../supabaseClient');

class ArtistaDAO {
    // Procura um artista pelo nome. Devolve { id, nome } ou null se não existir.
    async buscarPorNome(nome) {
        const { data, error } = await supabase
            .from('artistas')
            .select('id, nome')
            .eq('nome', nome)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    }

    // Devolve o artista; se ainda não existir, cria e devolve o novo.
    async buscarOuCriar(nome) {
        const existente = await this.buscarPorNome(nome);
        if (existente) return existente;

        const { data, error } = await supabase
            .from('artistas')
            .insert({ nome })
            .select('id, nome')
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}

// Exporta uma INSTÂNCIA única (Singleton), como o MusicaDAO anterior
module.exports = new ArtistaDAO();
