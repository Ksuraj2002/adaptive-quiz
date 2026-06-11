"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";


interface QuestionStructure {
  id: number;
  diff: number;
  ques: string;
  op1: string; 
  op2: string;
  op3: string;
  op4: string;
  correct: string;
}

export default function AdaptiveQuizEngine() {
  const [question, setQuestion] = useState<QuestionStructure | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentDiff, setCurrentDiff] = useState<number>(1);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const router = useRouter();


  const fetchNextQuestion = async (wasCorrect?: boolean) => {
    setLoading(true);
    setSelectedOption(null);
    setHasSubmitted(false);

    try {

      const saved_email = localStorage.getItem("loggedInEmail");
      // 1. Point to your local FastAPI Python server running on port 8000
      let url = `/api/ques?email=${saved_email}&cur_diff=${currentDiff}`;
      if (wasCorrect !== undefined) {
        url += `&was_cor=${wasCorrect}`;
      }

      // 2. Switched from fetch() to axios.get()
      const response = await api.get(url);



      // Axios automatically unwraps the payload container directly into response.data
      const data = response.data;

      if(data.status === "complete"){
        setQuizComplete(true);
        setMessage(data.message);
      }else if(data.error){
        setMessage(data.error);
      }else {
        setQuestion(data);
        setCurrentDiff(data.diff);
      }

      // console.log("🚨 BACKEND RESPONSE:", data);

      // if (data.error) {
      //   console.error("Backend reported an error:", data.error);
      //   setQuestion(null);
      //   return;
      // }

      // if (data.status === "complete") {
      //   console.log("Quiz Complete!");
      //   setQuestion(null);
      //   return;
      // }

      
      

    } catch (err) {
      console.error("Axios network pipeline request error: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe initial layout mount tracking
  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const handleValidationStep = () => {
    if (!selectedOption) return;
    setHasSubmitted(true);
  };

  const handleNextTransition = async () => {
    // Determine if the selected option is correct
    const isCorrect = selectedOption === question?.correct  ;

    const email = localStorage.getItem("loggedInEmail");

    try{
      await api.post("/api/save-attempt", {
        email: email,
        ques_id: question?.id,
      
      })

      // Fetch next question and pass whether the answer was correct
      fetchNextQuestion(isCorrect);

    }catch(error){
      console.error("Error saving attempt or fetching next question: ", error);
    }
    
    
  };
  

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
        
        {/* 1. 🎓 THE NEW TRIUMPH GATEWAY CARD */}
        {quizComplete ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: "50px", marginBottom: "16px" }}>🎓🎉</div>
            <h2 style={{ fontSize: "24px", color: "#2d3748", marginBottom: "12px", fontWeight: "bold" }}>
              Quiz Completed!
            </h2>
            <p style={{ fontSize: "16px", color: "#4a5568", lineHeight: "1.6", marginBottom: "28px" }}>
              {message || "Congratulations! You have cleared all the levels perfectly!"}
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#3182ce",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(49, 130, 206, 0.2)"
              }}
            >
              Log Out 
            </button>
          </div>
        ) : loading ? (
          <p style={{ textAlign: "center", color: "#4a5568" }}>Loading question...</p>
        ) : question ? (
          <div>
            {/* Metadata Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ color: "#718096", fontSize: "14px" }}>Question Ref: #{question.id}</span>
              <span style={{
                padding: "6px 12px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "bold",
                backgroundColor: "#edf2f7", // Fallback default background tag color
                color: "#2d3748"
              }}>
                Level {question.diff}
              </span>
            </div>
  
            {/* Prompt */}
            <h2 style={{ fontSize: "20px", color: "#1a202c", marginBottom: "24px" }}>{question.ques}</h2>
  
            {/* Options Layout (Fixed Order: op1 always renders first) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[question.op1, question.op2, question.op3, question.op4].map((option, idx) => {
                let backgroundColor = "#ffffff";
                let borderColor = "#e2e8f0";
  
                if (selectedOption === option) {
                  borderColor = "#3182ce";
                  backgroundColor = "#ebf8ff";
                }
  
                if (hasSubmitted) {
                  if (option === question.correct) {
                    backgroundColor = "#c6f6d5"; // Green highlighting for correct answer row
                    borderColor = "#38a169";
                  } else if (selectedOption === option) {
                    backgroundColor = "#fed7d7"; // Red highlighting for faulty user input choices
                    borderColor = "#e53e3e";
                  }
                }
  
                return (
                  <button
                    key={idx}
                    disabled={hasSubmitted}
                    onClick={() => setSelectedOption(option)}
                    style={{
                      padding: "14px 20px",
                      textAlign: "left",
                      borderRadius: "10px",
                      border: `2px solid ${borderColor}`,
                      backgroundColor,
                      cursor: hasSubmitted ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      width: "100%",
                      transition: "all 0.1s ease"
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
  
            {/* Action Buttons */}
            {!hasSubmitted ? (
              <button
                onClick={handleValidationStep}
                disabled={!selectedOption}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: selectedOption ? "#3182ce" : "#e2e8f0",
                  color: selectedOption ? "#fff" : "#a0aec0",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: selectedOption ? "pointer" : "not-allowed"
                }}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextTransition}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: selectedOption === question.correct ? "#38a169" : "#e53e3e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {selectedOption === question.correct ? "Correct! Next Level" : "Incorrect! Reset Level"}
              </button>
            )}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#e53e3e" }}>
            {message || "No question data stream available."}
          </p>
        )}
      </div>
    </div>
  );
}