const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("Peter Szujewski says Hello.");
});

app.listen(port, () => {
	console.log(`Nodejs app server listening on port ${port}`);
});
