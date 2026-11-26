// DAO/MusicaDAO.js
// Acesso às tabelas "musicas" e "partes" no Supabase.
// Todos os métodos são async: o banco demora para responder, então usamos await.
const supabase = require('../supabaseClient');
const artistaDAO = require('./ArtistaDAO');

// Campos que pedimos ao banco: a música, o artista (tabela ligada) e as partes
const CAMPOS_COMPLETOS =
    'id, nome, artista:artistas(id, nome), partes(id, ordem, letra, tempo_espera, tag)';

// Converte a linha do banco para o formato que a API devolve (contrato do trabalho)
function formatarMusica(linha) {
    const partes = (linha.partes || [])
        .sort((a, b) => a.ordem - b.ordem)
        .map(p => ({
            id: p.id,
            ordem: p.ordem,
            letra: p.letra,
            tempoEspera: p.tempo_espera, // no banco é tempo_espera; na API é tempoEspera
            tag: p.tag
        }));

    return { id: linha.id, nome: linha.nome, artista: linha.artista, partes };
}

class MusicaDAO {
    // Lista todas as músicas: [{ id, nome, artista: { id, nome }, totalPartes }]
    async listarTodas() {
        const { data, error } = await supabase
            .from('musicas')
            .select('id, nome, artista:artistas(id, nome), partes(count)')
            .order('id');

        if (error) throw new Error(error.message);

        return data.map(m => ({
            id: m.id,
            nome: m.nome,
            artista: m.artista,
            totalPartes: m.partes[0] ? m.partes[0].count : 0
        }));
    }

    // Busca uma música (com partes) pelo ID. Devolve null se não existir.
    async buscarPorId(id) {
        const { data, error } = await supabase
            .from('musicas')
            .select(CAMPOS_COMPLETOS)
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return null;
        return formatarMusica(data);
    }

    // Insere uma música. O artista chega como texto: achamos (ou criamos) o artista
    // e guardamos o id dele em musicas.artista_id.
    async inserir(nome, nomeArtista) {
        const artista = await artistaDAO.buscarOuCriar(nomeArtista);

        const { data, error } = await supabase
            .from('musicas')
            .insert({ nome, artista_id: artista.id })
            .select('id')
            .single();

        if (error) throw new Error(error.message);
        return this.buscarPorId(data.id);
    }

    // Atualiza nome e artista. Devolve null se a música não existir.
    async atualizar(id, nome, nomeArtista) {
        const existente = await this.buscarPorId(id);
        if (!existente) return null;

        const artista = await artistaDAO.buscarOuCriar(nomeArtista);

        const { error } = await supabase
            .from('musicas')
            .update({ nome, artista_id: artista.id })
            .eq('id', id);

        if (error) throw new Error(error.message);
        return this.buscarPorId(id);
    }

    // Remove a música (as partes saem junto: on delete cascade no banco).
    // Devolve a música removida, ou null se ela não existia.
    async remover(id) {
        const existente = await this.buscarPorId(id);
        if (!existente) return null;

        const { error } = await supabase
            .from('musicas')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return existente;
    }
}

module.exports = new MusicaDAO();
