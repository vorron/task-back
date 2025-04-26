const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;
const LIMIT = 20;

// Хранилище в памяти
let items = Array.from({ length: 1000000 }, (_, i) => ({
  id: i + 1,
  text: `Item ${i + 1}`,
  selected: false,
}));

let page = 1;

let search = "";

// Получение элементов с пагинацией
app.get("/api/items", (req, res) => {
  const { is_next_page, new_search } = req.query;

  if (search == "" && is_next_page == 0) page = 1;
  if (search != new_search) page = 1;
  search = new_search;
  if (is_next_page == 1) page++;

  const offset = (page - 1) * LIMIT;

  let filteredItems = [...items];

  if (search) {
    const searchTerm = search.toLowerCase();
    filteredItems = filteredItems.filter((item) =>
      item.text.toLowerCase().includes(searchTerm)
    );
  }

  const paginatedItems = filteredItems.slice(offset, offset + LIMIT);

  res.json({
    items: paginatedItems,
    total: filteredItems.length,
  });
});

app.post("/api/items/select", (req, res) => {
  const { id, selected } = req.body;
  items = items.map((item) => (id == item.id ? { ...item, selected } : item));
  res.json({ success: true });
});

app.post("/api/items/set-order", (req, res) => {
  const { draggedId, dropId } = req.body;

  const draggedIndex = items.findIndex((e) => e.id == draggedId);
  const dropIndex = items.findIndex((e) => e.id == dropId);

  const [draggedItem] = items.splice(draggedIndex, 1);
  items.splice(dropIndex, 0, draggedItem);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
