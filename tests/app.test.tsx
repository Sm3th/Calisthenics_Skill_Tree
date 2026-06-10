import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("App interactions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens the detail panel when a skill node is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Push-up is a visible node in the seed data.
    const node = screen.getByTestId("skill-node-pushup");
    await user.click(node);

    const panel = screen.getByTestId("detail-panel");
    expect(panel).toBeInTheDocument();
    expect(
      within(panel).getByRole("heading", { name: /push-up/i })
    ).toBeInTheDocument();
  });

  it("masters a skill from the panel and updates the header count", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Incline Push-up is a root skill (available from the start).
    await user.click(screen.getByTestId("skill-node-incline-pushup"));
    const panel = screen.getByTestId("detail-panel");
    await user.click(within(panel).getByRole("button", { name: /mastered/i }));

    // The node should now report the mastered state.
    expect(screen.getByTestId("skill-node-incline-pushup")).toHaveAttribute(
      "data-state",
      "mastered"
    );
  });

  it("filters skills by search query", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/search skills/i), "planche");

    expect(screen.getByTestId("skill-node-full-planche")).toBeInTheDocument();
    expect(screen.queryByTestId("skill-node-pullup")).not.toBeInTheDocument();
  });
});
