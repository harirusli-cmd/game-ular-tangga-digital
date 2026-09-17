import { Question, ClassLevel, Difficulty } from '../types';
import { StorageService } from './storage';

export class QuestionEngine {
  private usedQuestionIds: Set<string> = new Set();

  public resetUsedQuestions() {
    this.usedQuestionIds.clear();
  }

  public getNextQuestion(
    classLevel: ClassLevel,
    preferredDifficulty?: Difficulty,
    preferredTopic?: string
  ): Question {
    const allQuestions = StorageService.getQuestions().filter(q => q.active);

    // 1. Filter by class level
    let candidates = allQuestions.filter(q => q.classLevel === classLevel);

    // If no questions found for this class level, fallback to any available or generated
    if (candidates.length === 0) {
      return this.generateFallbackQuestion(classLevel);
    }

    // 2. Filter out already used questions in this game session
    let available = candidates.filter(q => !this.usedQuestionIds.has(q.id));

    // If all used up, reset session tracking for this class
    if (available.length === 0) {
      candidates.forEach(q => this.usedQuestionIds.delete(q.id));
      available = candidates;
    }

    // 3. Match preferred topic if given
    if (preferredTopic) {
      const topicMatches = available.filter(q => q.topic.toLowerCase().includes(preferredTopic.toLowerCase()));
      if (topicMatches.length > 0) {
        available = topicMatches;
      }
    }

    // 4. Match preferred difficulty if given
    if (preferredDifficulty) {
      const diffMatches = available.filter(q => q.difficulty === preferredDifficulty);
      if (diffMatches.length > 0) {
        available = diffMatches;
      }
    }

    // Pick random
    const selected = available[Math.floor(Math.random() * available.length)];
    this.usedQuestionIds.add(selected.id);
    return selected;
  }

  public validateAnswer(question: Question, userAnswer: string): boolean {
    const cleanUser = userAnswer.trim().toLowerCase();
    const cleanCorrect = question.correctAnswer.trim().toLowerCase();

    if (question.type === 'number_input') {
      // Numerical comparison (allowing e.g. "0.75" vs "0,75" or integer matches)
      const numUser = parseFloat(cleanUser.replace(',', '.'));
      const numCorrect = parseFloat(cleanCorrect.replace(',', '.'));
      if (!isNaN(numUser) && !isNaN(numCorrect)) {
        return Math.abs(numUser - numCorrect) < 0.0001;
      }
      return cleanUser === cleanCorrect;
    }

    return cleanUser === cleanCorrect;
  }

  private generateFallbackQuestion(classLevel: ClassLevel): Question {
    const numA = Math.floor(Math.random() * 8) + 2;
    const numB = Math.floor(Math.random() * 8) + 2;

    if (classLevel <= 2) {
      const sum = numA + numB;
      return {
        id: `gen_add_${Date.now()}`,
        classLevel,
        topic: 'Penjumlahan',
        question: `Berapakah hasil dari ${numA} + ${numB} = ?`,
        type: 'multiple_choice',
        options: [
          { id: 'a', text: `${sum}` },
          { id: 'b', text: `${sum + 1}` },
          { id: 'c', text: `${Math.max(1, sum - 1)}` },
          { id: 'd', text: `${sum + 2}` }
        ].sort(() => Math.random() - 0.5),
        correctAnswer: 'a',
        explanation: `${numA} + ${numB} = ${sum}.`,
        difficulty: 'mudah',
        active: true
      };
    } else {
      const prod = numA * numB;
      return {
        id: `gen_mul_${Date.now()}`,
        classLevel,
        topic: 'Perkalian',
        question: `Berapakah hasil dari ${numA} × ${numB} = ?`,
        type: 'multiple_choice',
        options: [
          { id: 'a', text: `${prod}` },
          { id: 'b', text: `${prod + 4}` },
          { id: 'c', text: `${Math.max(1, prod - 3)}` },
          { id: 'd', text: `${prod + 6}` }
        ].sort(() => Math.random() - 0.5),
        correctAnswer: 'a',
        explanation: `${numA} × ${numB} = ${prod} (penjumlahan ${numB} sebanyak ${numA} kali).`,
        difficulty: 'sedang',
        active: true
      };
    }
  }
}

export const questionEngine = new QuestionEngine();
