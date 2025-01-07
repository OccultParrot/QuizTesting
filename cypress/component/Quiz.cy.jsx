// cypress/component/Quiz.cy.jsx
import React from 'react';


import Quiz from '../../client/src/components/Quiz'

describe('Quiz Component', () => {
  beforeEach(() => {
    // Load the fixture before each test
    cy.fixture('questions.json').as('questionsData')

    // Mount the Quiz component
    cy.mount(<Quiz />)

    // Intercept API calls and return fixture data
    cy.intercept('GET', '**/questions', { fixture: 'questions.json' }).as('getQuestions')
  });

  it('should display start quiz button initially', () => {
    cy.get('button').contains('Start Quiz').should('be.visible')
  });

  it('should show loading state when starting quiz', () => {
    cy.get('button').contains('Start Quiz').click()
    cy.get('[role="status"]').should('be.visible')
    cy.wait('@getQuestions')
  });

  it('should display quiz questions after loading', () => {
    cy.get('@questionsData').then((questions) => {
      cy.get('button').contains('Start Quiz').click()
      cy.wait('@getQuestions')

      cy.get('h2').should('contain', questions[0].question)
      questions[0].answers.forEach((answer, index) => {
        cy.get('.alert').eq(index).should('contain', answer.text)
      })
    })
  });

  it('should progress through questions when answering', () => {
    cy.get('@questionsData').then((questions) => {
      cy.get('button').contains('Start Quiz').click()
      cy.wait('@getQuestions')

      // Answer first question
      cy.get('.btn-primary').first().click()

      // Should show second question
      cy.get('h2').should('contain', questions[1].question)
    })
  });

  it('should display final score when quiz is completed', () => {
    cy.get('@questionsData').then((questions) => {
      cy.get('button').contains('Start Quiz').click()
      cy.wait('@getQuestions')

      // Answer all questions
      questions.forEach(() => {
        cy.get('.btn-primary').first().click()
      })

      // Should show completion screen
      cy.get('h2').should('contain', 'Quiz Completed')
      cy.get('.alert-success').should('contain', `/${questions.length}`)
    })
  });

  it('should allow starting a new quiz after completion', () => {
    cy.get('@questionsData').then((questions) => {
      cy.get('button').contains('Start Quiz').click()
      cy.wait('@getQuestions')

      // Complete the quiz
      questions.forEach(() => {
        cy.get('.btn-primary').first().click()
      })

      // Start new quiz
      cy.get('button').contains('Take New Quiz').click()
      cy.wait('@getQuestions')

      // Should show first question again
      cy.get('h2').should('contain', questions[0].question)
      cy.get('.alert').should('have.length', questions[0].answers.length)
    })
  });

  it('should handle API errors gracefully', () => {
    // Override the intercept to simulate an error
    cy.intercept('GET', '**/questions', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('getQuestionsError')

    cy.get('button').contains('Start Quiz').click()
    cy.wait('@getQuestionsError')

    // Should show loading state
    cy.get('[role="status"]').should('be.visible')
  });

  it('should track score correctly', () => {
    cy.get('@questionsData').then((questions) => {
      cy.get('button').contains('Start Quiz').click()
      cy.wait('@getQuestions')

      // Click first correct answer in each question
      questions.forEach((question) => {
        const correctAnswerIndex = question.answers.findIndex(answer => answer.isCorrect)
        cy.get('.btn-primary').eq(correctAnswerIndex).click()
      })

      // Should show full score
      cy.get('.alert-success').should('contain', `${questions.length}/${questions.length}`)
    })
  });
});
