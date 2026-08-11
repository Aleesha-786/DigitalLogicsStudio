import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthContext from "../../../auth/context/AuthContext";
import { ThemeProvider } from "../../../shared/context/ThemeContext";
import ProblemsPage from "./ProblemsPage";
import { fetchProblems } from "../services/problemsApi";

jest.mock("./services/problemsApi", () => ({
  fetchProblems: jest.fn(),
}));

const renderProblemsPage = () =>
  render(
    <ThemeProvider>
      <AuthContext.Provider
        value={{
          user: { id: "user-1", name: "Atta", email: "atta@example.com" },
          loading: false,
          isAuthenticated: true,
          login: jest.fn(),
          register: jest.fn(),
          logout: jest.fn(),
        }}
      >
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ProblemsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </ThemeProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  fetchProblems.mockReset();
});

test("filters the problem table by search text", () => {
  renderProblemsPage();

  fireEvent.change(
    screen.getByPlaceholderText(/search problems, tags, circuits, latches/i),
    {
      target: { value: "Sequence Detector FSM" },
    },
  );

  expect(screen.getAllByText("Sequence Detector FSM").length).toBeGreaterThan(0);
  expect(screen.queryAllByText("Half Adder")).toHaveLength(0);
});

test("shows an offline message and hides the local catalog when the backend is unavailable", async () => {
  fetchProblems.mockRejectedValueOnce(new Error("offline"));

  renderProblemsPage();

  expect(
    await screen.findByText(/the problem library is unavailable/i),
  ).toBeInTheDocument();
  expect(screen.queryByText("Half Adder")).not.toBeInTheDocument();
});

test("marks a problem as attempted from the table", async () => {
  fetchProblems.mockResolvedValueOnce([
    {
      id: 1,
      listId: "DLD-0001",
      course: "dld",
      title: "Half Adder",
      difficulty: "Easy",
      tags: ["Combinational", "Arithmetic"],
      topic: "Combinational Circuits",
      description: "Design a Half Adder circuit.",
      truthTable: [
        { A: 0, B: 0, S: 0, C: 0 },
        { A: 0, B: 1, S: 1, C: 0 },
        { A: 1, B: 0, S: 1, C: 0 },
        { A: 1, B: 1, S: 0, C: 1 },
      ],
      equations: ["S = A ⊕ B", "C = A · B"],
      hint: "Sum uses XOR, Carry uses AND.",
      inputs: ["A", "B"],
      outputs: ["S", "C"],
    },
  ]);

  renderProblemsPage();

  const rows = await screen.findAllByRole("row");
  const row = rows.find((r) => within(r).queryByText("Half Adder"));
  const startButton = within(row).getByRole("button", { name: /start/i });
  fireEvent.click(startButton);

  expect(await within(row).findByRole("button", { name: /attempted/i })).toBeInTheDocument();
});

