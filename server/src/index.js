const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${env.port}`);
});
