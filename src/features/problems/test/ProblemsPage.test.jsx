import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthContext from "../../../auth/context/AuthContext";
import { ThemeProvider } from "../../../shared/context/ThemeContext";
import ProblemsPage from "../pages/ProblemsPage";
import { fetchProblems } from "../services/problemsApi";

jest.mock("../services/problemsApi", () => ({
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

test("renders the local problems catalog without calling the backend", async () => {
  renderProblemsPage();

  expect(await screen.findAllByText("Half Adder")).not.toHaveLength(0);
  expect(fetchProblems).not.toHaveBeenCalled();
});

test("opens a simplification problem in the step-by-step modal and marks it solved", async () => {
  renderProblemsPage();

  const rows = await screen.findAllByRole("row");
  const row = rows.find((r) =>
    within(r).queryByText("Simplify: Redundant Literal"),
  );
  expect(row).toBeTruthy();

  fireEvent.click(row);

  const stepInput = await screen.findByLabelText(/your next step/i);
  expect(screen.queryByText(/open circuit builder/i)).not.toBeInTheDocument();

  fireEvent.change(stepInput, { target: { value: "A + B" } });
  fireEvent.click(screen.getByRole("button", { name: /check step/i }));

  expect(await screen.findByText("Problem solved")).toBeInTheDocument();
  expect(await within(row).findByText("Solved")).toBeInTheDocument();
});

test("marks a problem as attempted when its row is opened", async () => {
  renderProblemsPage();

  const rows = await screen.findAllByRole("row");
  const row = rows.find((r) => within(r).queryByText("Half Adder"));
  expect(row).toBeTruthy();
  expect(within(row).getByText("Not started")).toBeInTheDocument();

  fireEvent.click(row);

  expect(await within(row).findByText("Attempted")).toBeInTheDocument();
});
