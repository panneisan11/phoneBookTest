const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const path = require('path');
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.use(morgan("tiny"));

morgan.token("body", (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/info", (request, response) => {
    const info = `<p>Phonebook has info for ${persons.length} people</p>
    <br/><p>${new Date()}</p>`
    response.send(info);
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    if (!id) {
        return response.send(400, "ID is not valid!");
    }
    const person = persons.find(p => p.id === Number(id));
    if (!person) {
        return response.send(404, `Person with id ${id} is not found!`);
    }
    response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    if (!id) {
        return response.send(400, "ID is not valid!");
    }
    persons = persons.filter(person => person.id !== Number(id));
    response.status(204).end();
})

app.post("/api/persons", (request, response) => {
    const person = request.body;
    if (!person) {
        return response.send(400, `Person Data is missing!`);
    }
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    const filteredPersons = persons.filter(p => p.name === person.name);
    if (filteredPersons && filteredPersons.length > 0) {
        return response.status(400).json({
            error: 'The name already exists in the phonebook'
        })
    }
    const maxIdPerson = persons.reduce((max, person) => (person.id > max.id ? person : max), persons[0]);
    person.id = maxIdPerson.id + 1;
    persons = persons.concat(person);
    response.json(person);

})

app.put('/api/persons/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const person = request.body;
    if (!person) {
        return response.send(400, `Person Data is missing!`);
    }
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    const filteredPersons = persons.filter(p => p.id === id);
    const personToUpdate = filteredPersons[0];
    if (!personToUpdate || personToUpdate.length <= 0) {
        return response.status(400).json({
            error: `Person name '${person.name}' is not found!`
        })
    }
    personToUpdate.number = person.number;

    // Respond with the updated person object
    response.json(personToUpdate);

})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Running server with port ${PORT}`);
})