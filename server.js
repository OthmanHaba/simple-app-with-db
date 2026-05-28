const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const os = require('os');

const db = new Database(path.join(__dirname, 'data.db'));
db.exec('CREATE TABLE IF NOT EXISTS counter (id INTEGER PRIMARY KEY, value INTEGER NOT NULL)');
db.prepare('INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)').run();

const getCount = db.prepare('SELECT value FROM counter WHERE id = 1');
const bumpCount = db.prepare('UPDATE counter SET value = value + 1 WHERE id = 1');

const app = express();

const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
const hostname = os.hostname();

app.get('/', (_req, res) => {
  res.send(indexHtml.replace(/{{HOSTNAME}}/g, hostname));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/count', (_req, res) => {
  res.json({ value: getCount.get().value });
});

app.post('/increment', (_req, res) => {
  bumpCount.run();
  res.json({ value: getCount.get().value });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));
