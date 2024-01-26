const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const app = express();

app.use(
  session({
    secret: "your-secret-keyz", // This should be a secret, used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    store: new FileStore,
  })
);

app.get("/", (req, res) => {
  // Access session data
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }

  res.send(`Views: ${req.session.views}`);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
