import { render, screen  } from "@testing-library/react"
import { expect, describe, it} from "vitest"
import Login from "../Login.jsx";
import {renderWithRouter} from "./renderWithRouter.jsx";

describe("Login Component", () => {
    it("should have GoClimb in h1", () => {
      renderWithRouter(<Login />);
      const heading = screen.getByTestId("test002");
  
  expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/GoClimb$/);
      expect(heading.tagName).toBe("H1");
    });
  });