// Utility to wait for window.testRunner to be available
function waitForTestRunner(win) {
  return new Cypress.Promise((resolve) => {
    const check = () => {
      if (win.testRunner) {
        resolve(win.testRunner);
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

describe("Angular Service E2E via Test Runner", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200/test-runner");
  });

  it("calls backend GET and POST endpoints", () => {
    cy.intercept("GET", "http://localhost:8080/test-api/hello").as("hello");
    cy.window().then((win) => {
      return waitForTestRunner(win);
    }).then((testRunner) => {
      return testRunner.callHello();
    }).then((resp) => {
      expect(resp).to.eq("Hello from backend!");
    });
    cy.wait("@hello").its("response.statusCode").should("eq", 200);

    cy.intercept("POST", "http://localhost:8080/test-api/echo").as("echo");
    cy.window().then((win) => {
      return waitForTestRunner(win);
    }).then((testRunner) => {
      return testRunner.callEcho("Cypress!");
    }).then((resp) => {
      expect(resp).to.eq("Echo: Cypress!");
    });
    cy.wait("@echo").its("response.statusCode").should("eq", 200);
  });

  it("calls Angular service methods and inspects HTTP requests", () => {
    cy.intercept("GET", "http://localhost:8080/posts/getAll").as("getPosts");
    cy.window().then((win) => {
      return waitForTestRunner(win);
    }).then((testRunner) => {
      return testRunner.getAllPosts();
    }).then((posts) => {
      expect(posts).to.be.an("array");
    });
    cy.wait("@getPosts").its("response.statusCode").should("eq", 200);

    cy.intercept("GET", "http://localhost:8080/tags/getAll").as("getTags");
    cy.window().then((win) => {
      return waitForTestRunner(win);
    }).then((testRunner) => {
      return testRunner.getAllTags();
    }).then((tags) => {
      expect(tags).to.be.an("array");
    });
    cy.wait("@getTags").its("response.statusCode").should("eq", 200);
  });
});

describe('User Services (Logged User)', () => {
  const unique = Date.now();
  const user = {
    email: `user_${unique}@example.com`,
    password: 'UserPass123!',
    username: `user_${unique}`
  };
  let token = '';
  let userId = null;

  before(() => {
    cy.request('POST', 'http://localhost:8080/auth/register', user).then(() => {
      cy.request('POST', 'http://localhost:8080/auth/login', {
        email: user.email,
        password: user.password
      }).then((resp) => {
        token = resp.body;
        cy.request({
          url: 'http://localhost:8080/users/me',
          headers: { Authorization: `Bearer ${token}` }
        }).then((resp) => {
          userId = resp.body.id;
        });
      });
    });
  });

  it('gets own user info', () => {
    cy.request({
      url: 'http://localhost:8080/users/me',
      headers: { Authorization: `Bearer ${token}` }
    }).its('status').should('eq', 200);
  });

  it('cannot get all users', () => {
    cy.request({
      url: 'http://localhost:8080/users/getAll',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).its('status').should('eq', 403);
  });

  // Add more tests for posts, comments, tags, etc. as this user
  // Use unique post/comment/tag data (e.g., append unique)
});