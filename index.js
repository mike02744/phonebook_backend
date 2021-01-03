require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const { response } = require("express");
// const { response } = require("express");
morgan.token("id", (req) => {
  return JSON.stringify(req.body);
});

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :id")
);

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

app.post("/api/persons", (req, res, next) => {
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
  const person = new Person({
    name: body.name,
    number: body.number,
    // id: generateId(100, 1000),
  });

  person.save().then((savedperson) => {
    res.json(savedperson.toJSON());
  });
  persons = persons.concat(person);
  res.json(person);
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));

  // const id = Number(req.params.id);
  // persons = persons.filter((person) => person.id !== id);

  // console.log(persons);
  // res.status(204).end();
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
  // const id = Number(req.params.id);
  // const person = persons.find((person) => person.id === id);

  // if (person) {
  //   res.json(person);
  // } else {
  //   res.status(404).end();
  // }
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  console.log(person);
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      console.log(updatedPerson);
      // res;
      res.json(updatedPerson.toJSON());
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  const num = persons.length;
  const info = `<p>Phonebook has info for ${num} people</p><p>${Date()}</p>`;

  res.send(info).end();
});

app.get("/api/persons", (req, res) => {
  // res.json(persons);
  Person.find({}).then((persons) => {
    res.json(persons.map((person) => person.toJSON()));
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};
// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
