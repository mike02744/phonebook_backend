require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

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

app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  if (!body.name || body.name === "" || !body.number || body.number === "") {
    return res.status(400).json({
      error: "name or number misssing",
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedperson) => savedperson.toJSON())
    .then((formatedperson) => res.json(formatedperson))
    .catch((error) => next(error));

});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
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
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators:true, context:"query"})
    .then((updatedPerson) => updatedPerson.toJSON())
    .then((formatedperson) => res.json(formatedperson))
    .catch((error) => next(error));
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons.map((person) => person.toJSON()));
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else {
    return response.status(400).json({ error: error.message });
  }

  // eslint-disable-next-line no-unreachable
  next(error);
};
// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
