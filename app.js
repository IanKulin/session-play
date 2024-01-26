const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("fs");
const app = express();

const user_view_file = "./user_views.json";
const cookie_name = "session_cookie";

let user_views = [];
// if the user_views.json file exists, read it and parse it to user_views array
if (fs.existsSync(user_view_file)) {
  user_views = JSON.parse(fs.readFileSync(user_view_file));
}

function writeUserViewFile() {
  fs.writeFile(user_view_file, JSON.stringify(user_views), (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
}

function findUser(user) {
  return user_views.find((u) => u.user === user);
}

app.use(
  session({
    secret: "your-secret-keyz", // This should be a secret, used to sign the session ID cookie
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
    name: cookie_name,
  })
);

app.get("/", (req, res) => {
  if (req.session.user) {
    const user_view = findUser(req.session.user);
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
    res.clearCookie(cookie_name);
    res.redirect("/");
  });
});

app.get("/create/:user/:password", (req, res) => {
  if (findUser(req.params.user)) {
    res.send(`User ${req.params.user} already exists`);
    return;
  }
  const user = req.params.user;
  const password = req.params.password;
  const views = 0;
  req.session.user = user;
  user_views.push({ user, password, views });
  writeUserViewFile();
  res.send(`User ${user} created & logged in`);
});

app.get("/login/:user/:password", (req, res) => {
  const user = findUser(req.params.user);
  if (user && user.password === req.params.password) {
    req.session.user = req.params.user;
    res.send(`User ${req.params.user} logged in`);
    return;
  } else {
    res.send(`Incorrect username or password`);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
