describe('Unauthorized/Unlogged User', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.removeItem('auth_token');
    });
  });

  it('cannot get own user info', () => {
    cy.request({
      url: 'http://localhost:8080/users/me',
      failOnStatusCode: false
    }).its('status').should('be.oneOf', [401, 403]);
  });

  it('cannot create a post', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/posts/insertPost',
      body: { title: 'Should Fail', text: 'No auth' },
      failOnStatusCode: false
    }).its('status').should('be.oneOf', [401, 403]);
  });

  // Add more tests for forbidden/unauthorized actions
});