const pool = require('../db/pool');

async function getDecks(req, res) {
  try {
    const result = await pool.query('SELECT * FROM decks WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
}

async function createDeck(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Deck name is required' });

  try {
    const result = await pool.query(
      'INSERT INTO decks (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.userId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create deck' });
  }
}

async function deleteDeck(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM decks WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
}

module.exports = { getDecks, createDeck, deleteDeck };