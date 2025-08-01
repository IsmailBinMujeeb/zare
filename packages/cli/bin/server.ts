import express from "express";

const app = express();

app.set("view engine", "zare")
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

export default app;