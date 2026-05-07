const express = require('express');
const app = express();
const projectRoutes = require('./routes/projectRoutes');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('TaskFlow API is running...');
});

app.use('/api/projects', projectRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Server is live on port " + PORT);
});