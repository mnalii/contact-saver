const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to the Contact Keeper API'});
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/contacts', require('./routes/contact'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

