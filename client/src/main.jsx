import React from "react";
import { createRoot } from "react-dom/client";
import { BooksList } from "./app.jsx";
import "./style.css";

createRoot(document.getElementById("content")).render(
    <BooksList apiUrl="/api/books" />
);
