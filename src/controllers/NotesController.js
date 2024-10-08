const knex = require("../database/knex");

class NotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const user_id = request.user.id;  // Correto: request.user.id

    const [note_id] = await knex("notes").insert({
      title,
      description,
      user_id,
      rating,
    });

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        name,
        user_id,
      };
    });

    await knex("tags").insert(tagsInsert);
    response.json();
  }

  async update(request, response) {
    const user_id = request.user.id;
    const { id } = request.params; // id da nota que estamos atualizando
    const { title, description, rating, tags } = request.body;
  
    // Atualiza os dados da nota
    await knex("notes").where({ id }).update({
      title,
      description,
      rating,
      user_id
    });
  
    if (tags) {
      // Deleta as tags antigas associadas à nota
      await knex("tags").where({ note_id: id }).delete();
  
      // Adiciona as novas tags
      const tagsInsert = tags.map((name) => {
        return {
          note_id: id, // Aqui usamos o id da nota que está sendo atualizada
          name,
          user_id
        };
      });
  
      await knex("tags").insert(tagsInsert);
    }
  
    return response.status(201).json({
      status: 201,
      message: "A nota foi atualizada com sucesso.",
    });
  }
  

  async show(request, response) {
    const { id } = request.params;

    const note = await knex("notes").where({ id }).first();
    const tags = await knex("tags").where({ note_id: id }).orderBy("name");

    return response.json({
      ...note,
      tags,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("notes").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { title, tags } = request.query;
    const user_id = request.user.id;  // Corrigido para request.user.id

    let notes;

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());

      notes = await knex("tags")
        .select([
          "notes.id",
          "notes.title",
          "notes.user_id",
        ])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("notes", "notes.id", "tags.note_id")
        .groupBy("note.id")
        .orderBy("notes.title");
    } else {
      notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags,
      };
    });

    return response.json(notesWithTags);
  }
}

module.exports = NotesController;
