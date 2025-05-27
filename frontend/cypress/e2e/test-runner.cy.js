describe("Angular Service E2E via Test Runner", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/test-runner");
  });

  it("calls backend GET and POST endpoints", () => {
    cy.intercept("GET", "http://localhost:8080/test-api/hello").as("hello");
    cy.window().then((win) => {
      return win.testRunner.callHello();
    }).then((resp) => {
      expect(resp).to.eq("Hello from backend!");
    });
    cy.wait("@hello").its("response.statusCode").should("eq", 200);

    cy.intercept("POST", "http://localhost:8080/test-api/echo").as("echo");
    cy.window().then((win) => {
      return win.testRunner.callEcho("Cypress!");
    }).then((resp) => {
      expect(resp).to.eq("Echo: Cypress!");
    });
    cy.wait("@echo").its("response.statusCode").should("eq", 200);
  });

  it("calls Angular service methods and inspects HTTP requests", () => {
    cy.intercept("GET", "http://localhost:8080/posts/getAll").as("getPosts");
    cy.window().then((win) => {
      return win.testRunner.getAllPosts();
    }).then((posts) => {
      expect(posts).to.be.an("array");
    });
    cy.wait("@getPosts").its("response.statusCode").should("eq", 200);

    cy.intercept("GET", "http://localhost:8080/tags/getAll").as("getTags");
    cy.window().then((win) => {
      return win.testRunner.getAllTags();
    }).then((tags) => {
      expect(tags).to.be.an("array");
    });
    cy.wait("@getTags").its("response.statusCode").should("eq", 200);
  });
});
