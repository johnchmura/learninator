from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import List

app = FastAPI()

# Enable CORS - must be added BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int
    
    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) != 4:
            raise ValueError('Must have exactly 4 options')
        return v
    
    @field_validator('correctAnswer')
    @classmethod
    def validate_correct_answer(cls, v):
        if v < 0 or v > 3:
            raise ValueError('correctAnswer must be between 0 and 3')
        return v

class QuizData(BaseModel):
    questions: List[QuizQuestion]

class SubmitAnswers(BaseModel):
    answers: List[int]
    questions: List[QuizQuestion]

@app.get("/")
def read_root():
    return {"message": "Quiz API is running"}

@app.post("/api/quiz/validate")
def validate_quiz(quiz_data: QuizData):
    """Validate the quiz JSON structure"""
    try:
        return {
            "valid": True,
            "questionCount": len(quiz_data.questions),
            "message": f"Quiz validated successfully with {len(quiz_data.questions)} questions"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/quiz/submit")
def submit_quiz(submission: SubmitAnswers):
    """Calculate the final score"""
    if len(submission.answers) != len(submission.questions):
        raise HTTPException(
            status_code=400, 
            detail="Number of answers must match number of questions"
        )
    
    correct_count = 0
    results = []
    
    for idx, (answer, question) in enumerate(zip(submission.answers, submission.questions)):
        is_correct = answer == question.correctAnswer
        if is_correct:
            correct_count += 1
        
        results.append({
            "questionIndex": idx,
            "question": question.question,
            "userAnswer": answer,
            "correctAnswer": question.correctAnswer,
            "isCorrect": is_correct
        })
    
    total_questions = len(submission.questions)
    percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    return {
        "score": correct_count,
        "total": total_questions,
        "percentage": round(percentage, 2),
        "results": results
    }

