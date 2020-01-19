/// <reference types="Cypress" />
context("Dating app Start", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/");
  });
  it("0001#Check Min Length of records", () => {
    describe("0002#Check Min Length of records", () => {
      cy.get("app-root")
        .find("table")
        .find("tr")
        .should("be.length.greaterThan", 0);
    });
  });
  it("0002#Check Min Length of records", () => {
    describe("0001#Check Min Length of records", () => {
      cy.get("app-root")
        .find("table")
        .find("tr")
        .should("be.length.greaterThan", 1);
    });
  });
});
