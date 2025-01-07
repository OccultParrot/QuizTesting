// cypress/e2e/quiz.e2e.cy.js

describe('Quiz Application E2E Test', () => {
  beforeEach(() => {
    // Intercept API calls and mock with fixture data
    cy.fixture('questions.json').as('questionsData');
    cy.intercept('GET', '**/questions', { fixture: 'questions.json' }).as('getQuestions');

    // Visit the app's base URL
    cy.visit('/');
  });

  it('should allow the user to take a quiz and restart it', () => {
    cy.get('button').contains('Start Quiz').should('be.visible').click(); // Start the quiz

    // Wait for questions to load
    cy.wait('@getQuestions');

    // Verify the first question and answer options are displayed
    cy.get('@questionsData').then((questions) => {
      questions.forEach((question, questionIndex) => {
        cy.get('h2').should('contain', question.question); // Verify question text

        question.answers.forEach((answer, index) => {
          cy.get('.alert').eq(index).should('contain', answer.text); // Verify each answer text
        });

        // Select the correct answer for each question
        const correctAnswerIndex = question.answers.findIndex((answer) => answer.isCorrect);
        cy.get('.btn-primary').eq(correctAnswerIndex).click();

        // If it's not the last question, verify the next question loads
        if (questionIndex < questions.length - 1) {
          cy.get('h2').should('contain', questions[questionIndex + 1].question);
        }
      });

      // Verify the quiz completion screen
      cy.get('h2').should('contain', 'Quiz Completed');
      cy.get('.alert-success').should('contain', `${questions.length}/${questions.length}`); // Full score

      // Restart the quiz
      cy.get('button').contains('Take New Quiz').click();
      cy.wait('@getQuestions');

      // Verify the first question appears again
      cy.get('h2').should('contain', questions[0].question);
      cy.get('.alert').should('have.length', questions[0].answers.length);
    });
  });

  it('should handle API errors gracefully', () => {
    // Simulate an API error
    cy.intercept('GET', '**/questions', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getQuestionsError');

    // Start quiz
    cy.get('button').contains('Start Quiz').click();
    cy.wait('@getQuestionsError');

    // Verify error handling (replace this with your error UI behavior)
    cy.get('div').should('contain', 'something went wrong!').and('be.visible');
  });
});
