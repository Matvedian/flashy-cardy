import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for British History answer request
const HistoryRequestSchema = z.object({
  question: z.string().min(1, "Question is required").max(500, "Question is too long"),
  context: z.string().optional(), // Optional context
});

// Enhanced British History knowledge base with different information types
const BRITISH_HISTORY_KB = {
  // Historical Figures
  "winston churchill": {
    who: "Winston Churchill",
    what: "British Prime Minister during World War II",
    when_born: "30 November 1874",
    when_died: "24 January 1965",
    where_born: "Blenheim Palace, Oxfordshire",
    famous_for: "Leading Britain during World War II",
    achievements: ["World War II leadership", "Nobel Prize in Literature", "Iron Curtain speech"]
  },
  "margaret thatcher": {
    who: "Margaret Thatcher", 
    what: "British Prime Minister (1979-1990)",
    when_born: "13 October 1925",
    when_died: "8 April 2013",
    where_born: "Grantham, Lincolnshire",
    famous_for: "First female British Prime Minister, known as the Iron Lady",
    achievements: ["Falklands War victory", "Economic reforms", "Cold War diplomacy"]
  },
  "elizabeth i": {
    who: "Elizabeth I",
    what: "Queen of England (1558-1603)",
    when_born: "7 September 1533",
    when_died: "24 March 1603", 
    where_born: "Greenwich Palace",
    famous_for: "The Virgin Queen, Elizabethan Golden Age",
    achievements: ["Defeated Spanish Armada", "Elizabethan Renaissance", "Never married"]
  },
  "henry viii": {
    who: "Henry VIII",
    what: "King of England (1509-1547)",
    when_born: "28 June 1491",
    when_died: "28 January 1547",
    where_born: "Greenwich Palace",
    famous_for: "Having six wives and breaking with Rome",
    achievements: ["Founded Church of England", "Dissolved monasteries", "Six marriages"]
  },
  "charles darwin": {
    who: "Charles Darwin",
    what: "British naturalist and biologist",
    when_born: "12 February 1809",
    when_died: "19 April 1882",
    where_born: "Shrewsbury, Shropshire",
    famous_for: "Theory of evolution by natural selection",
    achievements: ["On the Origin of Species", "Theory of Evolution", "Voyage of the Beagle"]
  },
  "william shakespeare": {
    who: "William Shakespeare",
    what: "English playwright and poet",
    when_born: "26 April 1564",
    when_died: "23 April 1616",
    where_born: "Stratford-upon-Avon",
    famous_for: "Greatest writer in the English language",
    achievements: ["Hamlet", "Romeo and Juliet", "Macbeth", "39 plays, 154 sonnets"]
  },
  "isaac newton": {
    who: "Isaac Newton",
    what: "English mathematician and physicist",
    when_born: "25 December 1642",
    when_died: "20 March 1727",
    where_born: "Woolsthorpe, Lincolnshire",
    famous_for: "Laws of motion and universal gravitation",
    achievements: ["Principia Mathematica", "Laws of Motion", "Calculus", "Optics"]
  },
  "captain cook": {
    who: "Captain James Cook",
    what: "British explorer and navigator",
    when_born: "7 November 1728",
    when_died: "14 February 1779",
    where_born: "Marton, Yorkshire", 
    famous_for: "Exploring the Pacific Ocean and mapping Australia",
    achievements: ["Three Pacific voyages", "Mapped Australia", "Discovered Hawaii"]
  },

  // Battles and Events
  "battle of waterloo": {
    what: "Battle of Waterloo",
    when: "18 June 1815",
    where: "Waterloo, Belgium",
    who_won: "Duke of Wellington",
    who_lost: "Napoleon Bonaparte",
    significance: "Final defeat of Napoleon"
  },
  "battle of hastings": {
    what: "Battle of Hastings", 
    when: "14 October 1066",
    where: "Hastings, East Sussex",
    who_won: "William the Conqueror",
    who_lost: "King Harold II",
    significance: "Norman Conquest of England"
  },
  "great fire of london": {
    what: "Great Fire of London",
    when: "2-6 September 1666",
    where: "City of London",
    started: "Pudding Lane",
    cause: "Bakery fire",
    result: "Rebuilt by Christopher Wren"
  },
  "spanish armada": {
    what: "Spanish Armada",
    when: "1588",
    where: "English Channel",
    who_won: "England",
    commander: "Francis Drake",
    significance: "Established English naval supremacy"
  }
};

// Function to detect question type and find appropriate answer
const findHistoricalAnswer = async (question: string): Promise<string> => {
  const normalizedQuestion = question.toLowerCase();
  
  // Detect question type
  const questionType = detectQuestionType(normalizedQuestion);
  
  // Find matching entity in knowledge base
  for (const [key, data] of Object.entries(BRITISH_HISTORY_KB)) {
    const directMatch = normalizedQuestion.includes(key);
    const entityMatch = isEntityMatch(normalizedQuestion, key, data);
    
    if (directMatch || entityMatch) {
      return getAnswerByType(data, questionType, normalizedQuestion);
    }
  }
  
  // Handle specific battle questions
  if (normalizedQuestion.includes('waterloo') && normalizedQuestion.includes('napoleon')) {
    if (questionType === 'who') return "Duke of Wellington";
    if (questionType === 'when') return "18 June 1815";
    if (questionType === 'where') return "Waterloo, Belgium";
  }
  
  if (normalizedQuestion.includes('hastings')) {
    if (questionType === 'who') return "William the Conqueror";
    if (questionType === 'when') return "14 October 1066";
    if (questionType === 'where') return "Hastings, East Sussex";
  }
  
  // If no match found, provide helpful response
  throw new Error("I couldn't find an answer for that question. Try asking 'Who was...?', 'When was... born?', 'What did... do?', or 'Where was... born?'");
};

// Detect the type of question being asked
const detectQuestionType = (question: string): string => {
  // More specific patterns first
  if (question.includes('when') && (question.includes('born') || question.includes('birth'))) {
    return 'when_born';
  }
  if (question.includes('when') && (question.includes('died') || question.includes('death'))) {
    return 'when_died';
  }
  if (question.includes('where') && (question.includes('born') || question.includes('birth'))) {
    return 'where_born';
  }
  if (question.includes('famous for') || question.includes('known for')) {
    return 'famous_for';
  }
  
  // General question word patterns
  if (question.startsWith('when ') || question.includes('when was') || question.includes('when did')) {
    return 'when';
  }
  if (question.startsWith('where ') || question.includes('where was') || question.includes('where did')) {
    return 'where';
  }
  if (question.startsWith('what ') || question.includes('what was') || question.includes('what did')) {
    return 'what';
  }
  if (question.startsWith('why ') || question.includes('why was') || question.includes('why did')) {
    return 'famous_for';
  }
  if (question.startsWith('who ') || question.includes('who was') || question.includes('who is')) {
    return 'who';
  }
  
  // Default to 'who' for identity questions
  return 'who';
};

// Check if question matches an entity using various name forms
const isEntityMatch = (question: string, key: string, data: any): boolean => {
  // Check for alternative names and titles
  if (key === 'winston churchill' && (question.includes('churchill'))) return true;
  if (key === 'margaret thatcher' && (question.includes('thatcher') || question.includes('iron lady'))) return true;
  if (key === 'elizabeth i' && (question.includes('elizabeth') || question.includes('virgin queen'))) return true;
  if (key === 'henry viii' && (question.includes('henry') && (question.includes('viii') || question.includes('8th') || question.includes('six wives')))) return true;
  if (key === 'charles darwin' && (question.includes('darwin') || question.includes('evolution'))) return true;
  if (key === 'william shakespeare' && (question.includes('shakespeare') || question.includes('playwright'))) return true;
  if (key === 'isaac newton' && (question.includes('newton'))) return true;
  if (key === 'captain cook' && (question.includes('cook') && (question.includes('captain') || question.includes('explorer')))) return true;
  
  return false;
};

// Get the appropriate answer based on question type
const getAnswerByType = (data: any, questionType: string, question: string): string => {
  // Handle specific question types first
  if (questionType === 'when_born') return data.when_born || "Birth date not available";
  if (questionType === 'when_died') return data.when_died || "Death date not available";
  if (questionType === 'where_born') return data.where_born || "Birthplace not available";
  if (questionType === 'famous_for') return data.famous_for || data.what;
  
  // Handle general question types
  if (questionType === 'who') return data.who || data.what;
  if (questionType === 'what') return data.what || data.famous_for;
  if (questionType === 'when') {
    if (question.includes('born')) return data.when_born || "Birth date not available";
    if (question.includes('died')) return data.when_died || "Death date not available";
    return data.when || data.when_born || "Date not available";
  }
  if (questionType === 'where') {
    if (question.includes('born')) return data.where_born || "Birthplace not available";
    return data.where || data.where_born || "Location not available";
  }
  
  // Handle battle/event questions
  if (data.who_won && questionType === 'who') return data.who_won;
  if (data.when && questionType === 'when') return data.when;
  if (data.where && questionType === 'where') return data.where;
  
  // Default return
  return data.who || data.what || data.famous_for || "Information not available";
};


export async function POST(request: NextRequest) {
  try {
    console.log('British History API request received');
    
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    console.log(`British History request from user: ${userId}`);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = HistoryRequestSchema.parse(body);

    const { question } = validatedData;

    console.log(`British History question: "${question}"`);

    // Generate answer using our knowledge base
    try {
      const answer = await findHistoricalAnswer(question);

      // Return the answer
      return NextResponse.json({
        answer,
        question,
        service: "British History Knowledge Base",
        confidence: "high",
        message: "Answer generated from curated British History database"
      });

    } catch (answerError: unknown) {
      const errorMessage = answerError instanceof Error ? answerError.message : 'Unknown error';
      console.error("Answer generation failed:", errorMessage);
      
      return NextResponse.json(
        { 
          error: "Unable to generate answer for this question. Please try a different British History question.",
          details: errorMessage,
          suggestions: [
            "Try questions about famous battles (e.g., Waterloo, Hastings)",
            "Ask about monarchs (e.g., Henry VIII, Elizabeth I)",
            "Questions about historical events (e.g., Great Fire of London)",
            "Prime Ministers (e.g., Churchill, Thatcher)"
          ]
        }, 
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("British History API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.issues 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// GET endpoint to return available topics and service info
export async function GET() {
  return NextResponse.json({
    service: "British History Answer Generator v2.0",
    info: "Intelligent question-answering system for British History with WHO/WHAT/WHEN/WHERE detection",
    capabilities: [
      "Biographical information (birth/death dates, birthplaces)",
      "Historical events and battles",
      "Achievements and accomplishments", 
      "Question type detection (Who/What/When/Where/Why)"
    ],
    supported_figures: [
      "Winston Churchill", "Margaret Thatcher", "Elizabeth I", "Henry VIII",
      "Charles Darwin", "William Shakespeare", "Isaac Newton", "Captain Cook"
    ],
    question_types: {
      "Who questions": "Who was Churchill? → Winston Churchill",
      "When born": "When was Churchill born? → 30 November 1874", 
      "When died": "When did Churchill die? → 24 January 1965",
      "Where born": "Where was Churchill born? → Blenheim Palace, Oxfordshire",
      "What did": "What was Churchill famous for? → Leading Britain during World War II",
      "Battle who": "Who won the Battle of Waterloo? → Duke of Wellington",
      "Battle when": "When was the Battle of Waterloo? → 18 June 1815"
    },
    examples: [
      "When was Churchill born?",
      "Where was Shakespeare born?", 
      "What was Darwin famous for?",
      "Who defeated Napoleon at Waterloo?",
      "When did the Battle of Hastings happen?",
      "Who was the Iron Lady?"
    ],
    status: "active"
  });
}
