const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("fs");

const app = express();

let user_views = [];
// if the user_views.json file exists, read it and parse it to user_views array
if (fs.existsSync("./user_views.json")) {
  user_views = JSON.parse(fs.readFileSync("./user_views.json"));
}

function writeUserViewFile() {
  fs.writeFile("./user_views.json", JSON.stringify(user_views), (err) => {
    if (err) {
      res.send(err);
      return;
    }
  });
}


app.use(
  session({
    secret: "your-secret-keyz", // This should be a secret, used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
    name: "session_cookie",
  })
);

app.get("/", (req, res) => {
  if (req.session.user) {
    const user_view = user_views.find((u) => u.user === req.session.user);
    user_view.views++;
    res.send(`User "${req.session.user}" has ${user_view.views} views`);
    writeUserViewFile();
  } else {
    res.send("Please log in");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.clearCookie("session_cookie");
    res.redirect("/");
  });
});

app.get("/create/:user", (req, res) => {
  const user = req.params.user;
  const views = 0;
  req.session.user = user;
  user_views.push({ user, views });
  writeUserViewFile();
  res.send(`User ${user} created & logged in`);
});

app.get("/login/:user", (req, res) => {
  // see if this user is in the user_views array
  if (user_views.find((u) => u.user === req.params.user)) {
    req.session.user = req.params.user;
    res.send(`User ${req.params.user} logged in`);
    return;
  } else {
    res.redirect(`/create/${req.params.user}`);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
