import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RunTasks from "./pages/Runtask";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/runtasks" element={<RunTasks />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;