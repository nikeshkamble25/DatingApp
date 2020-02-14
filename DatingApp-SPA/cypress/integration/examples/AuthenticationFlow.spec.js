///<reference types="Cypress">
context("Dating App Authentication Flow test", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/");
  });
  it("#0001: Register User With Random User Name", () => {
    describe("start test", () => {
      var username = "nikesh" + Math.round(Math.random() * 10000);
      cy.get("#btnRegister").click();
      cy.get("#btnUsername").type(username);
      cy.get("#btnPassword").type(username);
      cy.get("#btnSubmit").click();
      cy.get("#txtLoginUsername").type(username);
      cy.get("#txtLoginPassword").type(username);
      cy.get("#btnLogin").click();
      cy.get("#lblUserText").should("have.text", "Welcome User");
      cy.get("#btnLogout").click();
    });
  });
});
