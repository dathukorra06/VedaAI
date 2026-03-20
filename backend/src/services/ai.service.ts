import dotenv from 'dotenv';
dotenv.config();

export const generatePaper = async (assignment: any) => {
  const { title, subject, className, dueDate, questionTypes, additionalInfo, fileText } = assignment;

  // Build detailed section specification
  const sectionSpecs = (questionTypes || []).map((qt: any, i: number) => {
    const sectionLetter = String.fromCharCode(65 + i); // A, B, C...
    return `Section ${sectionLetter}: ${qt.type} — generate exactly ${qt.count} questions, each worth ${qt.marks} mark${qt.marks > 1 ? 's' : ''}`;
  }).join('\n');

  const totalQuestions = (questionTypes || []).reduce((sum: number, qt: any) => sum + Number(qt.count || 0), 0);
  const totalMarks = (questionTypes || []).reduce((sum: number, qt: any) => sum + (Number(qt.count || 0) * Number(qt.marks || 0)), 0);

  // Build the sections array structure the model must follow
  const sectionsStructure = (questionTypes || []).map((qt: any, i: number) => {
    const sectionLetter = String.fromCharCode(65 + i);
    const questionsArray = Array.from({ length: Number(qt.count) }, (_, qIdx) => {
      // Improved difficulty distribution logic
      let difficulty = "Moderate";
      const ratio = qIdx / Number(qt.count);
      if (ratio < 0.3) difficulty = "Easy";
      else if (ratio > 0.8) difficulty = "Challenging";

      return {
        id: qIdx + 1,
        text: `[GENERATE A ${difficulty.toUpperCase()} ${qt.type} QUESTION HERE]`,
        difficulty: difficulty,
        marks: Number(qt.marks),
        options: qt.type === "Multiple Choice Questions" ? ["[OPTION A]", "[OPTION B]", "[OPTION C]", "[OPTION D]"] : undefined
      };
    });

    return {
      id: sectionLetter,
      title: `Section ${sectionLetter}`,
      instruction: `Attempt all questions. Each question carries ${qt.marks} mark${Number(qt.marks) > 1 ? 's' : ''}.`,
      questionType: qt.type,
      questions: questionsArray
    };
  });

  const prompt = `You are a professional educational assessment designer with years of experience in creating curriculum-aligned question papers.
Your task is to generate a high-quality, comprehensive question paper based on the provided details and context.

ASSIGNMENT DETAILS:
- Title: ${title}
- Subject: ${subject}
- Target Grade/Class: ${className}
- Additional Context/Instructions: ${additionalInfo || 'Follow standard curriculum guidelines.'}

CONTEXT MATERIAL (Extracted from uploaded files or textbooks):
${fileText ? fileText.substring(0, 30000) : 'No reference material provided. Use general educational knowledge for the specified grade and subject.'}

MANDATORY SECTIONS AND STRUCTURE:
${sectionSpecs}

QUALITY & CONTENT RULES (CRITICAL):
1. MULTIPLE CHOICE OPTIONS: You MUST generate 4 distinct, contextually relevant, and plausible options (A, B, C, D) for each MCQ. DO NOT use generic placeholders like "Option A". Distractors must be realistic common misconceptions.
2. NUMERICAL PROBLEMS: For Numerical Problems, you MUST include realistic numerical values, proper mathematical units, and clear scenarios. Specify formulas where appropriate for the grade level.
3. UNIQUENESS: Every single question must be unique. DO NOT repeat the same concept, question phrasing, or logic within the paper.
4. HIGHER-ORDER THINKING (HOTS): For 'Challenging' questions and Short/Long Answer types, focus on analysis, evaluation, and synthesis. Do not just ask for direct recall of facts.
5. READABILITY: Use clear, unambiguous language appropriate for ${className} students. Ensure perfect grammar and punctuation.
6. DIFFICULTY: Strictly follow the Easy (~30%), Moderate (~50%), Challenging (~20%) distribution.

RESPONSE INSTRUCTIONS:
- You MUST return ONLY a raw JSON object. NO markdown, NO code fences, NO conversational text.
- Ensure the JSON is valid and matches the provided structure EXACTLY.

JSON TEMPLATE TO FILL:
${JSON.stringify({
  schoolName: "Delhi Public School, Sector-4, Bokaro",
  subject: subject,
  class: className,
  timeAllowed: totalMarks <= 20 ? "45 minutes" : totalMarks <= 40 ? "1.5 hours" : "3 hours",
  maxMarks: totalMarks,
  sections: sectionsStructure,
  answerKey: Array.from({ length: totalQuestions }, (_, i) => ({ id: i + 1, answer: `[PROVIDE DETAILED CORRECT ANSWER HERE]` }))
}, null, 2)}

Now, replace every bracketed placeholder (e.g., [GENERATE...], [OPTION...], [PROVIDE...]) with real, high-quality educational content. Ensure the "options" array for MCQs is fully populated with 4 distinct strings.`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // No API key — return a rich dummy paper
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn("GEMINI_API_KEY not set — returning demo paper with full questions.");
    return buildDummyPaper(subject, className, questionTypes, totalMarks);
  }

  // Try gemini-2.0-flash first, fall back to gemini-1.5-flash
  const models = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3, // Lower temperature for more consistent formatting
              maxOutputTokens: 16384, // Increased for longer papers
            }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        console.warn(`Model ${model} failed:`, errData?.error?.message);
        continue;
      }

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!raw) {
        console.warn(`Model ${model} returned empty response`);
        continue;
      }

      // Strip markdown code fences if present
      const clean = raw.replace(/^```(?:json)?\s*/gm, '').replace(/\s*```\s*$/gm, '').trim();

      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch (parseErr) {
        console.warn(`Failed to parse JSON from model ${model}. Attempting extraction...`);
        // Try to extract JSON object from the string more robustly
        const startIndex = clean.indexOf('{');
        const endIndex = clean.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          try {
            parsed = JSON.parse(clean.substring(startIndex, endIndex + 1));
          } catch (e2) {
             console.error("JSON extraction failed:", e2);
             continue;
          }
        } else {
          continue;
        }
      }

      // Validate the response has actual questions
      const hasQuestions = parsed?.sections?.some((s: any) => s?.questions?.length > 0);
      if (!hasQuestions) {
        console.warn(`Model ${model} returned sections with no questions — retrying...`);
        continue;
      }

      console.log(`✅ Successfully generated paper using ${model}`);
      return parsed;
    } catch (err: any) {
      console.warn(`Model ${model} threw error:`, err.message);
      continue;
    }
  }

  // All models failed — use rich dummy
  console.error("All Gemini models failed. Returning rich demo paper.");
  return buildDummyPaper(subject, className, questionTypes, totalMarks);
};

function buildDummyPaper(subject: string, className: string, questionTypes: any[], totalMarks: number) {
  const difficulties = ['Easy', 'Easy', 'Moderate', 'Moderate', 'Moderate', 'Challenging'];

  const sampleQuestions: Record<string, string[]> = {
    'Multiple Choice Questions': [
      `Which of the following best describes the core concept of ${subject}?`,
      `What is the primary unit used to measure the fundamental quantity in ${subject}?`,
      `Which scientist is credited with the foundational law in ${subject}?`,
      `Which of the following is an example of a real-world application of ${subject}?`,
      `What happens when the key variable in ${subject} is doubled?`,
    ],
    'Short Answer Questions': [
      `Define the main concept of ${subject} in your own words.`,
      `Explain the significance of ${subject} in everyday life with an example.`,
      `What are the two main factors that affect the key process in ${subject}?`,
      `Describe one experiment that demonstrates a principle of ${subject}.`,
      `State the key law or principle that governs ${subject}.`,
    ],
    'Long Answer Questions': [
      `Explain in detail how the primary mechanism of ${subject} works, using a labeled diagram if necessary.`,
      `Discuss three real-world applications of ${subject} and explain how each one benefits society.`,
      `Compare and contrast two major theories in ${subject}, highlighting their similarities and differences.`,
      `Describe the historical development of ${subject} and how it has evolved over time.`,
    ],
    'Diagram/Graph-Based Questions': [
      `Draw a well-labeled diagram illustrating the main process in ${subject}.`,
      `Interpret the given graph and explain what trend it shows in the context of ${subject}.`,
      `Sketch and label the key components involved in the main mechanism of ${subject}.`,
    ],
    'Numerical Problems': [
      `A student measures a key quantity in ${subject} and gets a value of 50 units. If the measurement doubles, calculate the new value and explain the change.`,
      `Using the fundamental formula in ${subject}, calculate the result when the primary variable is 15 and the secondary variable is 4.`,
      `Solve: If process A takes 3 units and process B takes 7 units in ${subject}, what is the combined effect?`,
    ],
  };

  const sections = (questionTypes || []).map((qt: any, i: number) => {
    const sectionLetter = String.fromCharCode(65 + i);
    const bank = sampleQuestions[qt.type] || sampleQuestions['Short Answer Questions'];
    const questions = Array.from({ length: Number(qt.count) }, (_, qIdx) => {
      const text = bank[qIdx % bank.length];
      let options: string[] | undefined = undefined;
      
      if (qt.type === "Multiple Choice Questions") {
          // Semi-realistic dummy options based on question context
          if (text.includes('unit')) options = ["Newton", "Joule", "Pascal", "Kilogram"];
          else if (text.includes('scientist')) options = ["Isaac Newton", "Albert Einstein", "Marie Curie", "Nikola Tesla"];
          else if (text.includes('application')) options = ["Industrial Manufacturing", "Medical Diagnostics", "Space Exploration", "Agricultural Tech"];
          else options = ["Concept Analysis", "Practical Execution", "Theoretical Logic", "Systematic Review"];
      }

      return {
        id: qIdx + 1,
        text: text,
        difficulty: difficulties[qIdx % difficulties.length],
        marks: Number(qt.marks),
        options
      };
    });
    return {
      id: sectionLetter,
      title: `Section ${sectionLetter}`,
      instruction: `Attempt all questions. Each question carries ${qt.marks} mark${Number(qt.marks) > 1 ? 's' : ''}.`,
      questionType: qt.type,
      questions,
    };
  });

  const answerKey: { id: number; answer: string }[] = [];
  let qCounter = 1;
  sections.forEach((sec: any) => {
    sec.questions.forEach((q: any) => {
      answerKey.push({ id: qCounter++, answer: `Refer to ${subject} textbook, Chapter relevant to question ${q.id} in Section ${sec.id}.` });
    });
  });

  return {
    schoolName: "Delhi Public School, Sector-4, Bokaro",
    subject,
    class: className,
    timeAllowed: totalMarks <= 20 ? "45 minutes" : totalMarks <= 40 ? "1.5 hours" : "3 hours",
    maxMarks: totalMarks,
    sections,
    answerKey,
  };
}
