import { render, screen  } from "@testing-library/react"
import { expect, describe, it} from "vitest"
import Home from "../Home.jsx";
import {renderWithRouter} from "./renderWithRouter.jsx";

describe("Home Component", () => {
    it("should have Create a Post in h2", () => {
      renderWithRouter(<Home />);
      const heading = screen.getByTestId("test001");
  
  expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/Create a Post$/);
      expect(heading.tagName).toBe("H2");
    });
  });

  