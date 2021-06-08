import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import User from "./User";

describe("<User />", () => {
  test("it should mount", () => {
    render(<User user={{ username: "TestUser" }} />);

    const user = screen.getByTestId("User");

    expect(user).toBeInTheDocument();
  });
});
