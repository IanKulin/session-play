const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("fs");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;

const user_view_file = "./user_views.json";
const cookie_name = "session_cookie";

app.use(express.urlencoded({ extended: false }));

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
    if (!user_view) {
      res.send(`Error finding user, <a href="/login">try again</a>`);
      return;
    }
    user_view.views++;
    res.send(
      `User "${req.session.user}" has ${user_view.views} views, <a href="/">reload</a> or <a href="/logout">logout</a>`
    );
    writeUserViewFile();
  } else {
    res.redirect("/login");
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
  const hash = bcrypt.hashSync(req.params.password, saltRounds);
  const views = 0;
  req.session.user = user;
  user_views.push({ user, hash, views });
  writeUserViewFile();
  res.send(`User ${user} created & logged in`);
});

app.post("/login", (req, res) => {
  const user = findUser(req.body.username);
  if (user && bcrypt.compareSync(req.body.password, user.hash)) {
    req.session.user = req.body.username;
    req.session.save((err) => {
      if (err) {
        res.send('Cookie saving error, <a href="/login">try again</a>`');
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.send(`Incorrect username or password, <a href="/login">try again</a>`);
  }
});

app.get("/login", (req, res) => {
  res.status(200).sendFile(__dirname + "/login.html");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
