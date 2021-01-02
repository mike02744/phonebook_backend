const { response } = require("express");
const express = require("express");
const app = express();

app.use(express.json());

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

const generateId = (max, min) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  const id = Math.floor(Math.random() * (max - min + 1) + min);
  return id;
};

app.post("/api/persons", (req, res) => {
  // console.log(req.body);
  const body = req.body;
  if (!body.name || body.name === "" || !body.number || body.number === "") {
    return res.status(400).json({
      error: "name or number misssing",
    });
  }

  const temp = persons.find((person) => person.name === body.name);
  if (temp) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(100, 1000),
  };

  persons = persons.concat(person);
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  console.log(persons);
  res.status(204).end();
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  console.log(person);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.get("/info", (req, res) => {
  const num = persons.length;
  const info = `<p>Phonebook has info for ${num} people</p><p>${Date()}</p>`;

  res.send(info).end();
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
